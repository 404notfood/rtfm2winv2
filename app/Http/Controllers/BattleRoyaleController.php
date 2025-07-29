<?php

namespace App\Http\Controllers;

use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\Quiz;
use App\Services\BattleRoyaleService;
use App\Events\BattleRoyaleStarted;
use App\Events\BattleRoyaleEnded;
use App\Events\ParticipantJoined;
use App\Events\ParticipantEliminated;
use App\Events\EliminationRound;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BattleRoyaleController extends Controller
{
    protected ?BattleRoyaleService $battleRoyaleService = null;

    public function __construct()
    {
        // Temporairement désactivé pour debug
        // $this->battleRoyaleService = $battleRoyaleService;
    }
    /**
     * Display Battle Royale lobby.
     */
    public function index(): Response
    {
        $activeSessions = BattleRoyaleSession::where('status', 'waiting')
            ->orWhere('status', 'active')
            ->with(['participants', 'creator:id,name'])
            ->get()
            ->map(function($session) {
                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'status' => $session->status,
                    'participants_count' => $session->participants()->count(),
                    'max_players' => $session->max_players,
                    'elimination_interval' => $session->elimination_interval,
                    'current_round' => $session->current_round,
                    'can_join' => $session->status === 'waiting' && !$session->isFull(),
                    'join_url' => route('battle-royale.join', $session->id),
                    'creator' => $session->creator ? [
                        'id' => $session->creator->id,
                        'name' => $session->creator->name,
                    ] : null,
                    'created_at' => $session->created_at,
                ];
            });
        
        $user = request()->user();
        
        // User stats for battle royale
        $userStats = [
            'battles_played' => 0,
            'victories' => 0,
            'eliminations' => 0,
            'survival_rate' => 0.0,
        ];
        
        if ($user) {
            // TODO: Calculate real stats from battle royale participation
            $userStats = [
                'battles_played' => $user->battleRoyaleParticipations()->count(),
                'victories' => $user->battleRoyaleParticipations()->where('final_position', 1)->count(),
                'eliminations' => $user->battleRoyaleParticipations()->whereNotNull('eliminated_at')->count(),
                'survival_rate' => 75.0, // TODO: Calculate from actual data
            ];
        }
        
        return Inertia::render('battle-royale/index', [
            'sessions' => [
                'data' => $activeSessions,
                'current_page' => 1,
                'last_page' => 1,
                'total' => $activeSessions->count(),
            ],
            'filters' => request()->only(['search', 'status']),
            'can_create' => $user && in_array($user->role, ['presenter', 'admin']),
            'user_stats' => $userStats,
        ]);
    }

    /**
     * Create a new Battle Royale session.
     */
    public function create(): Response
    {
        \Log::info('BattleRoyale Create - Method called');
        $user = auth()->user();
        
        // Vérifier que l'utilisateur est connecté et autorisé
        if (!$user || !in_array($user->role, ['presenter', 'admin'])) {
            abort(403, 'Non autorisé à créer un Battle Royale');
        }
        
        // Debug: Log pour identifier le problème
        \Log::info('BattleRoyale Create - User role: ' . $user->role);
        \Log::info('BattleRoyale Create - Is admin: ' . ($user->isAdmin() ? 'true' : 'false'));
        
        try {
            // Les admins peuvent voir tous les quiz, les autres seulement leurs quiz
            if ($user->isAdmin()) {
                \Log::info('BattleRoyale Create - Loading quizzes for admin');
                $quizzes = Quiz::where('is_active', true)
                    ->withCount('questions')
                    ->with('creator:id,name')
                    ->get()
                    ->map(function($quiz) {
                        return [
                            'id' => $quiz->id,
                            'title' => $quiz->title,
                            'creator_id' => $quiz->creator_id,
                            'questions_count' => $quiz->questions_count,
                            'creator' => $quiz->creator ? [
                                'id' => $quiz->creator->id,
                                'name' => $quiz->creator->name,
                            ] : null,
                        ];
                    });
                \Log::info('BattleRoyale Create - Found ' . $quizzes->count() . ' quizzes for admin');
            } else {
                \Log::info('BattleRoyale Create - Loading quizzes for user');
                $quizzes = $user->quizzes()
                    ->where('is_active', true)
                    ->withCount('questions')
                    ->get()
                    ->map(function($quiz) {
                        return [
                            'id' => $quiz->id,
                            'title' => $quiz->title,
                            'questions_count' => $quiz->questions_count,
                        ];
                    });
                \Log::info('BattleRoyale Create - Found ' . $quizzes->count() . ' quizzes for user');
            }
        } catch (\Exception $e) {
            \Log::error('BattleRoyale Create - Error loading quizzes: ' . $e->getMessage());
            $quizzes = collect([]);
        }

        return Inertia::render('battle-royale/create', [
            'quizzes' => $quizzes,
            'defaultSettings' => [
                'max_players' => 20,
                'elimination_interval' => 30, // seconds
                'questions_per_round' => 3,
            ],
        ]);
    }

    /**
     * Store a new Battle Royale session.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BattleRoyaleSession::class);

        // Debug: logger les données reçues
        \Log::info('Battle Royale Store - Données reçues:', $request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'quiz_id' => 'required|exists:quizzes,id',
            'max_participants' => 'required|integer|min:4|max:100',
            'elimination_rate' => 'required|integer|min:10|max:50',
            'time_per_question' => 'required|integer|min:10|max:120',
            'prize_pool' => 'nullable|numeric|min:0',
            'is_public' => 'boolean',
        ]);

        $user = $request->user();
        
        // Debug: logger les données validées
        \Log::info('Battle Royale Store - Données validées:', $validated);
        
        DB::beginTransaction();
        try {
            $session = BattleRoyaleSession::create([
                'name' => $validated['title'],
                'description' => $validated['description'],
                'max_players' => $validated['max_participants'],
                'elimination_interval' => $validated['time_per_question'],
                'status' => 'waiting',
                'creator_id' => $user?->id,
                'quiz_pool' => [$validated['quiz_id']], // Convertir en array
            ]);
            
            DB::commit();
            
            return redirect()->route('battle-royale.waiting-room', ['code' => $session->id])
                ->with('success', 'Battle Royale créé avec succès !');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la création du Battle Royale.']);
        }
    }

    /**
     * Show Battle Royale waiting room.
     */
    public function waitingRoom(string $code): Response
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->with('participants')
            ->firstOrFail();
            
        $participants = $session->participants->map(function($participant) {
            return [
                'id' => $participant->id,
                'pseudo' => $participant->pseudo,
                'avatar_url' => $participant->avatar_url,
                'joined_at' => $participant->created_at,
                'is_ready' => $participant->is_ready,
            ];
        });
        
        return Inertia::render('battle-royale/waiting-room', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'status' => $session->status,
                'max_players' => $session->max_players,
                'current_players' => $participants->count(),
                'elimination_interval' => $session->elimination_interval,
                'can_start' => $participants->count() >= 4 && $session->status === 'waiting',
            ],
            'participants' => $participants,
            'joinUrl' => url("/battle-royale/join/{$code}"),
        ]);
    }

    /**
     * Join Battle Royale session.
     */
    public function join(string $code): Response
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->where('status', 'waiting')
            ->firstOrFail();
            
        if ($session->isFull()) {
            abort(422, 'Cette session Battle Royale est complète.');
        }
        
        return Inertia::render('battle-royale/join', [
            'sessionCode' => $code,
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'current_players' => $session->participants()->count(),
                'max_players' => $session->max_players,
                'elimination_interval' => $session->elimination_interval,
            ],
        ]);
    }

    /**
     * Store participant in Battle Royale session.
     */
    public function storeParticipant(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'pseudo' => 'required|string|max:50',
        ]);

        $session = BattleRoyaleSession::where('id', $code)
            ->where('status', 'waiting')
            ->firstOrFail();
            
        if ($session->isFull()) {
            return back()->withErrors(['pseudo' => 'Cette session est complète.']);
        }
        
        // Check if pseudo already exists in this session
        if ($session->participants()->where('pseudo', $validated['pseudo'])->exists()) {
            return back()->withErrors(['pseudo' => 'Ce pseudo est déjà utilisé dans cette session.']);
        }
        
        DB::beginTransaction();
        try {
            $participant = BattleRoyaleParticipant::create([
                'battle_royale_session_id' => $session->id,
                'pseudo' => $validated['pseudo'],
                'user_id' => $request->user()?->id,
                'avatar_url' => $this->battleRoyaleService->generateRandomAvatar(),
                'health' => 100,
                'is_ready' => true,
            ]);
            
            // Store participant ID in session for tracking
            session(['battle_royale_participant_id' => $participant->id]);
            
            // Broadcast participant joined
            broadcast(new ParticipantJoined($session, $participant));
            
            DB::commit();
            
            return redirect()->route('battle-royale.waiting-room', ['code' => $code]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['pseudo' => 'Erreur lors de l\'inscription.']);
        }
    }

    /**
     * Start Battle Royale session.
     */
    public function start(string $code): RedirectResponse
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->where('status', 'waiting')
            ->firstOrFail();
            
        $participantsCount = $session->participants()->count();
        if ($participantsCount < 4) {
            return back()->withErrors(['error' => 'Minimum 4 participants requis pour démarrer.']);
        }
        
        DB::beginTransaction();
        try {
            // Update session status
            $session->update([
                'status' => 'active',
                'started_at' => now(),
                'current_round' => 1,
            ]);
            
            // Initialize first round questions
            $this->battleRoyaleService->initializeRound($session);
            
            // Broadcast session started
            broadcast(new BattleRoyaleStarted($session));
            
            DB::commit();
            
            return redirect()->route('battle-royale.arena', ['code' => $code]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors du démarrage.']);
        }
    }

    /**
     * Show Battle Royale arena.
     */
    public function arena(string $code): Response
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->with(['participants', 'currentQuestion'])
            ->firstOrFail();
            
        $participantId = session('battle_royale_participant_id');
        $participant = null;
        
        if ($participantId) {
            $participant = BattleRoyaleParticipant::find($participantId);
        }
        
        // Get current question for this round
        $currentQuestion = $this->battleRoyaleService->getCurrentQuestion($session);
        
        // Get leaderboard
        $leaderboard = $this->battleRoyaleService->getLeaderboard($session);
        
        return Inertia::render('battle-royale/arena', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'status' => $session->status,
                'current_round' => $session->current_round,
                'elimination_interval' => $session->elimination_interval,
                'participants_count' => $session->activeParticipants()->count(),
            ],
            'currentQuestion' => $currentQuestion,
            'participant' => $participant ? [
                'id' => $participant->id,
                'pseudo' => $participant->pseudo,
                'score' => $participant->score,
                'health' => $participant->health,
                'position' => $participant->position,
                'avatar_url' => $participant->avatar_url,
            ] : null,
            'leaderboard' => $leaderboard,
            'isEliminated' => $participant ? $participant->status === 'eliminated' : false,
        ]);
    }

    /**
     * Submit answer in Battle Royale.
     */
    public function submitAnswer(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'answer_ids' => 'required|array',
            'response_time' => 'required|numeric|min:0',
        ]);

        $session = BattleRoyaleSession::where('id', $code)
            ->where('status', 'active')
            ->firstOrFail();
            
        $participantId = session('battle_royale_participant_id');
        $participant = BattleRoyaleParticipant::where('id', $participantId)
            ->where('battle_royale_session_id', $session->id)
            ->where('status', 'active')
            ->firstOrFail();
        
        DB::beginTransaction();
        try {
            // Calculate Battle Royale score with special multipliers
            $scoreData = $this->battleRoyaleService->calculateBattleRoyaleScore(
                $validated['question_id'],
                $validated['answer_ids'],
                $validated['response_time'],
                $participant
            );
            
            // Update participant score and health
            $participant->score += $scoreData['points'];
            if (!$scoreData['is_correct']) {
                $participant->health = max(0, $participant->health - 10);
            }
            $participant->save();
            
            // Store the answer
            $this->battleRoyaleService->storeParticipantAnswer(
                $participant,
                $validated['question_id'],
                $validated['answer_ids'],
                $validated['response_time']
            );
            
            // Update leaderboard position
            $position = $this->battleRoyaleService->updateLeaderboardPosition($participant);
            
            // Check if participant should be eliminated
            $isEliminated = $this->battleRoyaleService->checkElimination($participant, $session);
            
            if ($isEliminated) {
                $participant->update([
                    'status' => 'eliminated',
                    'eliminated_round' => $session->current_round,
                    'position' => $position,
                ]);
                
                broadcast(new ParticipantEliminated($session, $participant));
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'is_eliminated' => $isEliminated,
                'current_position' => $position,
                'score_gained' => $scoreData['points'],
                'total_score' => $participant->score,
                'health_remaining' => $participant->health,
                'is_correct' => $scoreData['is_correct'],
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de la soumission.'], 500);
        }
    }

    /**
     * Process elimination round.
     */
    public function processElimination(string $code): JsonResponse
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->where('status', 'active')
            ->firstOrFail();
            
        DB::beginTransaction();
        try {
            // Perform elimination round
            $eliminationResults = $this->battleRoyaleService->performEliminationRound($session);
            
            // Update session round
            $session->increment('current_round');
            
            // Check if game should end (only 1 participant left or max rounds reached)
            $remainingCount = $session->activeParticipants()->count();
            
            if ($remainingCount <= 1) {
                // End the session
                $winner = $session->activeParticipants()->first();
                $session->update([
                    'status' => 'completed',
                    'ended_at' => now(),
                ]);
                
                broadcast(new BattleRoyaleEnded($session, $winner));
                
                DB::commit();
                
                return response()->json([
                    'eliminated_players' => $eliminationResults['eliminated'],
                    'remaining_players' => $remainingCount,
                    'session_ended' => true,
                    'winner' => $winner ? [
                        'pseudo' => $winner->pseudo,
                        'score' => $winner->score,
                    ] : null,
                ]);
            }
            
            // Broadcast elimination round results
            broadcast(new EliminationRound(
                $session,
                $eliminationResults['eliminated'],
                $remainingCount
            ));
            
            // Prepare next round
            $this->battleRoyaleService->initializeRound($session);
            
            DB::commit();
            
            return response()->json([
                'eliminated_players' => collect($eliminationResults['eliminated'])->map(function($p) {
                    return [
                        'pseudo' => $p->pseudo,
                        'final_position' => $p->position,
                        'score' => $p->score,
                    ];
                }),
                'remaining_players' => $remainingCount,
                'next_round_in' => 10, // seconds
                'session_ended' => false,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de l\'élimination.'], 500);
        }
    }

    /**
     * Show Battle Royale results.
     */
    public function results(string $code): Response
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->with('participants')
            ->firstOrFail();
            
        // Get final ranking (all participants ordered by position)
        $finalRanking = $session->participants()
            ->orderBy('position')
            ->orderByDesc('score')
            ->get()
            ->map(function($participant) {
                return [
                    'id' => $participant->id,
                    'pseudo' => $participant->pseudo,
                    'position' => $participant->position,
                    'score' => $participant->score,
                    'status' => $participant->status,
                    'eliminated_round' => $participant->eliminated_round,
                    'avatar_url' => $participant->avatar_url,
                ];
            });
            
        // Get winner (position 1)
        $winner = $finalRanking->where('position', 1)->first();
        
        // Calculate session statistics
        $sessionStats = [
            'total_participants' => $finalRanking->count(),
            'total_rounds' => $session->current_round,
            'duration_minutes' => $session->started_at ? 
                $session->started_at->diffInMinutes($session->ended_at ?? now()) : 0,
            'average_score' => $finalRanking->avg('score'),
            'highest_score' => $finalRanking->max('score'),
        ];
        
        return Inertia::render('battle-royale/results', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'status' => $session->status,
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
            ],
            'finalRanking' => $finalRanking,
            'winner' => $winner,
            'sessionStats' => $sessionStats,
        ]);
    }

    /**
     * End Battle Royale session.
     */
    public function end(string $code): RedirectResponse
    {
        $session = BattleRoyaleSession::where('id', $code)
            ->whereIn('status', ['active', 'waiting'])
            ->firstOrFail();
            
        DB::beginTransaction();
        try {
            // Calculate final rankings for all participants
            $this->battleRoyaleService->calculateFinalRankings($session);
            
            // Update session status
            $session->update([
                'status' => 'completed',
                'ended_at' => now(),
            ]);
            
            // Get winner
            $winner = $session->participants()
                ->where('position', 1)
                ->first();
            
            // Award achievements/badges (if AchievementService is implemented)
            // $this->awardBattleRoyaleAchievements($session);
            
            // Broadcast session ended
            broadcast(new BattleRoyaleEnded($session, $winner));
            
            DB::commit();
            
            return redirect()->route('battle-royale.results', ['code' => $code])
                ->with('success', 'Battle Royale terminé !');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la fin de session.']);
        }
    }

    /**
     * Show elimination animation/screen.
     */
    public function elimination(string $code): Response
    {
        $session = BattleRoyaleSession::where('id', $code)->firstOrFail();
        
        $participantId = session('battle_royale_participant_id');
        $participant = null;
        
        if ($participantId) {
            $participant = BattleRoyaleParticipant::where('id', $participantId)
                ->where('battle_royale_session_id', $session->id)
                ->first();
        }
        
        if (!$participant || $participant->status !== 'eliminated') {
            return redirect()->route('battle-royale.arena', ['code' => $code]);
        }
        
        // Calculate some elimination stats
        $eliminationStats = [
            'rounds_survived' => $participant->eliminated_round - 1,
            'total_participants' => $session->participants()->count(),
            'players_eliminated_before' => $session->participants()
                ->where('status', 'eliminated')
                ->where('position', '>', $participant->position)
                ->count(),
        ];
        
        return Inertia::render('battle-royale/elimination', [
            'participant' => [
                'id' => $participant->id,
                'pseudo' => $participant->pseudo,
                'score' => $participant->score,
                'eliminated_round' => $participant->eliminated_round,
                'avatar_url' => $participant->avatar_url,
            ],
            'finalPosition' => $participant->position,
            'sessionCode' => $code,
            'sessionName' => $session->name,
            'eliminationStats' => $eliminationStats,
        ]);
    }
}