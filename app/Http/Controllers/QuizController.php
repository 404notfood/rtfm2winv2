<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Services\QuizService;
use App\Http\Requests\StoreQuizRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Service pour la gestion des quiz.
     * Injection de dépendance suivant les principes POO.
     */
    public function __construct(
        private QuizService $quizService
    ) {}

    /**
     * Display a listing of the user's quizzes.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Pour les présentateurs et admins : leurs quiz avec relations eager loading
        // Pour les utilisateurs : quiz publics + historique avec optimisation N+1
        $quizzes = $user && in_array($user->role, ['presenter', 'admin'])
            ? Quiz::with(['creator:id,name,avatar', 'questions', 'sessions', 'tags'])
                ->withCount(['questions', 'sessions', 'participants'])
                ->where('creator_id', $user->id)
                ->latest()
                ->get()
            : Quiz::with(['creator:id,name,avatar', 'tags'])
                ->withCount(['questions', 'sessions'])
                ->where('status', 'active')
                ->latest()
                ->get();
        
        return Inertia::render('quiz/index', [
            'quizzes' => $quizzes,
            'filters' => $request->only(['search', 'tag', 'status']),
            'can_create' => $user && in_array($user->role, ['presenter', 'admin']),
        ]);
    }

    /**
     * Show the form for creating a new quiz.
     */
    public function create(): Response
    {
        // Get available tags for the quiz creation form
        try {
            $tags = \App\Models\Tag::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'color'])
                ->map(function($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'color' => $tag->color ?? '#3B82F6',
                    ];
                });
        } catch (\Exception $e) {
            // If tags table doesn't exist yet, provide empty array
            $tags = collect([]);
        }

        return Inertia::render('quiz/create', [
            'tags' => $tags,
            'categories' => ['général', 'science', 'histoire', 'sport', 'culture'], // TODO: From database
        ]);
    }

    /**
     * Store a newly created quiz.
     * Utilise le service et une Request personnalisée pour respecter les principes POO.
     */
    public function store(StoreQuizRequest $request): RedirectResponse
    {
        try {
            // Debug: Log les données reçues
            \Log::info('Quiz creation attempt', [
                'data' => $request->validated(),
                'user' => $request->user()->id
            ]);
            
            // La validation est déjà effectuée par StoreQuizRequest
            // Utilisation du service pour créer le quiz (principe de responsabilité unique)
            $quiz = $this->quizService->createQuiz($request->validated(), $request->user());
            
            \Log::info('Quiz created successfully', ['quiz_id' => $quiz->id]);
            
            return redirect()->route('quiz.show', $quiz->id)
                ->with('success', 'Quiz créé avec succès !');
        } catch (\Exception $e) {
            \Log::error('Quiz creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Erreur lors de la création du quiz: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified quiz.
     */
    public function show(string $id): Response
    {
        $quiz = Quiz::with([
                'questions.answers', 
                'creator:id,name,email,avatar', 
                'sessions' => function($query) {
                    $query->with('participants:id,quiz_session_id,nickname,score')
                          ->withCount('participants')
                          ->latest();
                },
                'tags'
            ])
            ->withCount(['questions', 'sessions', 'participants'])
            ->where('id', $id)
            ->firstOrFail();
        
        // Check if user can view this quiz
        $user = request()->user();
        if ($quiz->status === 'draft' && $quiz->creator_id !== $user?->id) {
            abort(403, 'Ce quiz n\'est pas encore publié.');
        }
        
        return Inertia::render('quiz/show', [
            'quiz' => $quiz,
            'canEdit' => $user && ($quiz->creator_id === $user->id || $user->role === 'admin'),
            'canCreateSession' => $user && in_array($user->role, ['presenter', 'admin']),
            'statistics' => [
                'total_sessions' => $quiz->sessions->count(),
                'total_participants' => $quiz->sessions->sum('participants_count'),
                'average_score' => $quiz->sessions->avg('average_score') ?? 0,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified quiz.
     */
    public function edit(string $id): Response
    {
        $quiz = Quiz::with(['questions.answers', 'tags'])
            ->where('id', $id)
            ->firstOrFail();
        
        // Check if user can edit this quiz
        $user = request()->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce quiz.');
        }
        
        // Get available tags
        try {
            $tags = \App\Models\Tag::orderBy('name')
                ->get(['id', 'name', 'color'])
                ->map(function($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'color' => $tag->color ?? '#3B82F6',
                    ];
                });
        } catch (\Exception $e) {
            // If tags table doesn't exist yet, provide empty array
            $tags = collect([]);
        }
        
        return Inertia::render('quiz/edit', [
            'quiz' => $quiz,
            'tags' => $tags,
            'categories' => ['général', 'science', 'histoire', 'sport', 'culture'],
        ]);
    }

    /**
     * Update the specified quiz.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $quiz = Quiz::findOrFail($id);
        
        // Check if user can edit this quiz
        $user = $request->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce quiz.');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:50',
            'time_per_question' => 'integer|min:5|max:300',
            'base_points' => 'integer|min:100|max:5000',
            'multiple_answers' => 'boolean',
            'allow_anonymous' => 'boolean',
            'status' => 'in:draft,active,archived',
        ]);

        try {
            $quiz->update($validated);
            
            return redirect()->route('quiz.show', $id)
                ->with('success', 'Quiz mis à jour avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la mise à jour du quiz.']);
        }
    }

    /**
     * Remove the specified quiz.
     */
    public function destroy(string $id): RedirectResponse
    {
        $quiz = Quiz::findOrFail($id);
        
        // Check if user can delete this quiz
        $user = request()->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à supprimer ce quiz.');
        }
        
        // Check if quiz has active sessions
        if ($quiz->sessions()->whereIn('status', ['waiting', 'active'])->exists()) {
            return back()->withErrors(['error' => 'Impossible de supprimer un quiz avec des sessions actives.']);
        }
        
        try {
            $this->quizService->deleteQuiz($quiz);
            
            return redirect()->route('quiz.index')
                ->with('success', 'Quiz supprimé avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la suppression du quiz.']);
        }
    }

    /**
     * Duplicate a quiz.
     */
    public function duplicate(string $id): RedirectResponse
    {
        $quiz = Quiz::with(['questions.answers'])->findOrFail($id);
        
        $user = request()->user();
        if (!$user || !in_array($user->role, ['presenter', 'admin'])) {
            abort(403, 'Vous n\'êtes pas autorisé à dupliquer ce quiz.');
        }
        
        try {
            $duplicatedQuiz = $this->quizService->duplicateQuiz($quiz, $user);
            
            return redirect()->route('quiz.show', $duplicatedQuiz->id)
                ->with('success', 'Quiz dupliqué avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la duplication du quiz.']);
        }
    }

    /**
     * Generate new unique link for quiz.
     */
    public function regenerateLink(string $id): RedirectResponse
    {
        $quiz = Quiz::findOrFail($id);
        
        // Check if user can edit this quiz
        $user = request()->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce quiz.');
        }
        
        try {
            $this->quizService->regenerateQuizLink($quiz);
            
            return back()->with('success', 'Nouveau lien généré !');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la génération du lien.']);
        }
    }

    /**
     * Display quiz analytics.
     */
    public function analytics(string $id): Response
    {
        $quiz = Quiz::with([
                'sessions' => function($query) {
                    $query->with(['participants'])
                          ->withCount('participants')
                          ->orderBy('created_at', 'desc');
                },
                'questions'
            ])
            ->withCount(['sessions', 'participants'])
            ->findOrFail($id);
        
        // Check if user can view analytics
        $user = request()->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à voir les analytics de ce quiz.');
        }
        
        // Calculate analytics
        $totalParticipants = $quiz->participants_count;
        $totalSessions = $quiz->sessions_count;
        $averageParticipantsPerSession = $totalSessions > 0 ? round($totalParticipants / $totalSessions, 1) : 0;
        
        // Recent sessions
        $recentSessions = $quiz->sessions->take(10);
        
        // Performance by question (if we have session data)
        $questionStats = [];
        foreach ($quiz->questions as $question) {
            $questionStats[] = [
                'id' => $question->id,
                'text' => $question->question_text,
                'order_index' => $question->order_index,
                // TODO: Add actual statistics when participant answers are tracked
                'correct_answers' => 0,
                'total_answers' => 0,
                'accuracy' => 0
            ];
        }
        
        return Inertia::render('quiz/analytics', [
            'quiz' => $quiz,
            'analytics' => [
                'total_participants' => $totalParticipants,
                'total_sessions' => $totalSessions,
                'average_participants_per_session' => $averageParticipantsPerSession,
                'question_stats' => $questionStats,
                'recent_sessions' => $recentSessions
            ]
        ]);
    }

    /**
     * Start presenting a quiz (for presenters only).
     */
    public function play(string $id): RedirectResponse
    {
        \Log::info('QuizController::play called', ['quiz_id' => $id]);
        
        $quiz = Quiz::with('questions')->findOrFail($id);
        $user = request()->user();
        
        // Check if user is the presenter of this quiz or admin
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            return back()->withErrors(['error' => 'Seul le créateur du quiz peut lancer une présentation.']);
        }
        
        // Check if quiz is ready for presentation
        if ($quiz->status !== 'active') {
            \Log::warning('Quiz not active', ['quiz_id' => $id, 'status' => $quiz->status]);
            return back()->withErrors(['error' => 'Ce quiz n\'est pas publié. Changez son statut à "Actif" pour pouvoir le présenter.']);
        }
        
        if ($quiz->questions->isEmpty()) {
            \Log::warning('Quiz has no questions', ['quiz_id' => $id]);
            return back()->withErrors(['error' => 'Ce quiz n\'a pas encore de questions. Ajoutez des questions avant de pouvoir le présenter.']);
        }
        
        // Look for an existing waiting session from this presenter
        $existingSession = $quiz->sessions()
            ->where('status', 'waiting')
            ->where('presenter_id', $user->id)
            ->where('created_at', '>', now()->subHours(2)) // Sessions older than 2h are considered expired
            ->first();
            
        if ($existingSession) {
            \Log::info('Found existing session', ['session_code' => $existingSession->code]);
            // Return to existing presentation session
            return redirect()->route('quiz.session.waiting-room', $existingSession->code);
        }
        
        // Create new presentation session
        try {
            $sessionCode = strtoupper(Str::random(6));
            
            \Log::info('Creating new presentation session', ['quiz_id' => $id, 'code' => $sessionCode]);
            
            $session = $quiz->sessions()->create([
                'code' => $sessionCode,
                'status' => 'waiting',
                'presenter_id' => $user->id,
                'current_question_index' => 0,
                'settings' => [
                    'time_per_question' => $quiz->time_per_question ?? 30,
                    'show_correct_answer' => true,
                    'allow_anonymous' => $quiz->allow_anonymous ?? true,
                ],
            ]);
            
            \Log::info('Presentation session created successfully', ['session_id' => $session->id, 'code' => $session->code]);
            
            return redirect()->route('quiz.session.waiting-room', $session->code);
            
        } catch (\Exception $e) {
            \Log::error('Error creating presentation session', [
                'quiz_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Erreur lors de la création de la session de présentation: ' . $e->getMessage()]);
        }
    }
}