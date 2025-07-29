<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Models\Quiz;
use App\Services\TournamentService;
use App\Events\TournamentStarted;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TournamentController extends Controller
{
    protected TournamentService $tournamentService;

    public function __construct(TournamentService $tournamentService)
    {
        $this->tournamentService = $tournamentService;
    }
    public function index()
    {
        $user = Auth::user();
        
        $tournaments = Tournament::query()
            ->when(!$user || !$user->isAdmin(), function ($query) use ($user) {
                if ($user) {
                    $query->where('creator_id', $user->id)
                        ->orWhereIn('status', ['registration', 'active', 'completed']);
                } else {
                    // Guest users only see public tournaments
                    $query->whereIn('status', ['registration', 'active', 'completed']);
                }
            })
            ->with(['creator', 'quiz'])
            ->withCount('participants')
            ->latest()
            ->paginate(12);

        // Get user's tournaments if authenticated
        $userTournaments = [];
        if ($user) {
            $userTournaments = Tournament::where('creator_id', $user->id)
                ->orWhereHas('participants', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['creator', 'quiz'])
                ->withCount('participants')
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('tournaments/index', [
            'tournaments' => $tournaments,
            'filters' => request()->only(['search', 'status']),
            'can_create' => $user && in_array($user->role, ['presenter', 'admin']),
            'user_tournaments' => $userTournaments,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Tournament::class);

        $quizzes = Auth::user()->quizzes()
            ->where('is_active', true)
            ->select('id', 'title')
            ->get();

        return Inertia::render('tournaments/create', [
            'quizzes' => $quizzes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Tournament::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'quiz_id' => 'required|exists:quizzes,id',
            'type' => 'required|in:single_elimination,double_elimination,round_robin',
            'max_participants' => 'required|integer|min:4|max:128',
            'registration_start' => 'required|date|after:now',
            'registration_end' => 'required|date|after:registration_start',
            'tournament_start' => 'required|date|after:registration_end',
            'is_public' => 'boolean',
            'entry_fee' => 'nullable|numeric|min:0',
            'prize_pool' => 'nullable|string|max:500',
            'rules' => 'nullable|string|max:2000',
        ]);

        $tournament = Tournament::create(array_merge($validated, [
            'creator_id' => Auth::id(),
            'status' => 'upcoming',
            'current_round' => 0,
        ]));

        return redirect()
            ->route('tournaments.show', $tournament)
            ->with('success', 'Tournoi créé avec succès.');
    }

    public function show(Tournament $tournament)
    {
        $tournament->load([
            'creator',
            'quiz',
            'participants.user',
            'matches' => function ($query) {
                $query->with(['participant1.user', 'participant2.user', 'winner.user'])
                    ->orderBy('round')
                    ->orderBy('match_order');
            }
        ]);

        $userParticipation = null;
        if (Auth::check()) {
            $userParticipation = $tournament->participants()
                ->where('user_id', Auth::id())
                ->first();
        }

        $brackets = $this->generateBrackets($tournament);
        $tournamentStats = $this->tournamentService->calculateTournamentStats($tournament);

        return Inertia::render('tournaments/show', [
            'tournament' => $tournament,
            'userParticipation' => $userParticipation,
            'brackets' => $brackets,
            'tournamentStats' => $tournamentStats,
            'canJoin' => $this->canJoin($tournament),
            'canStart' => $this->canStart($tournament),
        ]);
    }

    public function edit(Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        $quizzes = Auth::user()->quizzes()
            ->where('is_active', true)
            ->select('id', 'title')
            ->get();

        return Inertia::render('tournaments/edit', [
            'tournament' => $tournament,
            'quizzes' => $quizzes,
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        // Seuls certains champs peuvent être modifiés après création
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'registration_end' => 'required|date|after:now',
            'tournament_start' => 'required|date|after:registration_end',
            'is_public' => 'boolean',
            'prize_pool' => 'nullable|string|max:500',
            'rules' => 'nullable|string|max:2000',
        ]);

        // Empêcher modification si le tournoi a commencé
        if ($tournament->status !== 'upcoming') {
            return back()->withErrors(['tournament' => 'Impossible de modifier un tournoi en cours ou terminé.']);
        }

        $tournament->update($validated);

        return redirect()
            ->route('tournaments.show', $tournament)
            ->with('success', 'Tournoi mis à jour avec succès.');
    }

    public function destroy(Tournament $tournament)
    {
        $this->authorize('delete', $tournament);

        if ($tournament->status !== 'upcoming') {
            return back()->withErrors(['tournament' => 'Impossible de supprimer un tournoi en cours ou terminé.']);
        }

        $tournament->delete();

        return redirect()
            ->route('tournaments.index')
            ->with('success', 'Tournoi supprimé avec succès.');
    }

    public function join(Tournament $tournament)
    {
        $user = Auth::user();
        
        if (!$this->canJoin($tournament)) {
            return back()->withErrors(['tournament' => 'Impossible de rejoindre ce tournoi.']);
        }

        $tournament->participants()->create([
            'user_id' => $user->id,
            'joined_at' => now(),
        ]);

        return back()->with('success', 'Inscription au tournoi réussie !');
    }

    public function leave(Tournament $tournament)
    {
        $user = Auth::user();
        
        if ($tournament->status !== 'upcoming') {
            return back()->withErrors(['tournament' => 'Impossible de quitter un tournoi en cours.']);
        }

        $tournament->participants()->where('user_id', $user->id)->delete();

        return back()->with('success', 'Vous avez quitté le tournoi.');
    }

    public function start(Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        if (!$this->canStart($tournament)) {
            return back()->withErrors(['tournament' => 'Impossible de démarrer ce tournoi.']);
        }

        DB::transaction(function () use ($tournament) {
            $tournament->update([
                'status' => 'active',
                'current_round' => 1,
                'started_at' => now(),
            ]);

            $this->generateMatches($tournament);
            
            // Broadcast tournament started
            broadcast(new TournamentStarted($tournament));
        });

        return back()->with('success', 'Tournoi démarré avec succès !');
    }

    public function nextRound(Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        if ($tournament->status !== 'active') {
            return back()->withErrors(['tournament' => 'Le tournoi n\'est pas actif.']);
        }

        // Vérifier que tous les matches du round actuel sont terminés
        $pendingMatches = $tournament->matches()
            ->where('round', $tournament->current_round)
            ->whereNull('winner_id')
            ->count();

        if ($pendingMatches > 0) {
            return back()->withErrors(['tournament' => 'Tous les matches du round actuel doivent être terminés.']);
        }

        DB::transaction(function () use ($tournament) {
            if ($this->isLastRound($tournament)) {
                // Tournoi terminé
                $tournament->update([
                    'status' => 'completed',
                    'ended_at' => now(),
                ]);
            } else {
                // Passer au round suivant
                $tournament->increment('current_round');
                $this->generateNextRoundMatches($tournament);
            }
        });

        $message = $tournament->status === 'completed' 
            ? 'Tournoi terminé !' 
            : 'Round suivant généré avec succès.';

        return back()->with('success', $message);
    }

    public function recordResult(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        $this->authorize('update', $tournament);

        $validated = $request->validate([
            'winner_id' => 'required|in:' . $match->participant1_id . ',' . $match->participant2_id,
            'score1' => 'required|integer|min:0',
            'score2' => 'required|integer|min:0',
            'match_duration' => 'nullable|integer|min:0',
        ]);

        $matchData = [
            'score1' => $validated['score1'],
            'score2' => $validated['score2'],
            'duration' => $validated['match_duration'] ?? null,
        ];

        $result = $this->tournamentService->processMatchCompletion(
            $tournament, 
            $match, 
            $validated['winner_id'], 
            $matchData
        );

        $message = 'Résultat enregistré avec succès.';
        if ($result['tournament_complete']) {
            $message = 'Tournoi terminé ! Félicitations au vainqueur !';
        } elseif ($result['round_complete']) {
            $message = 'Round terminé ! Passage au round suivant.';
        }

        return back()->with('success', $message);
    }

    public function bracket(Tournament $tournament)
    {
        $tournament->load([
            'participants.user',
            'matches.participant1.user',
            'matches.participant2.user',
            'matches.winner.user'
        ]);

        $brackets = $this->generateBrackets($tournament);

        return Inertia::render('tournaments/bracket', [
            'tournament' => $tournament,
            'brackets' => $brackets,
        ]);
    }

    public function leaderboard(Tournament $tournament)
    {
        $participants = $tournament->participants()
            ->with('user')
            ->withCount([
                'matches as wins' => function ($query) {
                    $query->where('winner_id', function ($subQuery) {
                        $subQuery->select('id')
                            ->from('tournament_participants')
                            ->whereColumn('tournament_participants.id', 'tournament_matches.participant1_id')
                            ->orWhereColumn('tournament_participants.id', 'tournament_matches.participant2_id');
                    });
                },
                'matches as total_matches'
            ])
            ->get()
            ->map(function ($participant) {
                $participant->win_rate = $participant->total_matches > 0 
                    ? round(($participant->wins / $participant->total_matches) * 100, 1)
                    : 0;
                return $participant;
            })
            ->sortByDesc('wins')
            ->values();

        return Inertia::render('tournaments/leaderboard', [
            'tournament' => $tournament,
            'participants' => $participants,
        ]);
    }

    private function canJoin(Tournament $tournament): bool
    {
        if (!Auth::check()) return false;
        
        return $tournament->status === 'upcoming' &&
               $tournament->registration_end > now() &&
               $tournament->participants()->count() < $tournament->max_participants &&
               !$tournament->participants()->where('user_id', Auth::id())->exists();
    }

    private function canStart(Tournament $tournament): bool
    {
        return $tournament->status === 'upcoming' &&
               $tournament->participants()->count() >= 4 &&
               $tournament->tournament_start <= now();
    }

    private function generateMatches(Tournament $tournament)
    {
        $participants = $tournament->participants()->get()->shuffle();
        
        if ($tournament->type === 'single_elimination') {
            $this->generateSingleEliminationMatches($tournament, $participants);
        } elseif ($tournament->type === 'double_elimination') {
            $this->generateDoubleEliminationMatches($tournament, $participants);
        } elseif ($tournament->type === 'round_robin') {
            $this->generateRoundRobinMatches($tournament, $participants);
        }
    }

    private function generateSingleEliminationMatches(Tournament $tournament, $participants)
    {
        $round = 1;
        $matchOrder = 1;

        for ($i = 0; $i < count($participants); $i += 2) {
            if (isset($participants[$i + 1])) {
                $tournament->matches()->create([
                    'round' => $round,
                    'match_order' => $matchOrder++,
                    'participant1_id' => $participants[$i]->id,
                    'participant2_id' => $participants[$i + 1]->id,
                ]);
            }
        }
    }

    private function generateDoubleEliminationMatches(Tournament $tournament, $participants)
    {
        // Implémentation similaire mais avec bracket des perdants
        $this->generateSingleEliminationMatches($tournament, $participants);
    }

    private function generateRoundRobinMatches(Tournament $tournament, $participants)
    {
        $round = 1;
        $matchOrder = 1;
        
        for ($i = 0; $i < count($participants); $i++) {
            for ($j = $i + 1; $j < count($participants); $j++) {
                $tournament->matches()->create([
                    'round' => $round,
                    'match_order' => $matchOrder++,
                    'participant1_id' => $participants[$i]->id,
                    'participant2_id' => $participants[$j]->id,
                ]);
            }
        }
    }

    private function generateNextRoundMatches(Tournament $tournament)
    {
        if ($tournament->type === 'round_robin') {
            return; // Pas de rounds suivants en round robin
        }

        $winners = $tournament->matches()
            ->where('round', $tournament->current_round - 1)
            ->whereNotNull('winner_id')
            ->with('winner')
            ->get()
            ->pluck('winner');

        $matchOrder = 1;
        for ($i = 0; $i < count($winners); $i += 2) {
            if (isset($winners[$i + 1])) {
                $tournament->matches()->create([
                    'round' => $tournament->current_round,
                    'match_order' => $matchOrder++,
                    'participant1_id' => $winners[$i]->id,
                    'participant2_id' => $winners[$i + 1]->id,
                ]);
            }
        }
    }

    private function isLastRound(Tournament $tournament): bool
    {
        $activeParticipants = $tournament->matches()
            ->where('round', $tournament->current_round)
            ->whereNotNull('winner_id')
            ->count();

        return $activeParticipants <= 1;
    }

    private function generateBrackets(Tournament $tournament)
    {
        $matches = $tournament->matches()
            ->with(['participant1.user', 'participant2.user', 'winner.user'])
            ->orderBy('round')
            ->orderBy('match_order')
            ->get()
            ->groupBy('round');

        $brackets = [];
        foreach ($matches as $round => $roundMatches) {
            $brackets["Round $round"] = $roundMatches->toArray();
        }

        return $brackets;
    }
}