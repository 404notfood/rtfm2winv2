<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Résultats du Quiz - {{ $session->quiz->title }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .quiz-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .session-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: table;
            width: 100%;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 30%;
            padding: 5px 10px 5px 0;
        }
        .info-value {
            display: table-cell;
            padding: 5px 0;
        }
        .participants-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .participants-table th,
        .participants-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .participants-table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        .participants-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .rank-1 { background-color: #ffd700 !important; }
        .rank-2 { background-color: #c0c0c0 !important; }
        .rank-3 { background-color: #cd7f32 !important; }
        .stats-summary {
            margin-top: 30px;
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
        }
        .stats-grid {
            display: table;
            width: 100%;
        }
        .stats-row {
            display: table-row;
        }
        .stats-label {
            display: table-cell;
            font-weight: bold;
            width: 50%;
            padding: 5px 10px 5px 0;
        }
        .stats-value {
            display: table-cell;
            padding: 5px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">RTFM2WIN</div>
        <div class="quiz-title">{{ $session->quiz->title }}</div>
        <div>Rapport de Résultats</div>
    </div>

    <div class="session-info">
        <h3>Informations de la Session</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Code de Session:</div>
                <div class="info-value">{{ $session->code }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Présentateur:</div>
                <div class="info-value">{{ $session->presenter->name ?? 'Système' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">{{ $session->started_at ? $session->started_at->format('d/m/Y H:i') : 'Non démarrée' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Durée:</div>
                <div class="info-value">
                    @if($session->started_at && $session->ended_at)
                        {{ $session->started_at->diffInMinutes($session->ended_at) }} minutes
                    @else
                        Non disponible
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Participants:</div>
                <div class="info-value">{{ $participants->count() }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Questions:</div>
                <div class="info-value">{{ $session->quiz->questions->count() }}</div>
            </div>
        </div>
    </div>

    <h3>Classement des Participants</h3>
    <table class="participants-table">
        <thead>
            <tr>
                <th>Rang</th>
                <th>Nom</th>
                <th>Score</th>
                <th>Bonnes Réponses</th>
                <th>Pourcentage</th>
                <th>Temps Total</th>
                @if($options['include_details'] ?? false)
                    <th>Temps Moyen/Question</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @foreach($participants as $index => $participant)
                <tr class="{{ $index === 0 ? 'rank-1' : ($index === 1 ? 'rank-2' : ($index === 2 ? 'rank-3' : '')) }}">
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $participant->user ? $participant->user->name : $participant->pseudo }}</td>
                    <td>{{ number_format($participant->score, 0) }}</td>
                    <td>
                        {{ $participant->answers->where('points_earned', '>', 0)->count() }}/{{ $session->quiz->questions->count() }}
                    </td>
                    <td>
                        @php
                            $totalQuestions = $session->quiz->questions->count();
                            $correctAnswers = $participant->answers->where('points_earned', '>', 0)->count();
                            $percentage = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100, 1) : 0;
                        @endphp
                        {{ $percentage }}%
                    </td>
                    <td>
                        @if($participant->finished_at)
                            {{ $participant->joined_at->diffInMinutes($participant->finished_at) }}min
                        @else
                            Non terminé
                        @endif
                    </td>
                    @if($options['include_details'] ?? false)
                        <td>
                            @if($participant->finished_at)
                                @php
                                    $totalMinutes = $participant->joined_at->diffInMinutes($participant->finished_at);
                                    $avgPerQuestion = $session->quiz->questions->count() > 0 ? 
                                        round($totalMinutes / $session->quiz->questions->count(), 1) : 0;
                                @endphp
                                {{ $avgPerQuestion }}min
                            @else
                                -
                            @endif
                        </td>
                    @endif
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="stats-summary">
        <h3>Statistiques Globales</h3>
        <div class="stats-grid">
            <div class="stats-row">
                <div class="stats-label">Score Moyen:</div>
                <div class="stats-value">{{ number_format($participants->avg('score'), 0) }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Score Maximum:</div>
                <div class="stats-value">{{ number_format($participants->max('score'), 0) }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Score Minimum:</div>
                <div class="stats-value">{{ number_format($participants->min('score'), 0) }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Taux de Réussite Global:</div>
                <div class="stats-value">
                    @php
                        $totalAnswers = $participants->sum(function($p) { return $p->answers->count(); });
                        $correctAnswers = $participants->sum(function($p) { return $p->answers->where('points_earned', '>', 0)->count(); });
                        $successRate = $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 1) : 0;
                    @endphp
                    {{ $successRate }}%
                </div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Participants ayant terminé:</div>
                <div class="stats-value">{{ $participants->whereNotNull('finished_at')->count() }}/{{ $participants->count() }}</div>
            </div>
        </div>
    </div>

    @if($options['include_answers'] ?? false)
        <div class="page-break">
            <h3>Détail des Réponses par Question</h3>
            @foreach($session->quiz->questions as $question)
                <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px;">
                    <h4>Question {{ $question->order }}: {{ $question->text }}</h4>
                    <p><strong>Type:</strong> {{ ucfirst($question->type) }} | 
                       <strong>Points:</strong> {{ $question->points }} | 
                       <strong>Temps limite:</strong> {{ $question->time_limit }}s</p>
                    
                    @if($question->type === 'single_choice' || $question->type === 'multiple_choice')
                        <div style="margin-top: 10px;">
                            @foreach($question->answers as $answer)
                                <div style="padding: 5px; {{ $answer->is_correct ? 'background-color: #d4edda; border: 1px solid #c3e6cb;' : '' }}">
                                    {{ $answer->text }} 
                                    @if($answer->is_correct)
                                        <strong>(Correcte)</strong>
                                    @endif
                                    - Choisie par {{ $participants->sum(function($p) use ($answer) { 
                                        return $p->answers->where('answer_id', $answer->id)->count(); 
                                    }) }} participants
                                </div>
                            @endforeach
                        </div>
                    @endif
                    
                    <div style="margin-top: 10px;">
                        <strong>Statistiques:</strong>
                        @php
                            $questionAnswers = $participants->flatMap(function($p) use ($question) { 
                                return $p->answers->where('question_id', $question->id); 
                            });
                            $correctCount = $questionAnswers->where('points_earned', '>', 0)->count();
                            $totalCount = $questionAnswers->count();
                            $successRate = $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0;
                        @endphp
                        {{ $correctCount }}/{{ $totalCount }} correct ({{ $successRate }}%)
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    <div class="footer">
        <p>Rapport généré le {{ $generated_at->format('d/m/Y à H:i') }} par RTFM2WIN</p>
        <p>{{ config('app.url') }}</p>
    </div>
</body>
</html>