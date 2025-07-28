<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\ParticipantAnswer;
use App\Models\Question;
use App\Models\LeaderboardEntry;
use App\Events\SessionStarted;
use App\Events\SessionEnded;
use App\Events\QuestionDisplayed;
use App\Events\AnswersRevealed;
use App\Events\ParticipantJoined;
use App\Events\ParticipantLeft;
use App\Events\LeaderboardUpdated;
use App\Services\ScoringService;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class QuizSessionController extends Controller
{
    protected ScoringService $scoringService;
    protected QRCodeService $qrCodeService;

    public function __construct(ScoringService $scoringService, QRCodeService $qrCodeService)
    {
        $this->scoringService = $scoringService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Display active quiz sessions that participants can join.
     */
    public function activeSessions(): Response
    {
        $activeSessions = QuizSession::with(['quiz:id,title,description,creator_id', 'quiz.creator:id,name'])
            ->whereIn('status', ['waiting', 'active'])
            ->where('created_at', '>', now()->subHours(3)) // Only recent sessions
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($session) {
                return [
                    'id' => $session->id,
                    'code' => $session->code,
                    'status' => $session->status,
                    'participants_count' => $session->participants()->count(),
                    'max_participants' => $session->max_participants,
                    'created_at' => $session->created_at,
                    'quiz' => [
                        'id' => $session->quiz->id,
                        'title' => $session->quiz->title,
                        'description' => $session->quiz->description,
                        'creator' => [
                            'id' => $session->quiz->creator->id,
                            'name' => $session->quiz->creator->name,
                        ]
                    ]
                ];
            });

        return Inertia::render('sessions/active', [
            'sessions' => $activeSessions,
        ]);
    }
    /**
     * Create a new quiz session.
     */
    public function create(Request $request, string $quizId): RedirectResponse
    {
        $quiz = Quiz::findOrFail($quizId);
        
        // Check if user can create sessions for this quiz
        $user = $request->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à créer une session pour ce quiz.');
        }
        
        $validated = $request->validate([
            'session_type' => 'required|in:classic,battle_royale,tournament',
            'max_participants' => 'nullable|integer|min:2|max:100',
            'settings' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $sessionCode = $this->generateUniqueSessionCode();
            
            $session = QuizSession::create([
                'quiz_id' => $quiz->id,
                'code' => $sessionCode,
                'presenter_id' => $user->id,
                'status' => 'waiting',
                'session_type' => $validated['session_type'],
                'max_participants' => $validated['max_participants'] ?? 50,
                'settings' => $validated['settings'] ?? [],
                'join_url' => url("/join/{$sessionCode}"),
            ]);
            
            // Generate QR code for the session
            $qrCodePath = $this->qrCodeService->generateSessionQRCode($session);
            $session->update(['qr_code_path' => $qrCodePath]);
            
            DB::commit();
            
            return redirect()->route('quiz.session.waiting-room', ['code' => $sessionCode])
                ->with('success', 'Session créée avec succès !');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la création de la session.']);
        }
    }

    /**
     * Show waiting room for a quiz session.
     */
    public function waitingRoom(string $code): Response
    {
        $session = QuizSession::with(['quiz.questions', 'participants'])
            ->where('code', $code)
            ->firstOrFail();
        
        if ($session->status === 'completed') {
            return redirect()->route('quiz.session.results', ['code' => $code]);
        }
        
        if ($session->status === 'active') {
            return redirect()->route('quiz.session.play', ['code' => $code]);
        }
        
        $user = request()->user();
        $isPresenter = $session->presenter_id === $user?->id || $user?->role === 'admin';
        
        // Get current participant
        $currentParticipant = null;
        if ($user) {
            $currentParticipant = $session->participants()->where('user_id', $user->id)->first();
        } elseif (session('participant_id')) {
            $currentParticipant = $session->participants()->find(session('participant_id'));
        }
        
        // Get participants list for display
        $participantsList = $session->participants->map(function($participant) {
            return [
                'id' => $participant->id,
                'nickname' => $participant->nickname,
                'avatar' => $participant->avatar,
                'joined_at' => $participant->joined_at,
                'is_ready' => true, // Could add ready status later
            ];
        });
        
        return Inertia::render('quiz-session/waiting-room', [
            'session' => [
                'id' => $session->id,
                'code' => $session->code,
                'status' => $session->status,
                'session_type' => $session->session_type,
                'max_participants' => $session->max_participants,
                'join_url' => $session->join_url ?? url("/join/{$session->code}"),
                'qr_code_path' => $session->qr_code_path,
                'quiz' => [
                    'id' => $session->quiz->id,
                    'title' => $session->quiz->title,
                    'description' => $session->quiz->description,
                    'total_questions' => $session->quiz->questions()->count(),
                ],
            ],
            'participants' => $participantsList,
            'currentParticipant' => $currentParticipant ? [
                'id' => $currentParticipant->id,
                'nickname' => $currentParticipant->nickname,
                'avatar' => $currentParticipant->avatar,
            ] : null,
            'isPresenter' => $isPresenter,
            'canStart' => $isPresenter && 
                         $session->participants->count() > 0 && 
                         $session->quiz->questions()->count() > 0,
            'stats' => [
                'participants_count' => $session->participants()->count(),
                'max_participants' => $session->max_participants,
                'questions_count' => $session->quiz->questions()->count(),
            ],
        ]);
    }

    /**
     * Join a quiz session (for participants).
     */
    public function join(string $code): Response
    {
        $session = QuizSession::with(['quiz', 'participants'])
            ->where('code', $code)
            ->firstOrFail();
        
        // Check if session is joinable
        if (!in_array($session->status, ['waiting', 'active'])) {
            abort(404, 'Cette session n\'est plus disponible.');
        }
        
        // Check if session is full
        if ($session->participants()->count() >= $session->max_participants) {
            abort(403, 'Cette session est complète.');
        }
        
        return Inertia::render('quiz/join', [
            'sessionCode' => $code,
            'session' => [
                'id' => $session->id,
                'code' => $session->code,
                'quiz' => [
                    'title' => $session->quiz->title,
                    'description' => $session->quiz->description,
                ],
                'participants_count' => $session->participants()->count(),
                'max_participants' => $session->max_participants,
                'status' => $session->status,
            ],
        ]);
    }

    /**
     * Store participant in session.
     */
    public function storeParticipant(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'pseudo' => 'required|string|max:50',
            'avatar_preference' => 'nullable|in:random,custom',
        ]);

        $session = QuizSession::where('code', $code)->firstOrFail();
        
        // Check if session is still joinable
        if (!in_array($session->status, ['waiting', 'active'])) {
            return back()->withErrors(['error' => 'Cette session n\'est plus disponible.']);
        }
        
        if ($session->participants()->count() >= $session->max_participants) {
            return back()->withErrors(['error' => 'Cette session est complète.']);
        }
        
        DB::beginTransaction();
        try {
            // Check if user already has a participant in this session
            $user = $request->user();
            $existingParticipant = null;
            
            if ($user) {
                $existingParticipant = $session->participants()->where('user_id', $user->id)->first();
            }
            
            if (!$existingParticipant) {
                // Generate avatar if needed
                $avatar = null;
                if ($validated['avatar_preference'] === 'random') {
                    $avatars = ['👤', '🎭', '🎪', '🎨', '🎯', '🎲', '🎮', '🎸', '🎺', '🎻'];
                    $avatar = $avatars[array_rand($avatars)];
                }
                
                $participant = Participant::create([
                    'quiz_session_id' => $session->id,
                    'user_id' => $user?->id,
                    'nickname' => $validated['pseudo'],
                    'avatar' => $avatar,
                    'joined_at' => now(),
                    'score' => 0,
                ]);
                
                // Store participant ID in session for guests
                if (!$user) {
                    session(['participant_id' => $participant->id]);
                }
                
                // Broadcast participant joined
                broadcast(new ParticipantJoined($session, $participant))->toOthers();
            }
            
            DB::commit();
            
            return redirect()->route('quiz.session.waiting-room', ['code' => $code]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la participation.']);
        }
    }

    /**
     * Start the quiz session.
     */
    public function start(string $code): JsonResponse
    {
        $session = QuizSession::with('quiz.questions')->where('code', $code)->firstOrFail();
        
        $user = request()->user();
        if ($session->presenter_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à démarrer cette session.');
        }
        
        if ($session->status !== 'waiting') {
            return response()->json(['error' => 'Cette session ne peut pas être démarrée.'], 400);
        }
        
        if ($session->participants->count() === 0) {
            return response()->json(['error' => 'Aucun participant dans la session.'], 400);
        }
        
        DB::beginTransaction();
        try {
            $session->update([
                'status' => 'active',
                'started_at' => now(),
                'current_question_index' => 0,
            ]);
            
            // Set first question as current
            $firstQuestion = $session->quiz->questions->first();
            if ($firstQuestion) {
                $session->update(['current_question_id' => $firstQuestion->id]);
            }
            
            // Broadcast session started
            broadcast(new SessionStarted($session))->toOthers();
            
            // Display first question
            if ($firstQuestion) {
                broadcast(new QuestionDisplayed($session, $firstQuestion, 30))->toOthers();
            }
            
            DB::commit();
            
            return response()->json(['success' => true, 'message' => 'Session démarrée !']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors du démarrage de la session.'], 500);
        }
    }

    /**
     * Show quiz playing interface.
     */
    public function play(string $code): Response
    {
        $session = QuizSession::with(['quiz.questions.answers', 'participants'])
            ->where('code', $code)
            ->firstOrFail();
        
        $user = request()->user();
        $isPresenter = $session->presenter_id === $user?->id || $user?->role === 'admin';
        
        // Get current participant
        $participant = null;
        if ($user) {
            $participant = $session->participants()->where('user_id', $user->id)->first();
        } elseif (session('participant_id')) {
            $participant = $session->participants()->find(session('participant_id'));
        }
        
        // Get current question
        $currentQuestion = null;
        if ($session->current_question_id) {
            $currentQuestion = Question::with('answers')->find($session->current_question_id);
        } elseif ($session->current_question_index !== null) {
            $currentQuestion = $session->quiz->questions()->skip($session->current_question_index)->first();
        }
        
        // Get leaderboard
        $leaderboard = $session->participants()
            ->orderBy('score', 'desc')
            ->orderBy('joined_at')
            ->get(['id', 'nickname', 'score', 'avatar']);
        
        return Inertia::render('quiz/play', [
            'session' => [
                'id' => $session->id,
                'code' => $session->code,
                'status' => $session->status,
                'current_question_index' => $session->current_question_index,
                'quiz' => [
                    'id' => $session->quiz->id,
                    'title' => $session->quiz->title,
                    'total_questions' => $session->quiz->questions()->count(),
                ],
            ],
            'currentQuestion' => $currentQuestion ? [
                'id' => $currentQuestion->id,
                'text' => $currentQuestion->text,
                'answers' => $currentQuestion->answers->map(function($answer) use ($isPresenter) {
                    return [
                        'id' => $answer->id,
                        'text' => $answer->text,
                        'is_correct' => $isPresenter ? $answer->is_correct : null,
                    ];
                }),
                'time_limit' => 30,
            ] : null,
            'participant' => $participant,
            'leaderboard' => $leaderboard,
            'isPresenter' => $isPresenter,
        ]);
    }

    /**
     * Submit answer for current question.
     */
    public function submitAnswer(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'answer_ids' => 'required|array',
            'response_time' => 'required|numeric|min:0',
        ]);

        $session = QuizSession::with('quiz.questions.answers')->where('code', $code)->firstOrFail();
        
        // Get participant
        $user = $request->user();
        $participant = null;
        if ($user) {
            $participant = $session->participants()->where('user_id', $user->id)->first();
        } elseif (session('participant_id')) {
            $participant = $session->participants()->find(session('participant_id'));
        }
        
        if (!$participant) {
            return response()->json(['error' => 'Participant non trouvé.'], 404);
        }
        
        // Check if question exists and is current
        $question = Question::with('answers')->find($validated['question_id']);
        if (!$question || $session->current_question_id !== $question->id) {
            return response()->json(['error' => 'Question non valide.'], 400);
        }
        
        // Check if participant already answered this question
        $existingAnswer = ParticipantAnswer::where([
            'participant_id' => $participant->id,
            'question_id' => $question->id,
        ])->first();
        
        if ($existingAnswer) {
            return response()->json(['error' => 'Réponse déjà soumise.'], 400);
        }
        
        DB::beginTransaction();
        try {
            // Calculate score using ScoringService
            $score = $this->scoringService->calculateScore(
                $question, 
                $validated['answer_ids'], 
                $validated['response_time'],
                $participant
            );
            
            // Store participant answer
            ParticipantAnswer::create([
                'participant_id' => $participant->id,
                'question_id' => $question->id,
                'answer_ids' => $validated['answer_ids'],
                'response_time' => $validated['response_time'],
                'score' => $score,
                'submitted_at' => now(),
            ]);
            
            // Update participant total score
            $participant->increment('score', $score);
            
            // Update leaderboard
            $leaderboard = $session->participants()
                ->orderBy('score', 'desc')
                ->orderBy('joined_at')
                ->get(['id', 'nickname', 'score', 'avatar'])
                ->toArray();
            
            // Broadcast leaderboard update
            broadcast(new LeaderboardUpdated($session, $leaderboard))->toOthers();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'score' => $score,
                'total_score' => $participant->fresh()->score,
                'message' => 'Réponse enregistrée !'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de l\'enregistrement de la réponse.'], 500);
        }
    }

    /**
     * Show session results.
     */
    public function results(string $code): Response
    {
        $session = QuizSession::with(['quiz.questions', 'participants.answers'])
            ->where('code', $code)
            ->firstOrFail();
        
        if ($session->status !== 'completed') {
            return redirect()->route('quiz.session.play', ['code' => $code])
                ->with('error', 'Cette session n\'est pas encore terminée.');
        }
        
        // Get final leaderboard
        $leaderboard = $session->participants()
            ->orderBy('score', 'desc')
            ->orderBy('joined_at')
            ->get()
            ->map(function($participant, $index) {
                $correctAnswers = $participant->answers()->where('score', '>', 0)->count();
                $totalAnswers = $participant->answers()->count();
                
                return [
                    'position' => $index + 1,
                    'id' => $participant->id,
                    'nickname' => $participant->nickname,
                    'avatar' => $participant->avatar,
                    'score' => $participant->score,
                    'correct_answers' => $correctAnswers,
                    'total_answers' => $totalAnswers,
                    'accuracy' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 1) : 0,
                    'avg_response_time' => $participant->answers()->avg('response_time') ?? 0,
                ];
            });
        
        // Get quiz analytics
        $analytics = [
            'total_questions' => $session->quiz->questions()->count(),
            'total_participants' => $session->participants()->count(),
            'session_duration' => $session->ended_at ? $session->ended_at->diffInMinutes($session->started_at) : 0,
            'average_score' => $leaderboard->avg('score') ?? 0,
            'highest_score' => $leaderboard->max('score') ?? 0,
            'participation_rate' => $session->participants()->count() > 0 ? 
                round(($session->participants()->whereHas('answers')->count() / $session->participants()->count()) * 100, 1) : 0,
        ];
        
        // Get question-by-question stats
        $questionStats = $session->quiz->questions->map(function($question) use ($session) {
            $answers = \App\Models\ParticipantAnswer::where('question_id', $question->id)
                ->whereHas('participant', function($query) use ($session) {
                    $query->where('quiz_session_id', $session->id);
                })
                ->get();
            
            $correctCount = $answers->where('score', '>', 0)->count();
            $totalCount = $answers->count();
            
            return [
                'question_id' => $question->id,
                'question_text' => $question->text,
                'correct_answers' => $correctCount,
                'total_answers' => $totalCount,
                'accuracy' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0,
                'avg_response_time' => $answers->avg('response_time') ?? 0,
            ];
        });
        
        return Inertia::render('quiz/results', [
            'session' => [
                'id' => $session->id,
                'code' => $session->code,
                'status' => $session->status,
                'quiz' => [
                    'title' => $session->quiz->title,
                    'description' => $session->quiz->description,
                ],
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
            ],
            'leaderboard' => $leaderboard,
            'analytics' => $analytics,
            'questionStats' => $questionStats,
        ]);
    }

    /**
     * End the quiz session.
     */
    public function end(Request $request, string $code): RedirectResponse
    {
        $session = QuizSession::with(['quiz.questions', 'participants.answers'])
            ->where('code', $code)
            ->firstOrFail();
        
        $user = $request->user();
        if ($session->presenter_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à terminer cette session.');
        }
        
        if ($session->status === 'completed') {
            return redirect()->route('quiz.session.results', ['code' => $code]);
        }
        
        DB::beginTransaction();
        try {
            // Update session status
            $session->update([
                'status' => 'completed',
                'ended_at' => now(),
            ]);
            
            // Calculate final scores
            $session->calculateScores();
            
            // Get final results
            $finalResults = $this->getFinalResults($session);
            
            // Broadcast session end
            broadcast(new SessionEnded($session, $finalResults))->toOthers();
            
            // Clean up QR code (optional - keep for historical records)
            // $this->qrCodeService->deleteSessionQRCode($session);
            
            DB::commit();
            
            return redirect()->route('quiz.session.results', ['code' => $code])
                ->with('success', 'Session terminée avec succès !');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la finalisation de la session.']);
        }
    }

    /**
     * Show live leaderboard with Redis caching.
     */
    public function leaderboard(string $code): Response
    {
        $session = QuizSession::with(['quiz'])->where('code', $code)->firstOrFail();
        
        // Cache leaderboard for 5 seconds to reduce database load
        $cacheKey = "leaderboard_{$session->id}_{$session->updated_at->timestamp}";
        
        $leaderboard = Cache::remember($cacheKey, 5, function () use ($session) {
            return $session->participants()
                ->with('answers')
                ->orderBy('score', 'desc')
                ->orderBy('joined_at')
                ->get()
                ->map(function($participant, $index) {
                    $correctAnswers = $participant->answers()->where('score', '>', 0)->count();
                    $totalAnswers = $participant->answers()->count();
                    $avgResponseTime = $participant->answers()->avg('response_time') ?? 0;
                    
                    return [
                        'position' => $index + 1,
                        'id' => $participant->id,
                        'nickname' => $participant->nickname,
                        'avatar' => $participant->avatar,
                        'score' => $participant->score,
                        'correct_answers' => $correctAnswers,
                        'total_answers' => $totalAnswers,
                        'accuracy' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 1) : 0,
                        'avg_response_time' => round($avgResponseTime, 2),
                        'is_active' => $participant->is_active ?? true,
                        'joined_at' => $participant->joined_at,
                    ];
                });
        });
        
        // Get session progress
        $currentQuestionIndex = $session->current_question_index ?? 0;
        $totalQuestions = $session->quiz->questions()->count();
        
        return Inertia::render('quiz/leaderboard', [
            'session' => [
                'id' => $session->id,
                'code' => $session->code,
                'status' => $session->status,
                'current_question_index' => $currentQuestionIndex,
                'quiz' => [
                    'title' => $session->quiz->title,
                    'total_questions' => $totalQuestions,
                ],
                'progress' => $totalQuestions > 0 ? round(($currentQuestionIndex / $totalQuestions) * 100, 1) : 0,
            ],
            'leaderboard' => $leaderboard,
            'stats' => [
                'total_participants' => $leaderboard->count(),
                'average_score' => $leaderboard->avg('score') ?? 0,
                'highest_score' => $leaderboard->max('score') ?? 0,
                'active_participants' => $leaderboard->where('is_active', true)->count(),
            ],
        ]);
    }

    /**
     * Export session results to PDF.
     */
    public function exportPdf(string $code): Response
    {
        // TODO: Generate PDF with results
        // Use DomPDF or similar
        
        return response()->download($pdfPath);
    }

    /**
     * Move to next question in the session.
     */
    public function nextQuestion(Request $request, string $code): JsonResponse
    {
        $session = QuizSession::with('quiz.questions.answers')->where('code', $code)->firstOrFail();
        
        $user = $request->user();
        if ($session->presenter_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à contrôler cette session.');
        }
        
        if ($session->status !== 'active') {
            return response()->json(['error' => 'La session n\'est pas active.'], 400);
        }
        
        DB::beginTransaction();
        try {
            $currentQuestion = Question::find($session->current_question_id);
            
            // Reveal answers for current question first
            if ($currentQuestion) {
                $participantStats = $this->getQuestionStats($session, $currentQuestion);
                broadcast(new AnswersRevealed($session, $currentQuestion, $participantStats))->toOthers();
            }
            
            // Move to next question
            $nextIndex = $session->current_question_index + 1;
            $totalQuestions = $session->quiz->questions()->count();
            
            if ($nextIndex >= $totalQuestions) {
                // End session
                $session->update([
                    'status' => 'completed',
                    'ended_at' => now(),
                ]);
                
                $finalResults = $this->getFinalResults($session);
                broadcast(new SessionEnded($session, $finalResults))->toOthers();
                
                DB::commit();
                return response()->json(['success' => true, 'session_ended' => true]);
            }
            
            // Get next question
            $nextQuestion = $session->quiz->questions()->skip($nextIndex)->first();
            
            $session->update([
                'current_question_index' => $nextIndex,
                'current_question_id' => $nextQuestion->id,
            ]);
            
            // Broadcast next question
            broadcast(new QuestionDisplayed($session, $nextQuestion, 30))->toOthers();
            
            DB::commit();
            
            return response()->json(['success' => true, 'next_question' => $nextQuestion]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors du passage à la question suivante.'], 500);
        }
    }

    /**
     * Get statistics for a question
     */
    private function getQuestionStats(QuizSession $session, Question $question): array
    {
        $answers = ParticipantAnswer::where('question_id', $question->id)
            ->whereHas('participant', function($query) use ($session) {
                $query->where('quiz_session_id', $session->id);
            })
            ->get();
        
        $stats = [
            'total_answers' => $answers->count(),
            'correct_answers' => 0,
            'average_time' => 0,
            'answer_distribution' => [],
        ];
        
        if ($answers->count() > 0) {
            $stats['average_time'] = $answers->avg('response_time');
            
            foreach ($answers as $answer) {
                $answerIds = $answer->answer_ids;
                $isCorrect = $question->answers()
                    ->whereIn('id', $answerIds)
                    ->where('is_correct', true)
                    ->count() === count($answerIds);
                
                if ($isCorrect) {
                    $stats['correct_answers']++;
                }
                
                foreach ($answerIds as $answerId) {
                    $stats['answer_distribution'][$answerId] = ($stats['answer_distribution'][$answerId] ?? 0) + 1;
                }
            }
        }
        
        return $stats;
    }

    /**
     * Get final session results
     */
    private function getFinalResults(QuizSession $session): array
    {
        $participants = $session->participants()
            ->with('answers')
            ->orderBy('score', 'desc')
            ->orderBy('joined_at')
            ->get();
        
        return [
            'total_participants' => $participants->count(),
            'leaderboard' => $participants->map(function($participant) {
                return [
                    'id' => $participant->id,
                    'nickname' => $participant->nickname,
                    'score' => $participant->score,
                    'avatar' => $participant->avatar,
                    'correct_answers' => $participant->answers()->where('score', '>', 0)->count(),
                    'total_answers' => $participant->answers()->count(),
                ];
            }),
            'quiz_stats' => [
                'total_questions' => $session->quiz->questions()->count(),
                'session_duration' => $session->ended_at->diffInMinutes($session->started_at),
            ],
        ];
    }


    /**
     * Generate a unique session code
     */
    private function generateUniqueSessionCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (QuizSession::where('code', $code)->exists());
        
        return $code;
    }
}