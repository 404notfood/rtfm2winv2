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
                ->where('status', 'published')
                ->latest()
                ->get();
        
        return Inertia::render('quiz/index', [
            'quizzes' => $quizzes,
            'canCreate' => $user && in_array($user->role, ['presenter', 'admin']),
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
            // La validation est déjà effectuée par StoreQuizRequest
            // Utilisation du service pour créer le quiz (principe de responsabilité unique)
            $quiz = $this->quizService->createQuiz($request->validated(), $request->user());
            
            return redirect()->route('quiz.show', $quiz->id)
                ->with('success', 'Quiz créé avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la création du quiz.']);
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
                'tags',
                'achievements'
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
        $quiz = Quiz::with(['questions.answers'])
            ->where('id', $id)
            ->firstOrFail();
        
        // Check if user can edit this quiz
        $user = request()->user();
        if ($quiz->creator_id !== $user?->id && $user?->role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce quiz.');
        }
        
        return Inertia::render('quiz/edit', [
            'quiz' => $quiz,
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
            'multiple_answers' => 'boolean',
            'status' => 'in:draft,published,archived',
            'questions' => 'required|array|min:1',
            'questions.*.text' => 'required|string|max:500',
            'questions.*.type' => 'required|in:single,multiple',
            'questions.*.time_limit' => 'integer|min:5|max:300',
            'questions.*.points' => 'integer|min:1|max:1000',
            'questions.*.answers' => 'required|array|min:2',
            'questions.*.answers.*.text' => 'required|string|max:200',
            'questions.*.answers.*.is_correct' => 'boolean',
        ]);

        try {
            $quiz = $this->quizService->updateQuiz($quiz, $validated);
            
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
}