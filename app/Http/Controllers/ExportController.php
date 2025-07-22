<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\User;
use App\Models\Participant;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class ExportController extends Controller
{
    public function quizResults(QuizSession $session, Request $request)
    {
        $this->authorize('view', $session);

        $validated = $request->validate([
            'format' => 'required|in:pdf,csv,excel',
            'include_details' => 'boolean',
            'include_answers' => 'boolean',
        ]);

        $session->load([
            'quiz.questions.answers',
            'participants.user',
            'participants.answers.question',
            'participants.answers.answer'
        ]);

        switch ($validated['format']) {
            case 'pdf':
                return $this->exportQuizResultsPdf($session, $validated);
            case 'csv':
                return $this->exportQuizResultsCsv($session, $validated);
            case 'excel':
                return $this->exportQuizResultsExcel($session, $validated);
        }
    }

    public function quizStructure(Quiz $quiz, Request $request)
    {
        $this->authorize('view', $quiz);

        $validated = $request->validate([
            'format' => 'required|in:pdf,json,csv',
            'include_answers' => 'boolean',
        ]);

        $quiz->load(['questions.answers', 'tags', 'creator']);

        switch ($validated['format']) {
            case 'pdf':
                return $this->exportQuizStructurePdf($quiz, $validated);
            case 'json':
                return $this->exportQuizStructureJson($quiz, $validated);
            case 'csv':
                return $this->exportQuizStructureCsv($quiz, $validated);
        }
    }

    public function userStatistics(User $user, Request $request)
    {
        // Seul l'utilisateur lui-même ou un admin peut exporter
        if ($user->id !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'format' => 'required|in:pdf,csv',
            'period' => 'required|in:all,year,month,week',
        ]);

        $user->load([
            'quizzes.sessions.participants',
            'participants.quizSession.quiz',
            'badges',
            'achievements'
        ]);

        switch ($validated['format']) {
            case 'pdf':
                return $this->exportUserStatisticsPdf($user, $validated);
            case 'csv':
                return $this->exportUserStatisticsCsv($user, $validated);
        }
    }

    public function tournamentResults(Tournament $tournament, Request $request)
    {
        $this->authorize('view', $tournament);

        $validated = $request->validate([
            'format' => 'required|in:pdf,csv',
            'include_matches' => 'boolean',
        ]);

        $tournament->load([
            'participants.user',
            'matches.participant1.user',
            'matches.participant2.user',
            'matches.winner.user'
        ]);

        switch ($validated['format']) {
            case 'pdf':
                return $this->exportTournamentResultsPdf($tournament, $validated);
            case 'csv':
                return $this->exportTournamentResultsCsv($tournament, $validated);
        }
    }

    public function certificate(QuizSession $session, Participant $participant)
    {
        // Vérifier que l'utilisateur peut générer ce certificat
        if ($participant->user_id !== Auth::id() && 
            $session->presenter_id !== Auth::id() && 
            !Auth::user()->isAdmin()) {
            abort(403);
        }

        $session->load(['quiz', 'participants']);
        $participant->load(['user', 'answers']);

        // Calculer les statistiques pour le certificat
        $stats = [
            'score' => $participant->score,
            'rank' => $session->participants()
                ->where('score', '>', $participant->score)
                ->count() + 1,
            'total_participants' => $session->participants()->count(),
            'correct_answers' => $participant->answers()->where('points_earned', '>', 0)->count(),
            'total_questions' => $session->quiz->questions()->count(),
            'completion_time' => $participant->finished_at ? 
                $participant->joined_at->diffInMinutes($participant->finished_at) : null,
        ];

        $pdf = Pdf::loadView('exports.certificate', [
            'session' => $session,
            'participant' => $participant,
            'stats' => $stats,
            'generated_at' => Carbon::now(),
        ]);

        $filename = "certificat_{$session->quiz->title}_{$participant->user->name}_" . 
                   Carbon::now()->format('Y_m_d') . '.pdf';

        return $pdf->download($filename);
    }

    private function exportQuizResultsPdf(QuizSession $session, array $options)
    {
        $participants = $session->participants()
            ->with(['user', 'answers.question', 'answers.answer'])
            ->orderBy('score', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.quiz-results-pdf', [
            'session' => $session,
            'participants' => $participants,
            'options' => $options,
            'generated_at' => Carbon::now(),
        ]);

        $filename = "resultats_{$session->quiz->title}_" . Carbon::now()->format('Y_m_d_H_i') . '.pdf';
        
        return $pdf->download($filename);
    }

    private function exportQuizResultsCsv(QuizSession $session, array $options)
    {
        $participants = $session->participants()
            ->with(['user', 'answers.question', 'answers.answer'])
            ->orderBy('score', 'desc')
            ->get();

        $filename = "resultats_{$session->quiz->title}_" . Carbon::now()->format('Y_m_d_H_i') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($participants, $options, $session) {
            $file = fopen('php://output', 'w');
            
            // En-têtes de base
            $csvHeaders = [
                'Rang',
                'Nom',
                'Email',
                'Score',
                'Bonnes réponses',
                'Temps total (min)',
                'Rejoint le',
                'Terminé le'
            ];

            if ($options['include_details'] ?? false) {
                foreach ($session->quiz->questions as $question) {
                    $csvHeaders[] = "Q" . $question->order . " - Points";
                    if ($options['include_answers'] ?? false) {
                        $csvHeaders[] = "Q" . $question->order . " - Réponse";
                    }
                }
            }

            fputcsv($file, $csvHeaders);

            // Données
            foreach ($participants as $index => $participant) {
                $row = [
                    $index + 1,
                    $participant->user ? $participant->user->name : $participant->pseudo,
                    $participant->user ? $participant->user->email : 'Invité',
                    $participant->score,
                    $participant->answers()->where('points_earned', '>', 0)->count(),
                    $participant->finished_at ? 
                        $participant->joined_at->diffInMinutes($participant->finished_at) : 'Non terminé',
                    $participant->joined_at->format('Y-m-d H:i:s'),
                    $participant->finished_at ? $participant->finished_at->format('Y-m-d H:i:s') : 'Non terminé'
                ];

                if ($options['include_details'] ?? false) {
                    foreach ($session->quiz->questions as $question) {
                        $answer = $participant->answers()
                            ->where('question_id', $question->id)
                            ->first();
                        
                        $row[] = $answer ? $answer->points_earned : 0;
                        
                        if ($options['include_answers'] ?? false) {
                            $row[] = $answer && $answer->answer ? 
                                $answer->answer->text : 'Pas de réponse';
                        }
                    }
                }

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportQuizResultsExcel(QuizSession $session, array $options)
    {
        // Utiliser la même logique que CSV mais avec un format Excel
        // Pour cet exemple, on retourne du CSV (nécessiterait phpoffice/phpspreadsheet pour Excel)
        return $this->exportQuizResultsCsv($session, $options);
    }

    private function exportQuizStructurePdf(Quiz $quiz, array $options)
    {
        $pdf = Pdf::loadView('exports.quiz-structure-pdf', [
            'quiz' => $quiz,
            'options' => $options,
            'generated_at' => Carbon::now(),
        ]);

        $filename = "structure_{$quiz->title}_" . Carbon::now()->format('Y_m_d') . '.pdf';
        
        return $pdf->download($filename);
    }

    private function exportQuizStructureJson(Quiz $quiz, array $options)
    {
        $data = [
            'quiz' => [
                'title' => $quiz->title,
                'description' => $quiz->description,
                'created_at' => $quiz->created_at,
                'creator' => $quiz->creator->name,
                'tags' => $quiz->tags->pluck('name'),
            ],
            'questions' => $quiz->questions->map(function ($question) use ($options) {
                $questionData = [
                    'order' => $question->order,
                    'text' => $question->text,
                    'type' => $question->type,
                    'time_limit' => $question->time_limit,
                    'points' => $question->points,
                ];

                if ($options['include_answers'] ?? false) {
                    $questionData['answers'] = $question->answers->map(function ($answer) {
                        return [
                            'text' => $answer->text,
                            'is_correct' => $answer->is_correct,
                        ];
                    });
                }

                return $questionData;
            }),
            'exported_at' => Carbon::now()->toISOString(),
        ];

        $filename = "structure_{$quiz->title}_" . Carbon::now()->format('Y_m_d') . '.json';

        return response()->json($data)
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    private function exportQuizStructureCsv(Quiz $quiz, array $options)
    {
        $filename = "structure_{$quiz->title}_" . Carbon::now()->format('Y_m_d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($quiz, $options) {
            $file = fopen('php://output', 'w');
            
            // En-têtes
            $csvHeaders = [
                'Ordre',
                'Question',
                'Type',
                'Temps limite',
                'Points'
            ];

            if ($options['include_answers'] ?? false) {
                $csvHeaders = array_merge($csvHeaders, [
                    'Réponse 1',
                    'Correcte 1',
                    'Réponse 2',
                    'Correcte 2',
                    'Réponse 3',
                    'Correcte 3',
                    'Réponse 4',
                    'Correcte 4',
                ]);
            }

            fputcsv($file, $csvHeaders);

            // Données
            foreach ($quiz->questions as $question) {
                $row = [
                    $question->order,
                    $question->text,
                    $question->type,
                    $question->time_limit,
                    $question->points
                ];

                if ($options['include_answers'] ?? false) {
                    $answers = $question->answers->take(4);
                    for ($i = 0; $i < 4; $i++) {
                        if (isset($answers[$i])) {
                            $row[] = $answers[$i]->text;
                            $row[] = $answers[$i]->is_correct ? 'Oui' : 'Non';
                        } else {
                            $row[] = '';
                            $row[] = '';
                        }
                    }
                }

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportUserStatisticsPdf(User $user, array $options)
    {
        $period = $options['period'];
        $stats = $this->getUserStatsForPeriod($user, $period);

        $pdf = Pdf::loadView('exports.user-statistics-pdf', [
            'user' => $user,
            'stats' => $stats,
            'period' => $period,
            'generated_at' => Carbon::now(),
        ]);

        $filename = "statistiques_{$user->name}_" . Carbon::now()->format('Y_m_d') . '.pdf';
        
        return $pdf->download($filename);
    }

    private function exportUserStatisticsCsv(User $user, array $options)
    {
        $period = $options['period'];
        $stats = $this->getUserStatsForPeriod($user, $period);

        $filename = "statistiques_{$user->name}_" . Carbon::now()->format('Y_m_d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($stats) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ['Statistique', 'Valeur']);
            
            foreach ($stats as $key => $value) {
                fputcsv($file, [$key, $value]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportTournamentResultsPdf(Tournament $tournament, array $options)
    {
        $pdf = Pdf::loadView('exports.tournament-results-pdf', [
            'tournament' => $tournament,
            'options' => $options,
            'generated_at' => Carbon::now(),
        ]);

        $filename = "tournoi_{$tournament->title}_" . Carbon::now()->format('Y_m_d') . '.pdf';
        
        return $pdf->download($filename);
    }

    private function exportTournamentResultsCsv(Tournament $tournament, array $options)
    {
        $filename = "tournoi_{$tournament->title}_" . Carbon::now()->format('Y_m_d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($tournament, $options) {
            $file = fopen('php://output', 'w');
            
            // Participants et résultats
            fputcsv($file, ['Rang', 'Participant', 'Victoires', 'Défaites', 'Score']);
            
            $ranking = $tournament->getFinalRanking();
            foreach ($ranking as $index => $participant) {
                fputcsv($file, [
                    $index + 1,
                    $participant->user->name,
                    $participant->wins ?? 0,
                    $participant->losses ?? 0,
                    $participant->score ?? 0
                ]);
            }

            // Matches si demandés
            if ($options['include_matches'] ?? false) {
                fputcsv($file, []); // Ligne vide
                fputcsv($file, ['Round', 'Participant 1', 'Participant 2', 'Gagnant', 'Score 1', 'Score 2']);
                
                foreach ($tournament->matches as $match) {
                    fputcsv($file, [
                        $match->round,
                        $match->participant1->user->name,
                        $match->participant2->user->name,
                        $match->winner ? $match->winner->user->name : 'En cours',
                        $match->score1 ?? '-',
                        $match->score2 ?? '-'
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getUserStatsForPeriod(User $user, string $period): array
    {
        $query = $user->participants();

        switch ($period) {
            case 'week':
                $query->where('created_at', '>=', Carbon::now()->subWeek());
                break;
            case 'month':
                $query->where('created_at', '>=', Carbon::now()->subMonth());
                break;
            case 'year':
                $query->where('created_at', '>=', Carbon::now()->subYear());
                break;
        }

        $participants = $query->with(['quizSession.quiz', 'answers'])->get();

        return [
            'Période' => ucfirst($period),
            'Quiz joués' => $participants->count(),
            'Score total' => $participants->sum('score'),
            'Score moyen' => $participants->avg('score') ?? 0,
            'Meilleur score' => $participants->max('score') ?? 0,
            'Bonnes réponses totales' => $participants->sum(function ($p) {
                return $p->answers()->where('points_earned', '>', 0)->count();
            }),
            'Temps de jeu total (min)' => $participants->sum(function ($p) {
                return $p->finished_at ? 
                    $p->joined_at->diffInMinutes($p->finished_at) : 0;
            }),
            'Quiz créés' => $period === 'all' ? 
                $user->quizzes()->count() : 
                $user->quizzes()->where('created_at', '>=', Carbon::now()->sub(ucfirst($period), 1))->count(),
            'Badges obtenus' => $user->badges()->count(),
        ];
    }
}