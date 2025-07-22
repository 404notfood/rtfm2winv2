<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Résultats du Tournoi - {{ $tournament->title }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .tournament-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #2c3e50;
        }
        .tournament-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 5px solid #007bff;
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
            width: 25%;
            padding: 6px 15px 6px 0;
            color: #2c3e50;
        }
        .info-value {
            display: table-cell;
            padding: 6px 0;
            color: #007bff;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #007bff;
        }
        .ranking-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .ranking-table th,
        .ranking-table td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
        }
        .ranking-table th {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            font-weight: bold;
            text-align: center;
        }
        .ranking-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .ranking-table tr:hover {
            background-color: #e3f2fd;
        }
        .rank-1 { 
            background: linear-gradient(135deg, #ffd700, #ffed4e) !important; 
            font-weight: bold;
            color: #2c3e50;
        }
        .rank-2 { 
            background: linear-gradient(135deg, #c0c0c0, #e8e8e8) !important; 
            font-weight: bold;
            color: #2c3e50;
        }
        .rank-3 { 
            background: linear-gradient(135deg, #cd7f32, #deb887) !important; 
            font-weight: bold;
            color: #2c3e50;
        }
        .rank-cell {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
        }
        .player-info {
            display: flex;
            align-items: center;
        }
        .bracket-section {
            margin-top: 40px;
            page-break-before: always;
        }
        .matches-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        .matches-table th,
        .matches-table td {
            border: 1px solid #ddd;
            padding: 8px 6px;
            text-align: center;
        }
        .matches-table th {
            background-color: #6c757d;
            color: white;
            font-weight: bold;
        }
        .matches-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .match-winner {
            font-weight: bold;
            color: #28a745;
        }
        .match-loser {
            color: #6c757d;
        }
        .round-header {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 10px;
        }
        .stats-summary {
            background-color: #e9ecef;
            padding: 20px;
            border-radius: 8px;
            margin-top: 25px;
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
            width: 40%;
            padding: 8px 15px 8px 0;
            color: #2c3e50;
        }
        .stats-value {
            display: table-cell;
            padding: 8px 0;
            color: #007bff;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 2px solid #ddd;
            padding-top: 15px;
        }
        .tournament-type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .type-single-elimination {
            background-color: #dc3545;
            color: white;
        }
        .type-double-elimination {
            background-color: #fd7e14;
            color: white;
        }
        .type-round-robin {
            background-color: #20c997;
            color: white;
        }
        .winner-crown {
            font-size: 16px;
            color: #ffd700;
            margin-right: 8px;
        }
        .performance-indicators {
            margin: 20px 0;
        }
        .indicator {
            display: inline-block;
            margin: 0 10px 10px 0;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
        }
        .most-wins {
            background-color: #28a745;
            color: white;
        }
        .best-performance {
            background-color: #007bff;
            color: white;
        }
        .most-matches {
            background-color: #6f42c1;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏆 RTFM2WIN</div>
        <div class="tournament-title">{{ $tournament->title }}</div>
        <div>Rapport Final de Tournoi</div>
    </div>

    <div class="tournament-info">
        <h3>Informations du Tournoi</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Type de Tournoi:</div>
                <div class="info-value">
                    <span class="tournament-type-badge type-{{ str_replace('_', '-', $tournament->type) }}">
                        {{ ucfirst(str_replace('_', ' ', $tournament->type)) }}
                    </span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Organisateur:</div>
                <div class="info-value">{{ $tournament->creator->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Quiz Utilisé:</div>
                <div class="info-value">{{ $tournament->quiz->title ?? 'Non spécifié' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Participants:</div>
                <div class="info-value">{{ $tournament->participants->count() }} joueurs</div>
            </div>
            <div class="info-row">
                <div class="info-label">Matches Joués:</div>
                <div class="info-value">{{ $tournament->matches->whereNotNull('completed_at')->count() }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Début:</div>
                <div class="info-value">{{ $tournament->started_at ? $tournament->started_at->format('d/m/Y H:i') : 'Non démarré' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Fin:</div>
                <div class="info-value">{{ $tournament->ended_at ? $tournament->ended_at->format('d/m/Y H:i') : 'En cours' }}</div>
            </div>
            @if($tournament->started_at && $tournament->ended_at)
                <div class="info-row">
                    <div class="info-label">Durée Totale:</div>
                    <div class="info-value">{{ $tournament->started_at->diffForHumans($tournament->ended_at, true) }}</div>
                </div>
            @endif
        </div>
    </div>

    <h3 class="section-title">🏆 Classement Final</h3>
    <table class="ranking-table">
        <thead>
            <tr>
                <th style="width: 10%;">Rang</th>
                <th style="width: 40%;">Joueur</th>
                <th style="width: 15%;">Victoires</th>
                <th style="width: 15%;">Défaites</th>
                <th style="width: 20%;">Taux de Victoire</th>
            </tr>
        </thead>
        <tbody>
            @php
                $participants = $tournament->participants->map(function($participant) use ($tournament) {
                    $wins = $tournament->matches->where('winner_id', $participant->id)->count();
                    $totalMatches = $tournament->matches->filter(function($match) use ($participant) {
                        return ($match->participant1_id === $participant->id || $match->participant2_id === $participant->id) 
                            && $match->completed_at;
                    })->count();
                    $losses = $totalMatches - $wins;
                    $winRate = $totalMatches > 0 ? round(($wins / $totalMatches) * 100, 1) : 0;
                    
                    $participant->wins = $wins;
                    $participant->losses = $losses;
                    $participant->total_matches = $totalMatches;
                    $participant->win_rate = $winRate;
                    
                    return $participant;
                })->sortByDesc('wins')->sortByDesc('win_rate')->values();
            @endphp
            
            @foreach($participants as $index => $participant)
                <tr class="{{ $index === 0 ? 'rank-1' : ($index === 1 ? 'rank-2' : ($index === 2 ? 'rank-3' : '')) }}">
                    <td class="rank-cell">
                        @if($index === 0)
                            <span class="winner-crown">👑</span>
                        @endif
                        {{ $index + 1 }}
                    </td>
                    <td>
                        <strong>{{ $participant->user->name }}</strong>
                        @if($index === 0)
                            <span style="color: #ffd700; font-weight: bold; margin-left: 10px;">VAINQUEUR</span>
                        @endif
                    </td>
                    <td style="text-align: center; color: #28a745; font-weight: bold;">{{ $participant->wins }}</td>
                    <td style="text-align: center; color: #dc3545;">{{ $participant->losses }}</td>
                    <td style="text-align: center;">
                        <strong>{{ $participant->win_rate }}%</strong>
                        <br>
                        <small style="color: #666;">({{ $participant->total_matches }} matches)</small>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if($participants->count() > 0)
        <div class="performance-indicators">
            <h4>🏅 Distinctions Spéciales</h4>
            @php
                $mostWins = $participants->sortByDesc('wins')->first();
                $bestWinRate = $participants->where('total_matches', '>=', 2)->sortByDesc('win_rate')->first();
                $mostMatches = $participants->sortByDesc('total_matches')->first();
            @endphp
            
            @if($mostWins)
                <span class="indicator most-wins">
                    🏆 Plus de victoires: {{ $mostWins->user->name }} ({{ $mostWins->wins }})
                </span>
            @endif
            
            @if($bestWinRate && $bestWinRate->total_matches >= 2)
                <span class="indicator best-performance">
                    📈 Meilleur ratio: {{ $bestWinRate->user->name }} ({{ $bestWinRate->win_rate }}%)
                </span>
            @endif
            
            @if($mostMatches)
                <span class="indicator most-matches">
                    ⚡ Plus actif: {{ $mostMatches->user->name }} ({{ $mostMatches->total_matches }} matches)
                </span>
            @endif
        </div>
    @endif

    @if($options['include_matches'] ?? false)
        <div class="bracket-section">
            <h3 class="section-title">📋 Détail des Matches</h3>
            
            @php
                $matchesByRound = $tournament->matches->whereNotNull('completed_at')->groupBy('round')->sortKeys();
            @endphp
            
            @foreach($matchesByRound as $round => $matches)
                <div style="margin-bottom: 25px;">
                    <div class="round-header">Round {{ $round }}</div>
                    <table class="matches-table">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Joueur 1</th>
                                <th>Score 1</th>
                                <th>vs</th>
                                <th>Score 2</th>
                                <th>Joueur 2</th>
                                <th>Vainqueur</th>
                                <th>Terminé le</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($matches->sortBy('match_order') as $match)
                                <tr>
                                    <td><strong>#{{ $match->match_order }}</strong></td>
                                    <td class="{{ $match->winner_id === $match->participant1_id ? 'match-winner' : 'match-loser' }}">
                                        {{ $match->participant1->user->name }}
                                    </td>
                                    <td style="font-weight: bold;">{{ $match->score1 ?? '-' }}</td>
                                    <td style="color: #6c757d;">vs</td>
                                    <td style="font-weight: bold;">{{ $match->score2 ?? '-' }}</td>
                                    <td class="{{ $match->winner_id === $match->participant2_id ? 'match-winner' : 'match-loser' }}">
                                        {{ $match->participant2->user->name }}
                                    </td>
                                    <td class="match-winner">
                                        @if($match->winner)
                                            🏆 {{ $match->winner->user->name }}
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td style="font-size: 10px; color: #666;">
                                        {{ $match->completed_at ? $match->completed_at->format('d/m H:i') : '-' }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endforeach
        </div>
    @endif

    <div class="stats-summary">
        <h3>📊 Statistiques du Tournoi</h3>
        <div class="stats-grid">
            <div class="stats-row">
                <div class="stats-label">Matches Totaux:</div>
                <div class="stats-value">{{ $tournament->matches->count() }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Matches Terminés:</div>
                <div class="stats-value">{{ $tournament->matches->whereNotNull('completed_at')->count() }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Rounds Joués:</div>
                <div class="stats-value">{{ $tournament->current_round ?? 0 }}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">Taux de Participation:</div>
                <div class="stats-value">
                    @php
                        $expectedMatches = $tournament->matches->count();
                        $playedMatches = $tournament->matches->whereNotNull('completed_at')->count();
                        $completionRate = $expectedMatches > 0 ? round(($playedMatches / $expectedMatches) * 100, 1) : 0;
                    @endphp
                    {{ $completionRate }}%
                </div>
            </div>
            @if($tournament->started_at && $tournament->ended_at)
                <div class="stats-row">
                    <div class="stats-label">Durée Moyenne par Match:</div>
                    <div class="stats-value">
                        @php
                            $totalMinutes = $tournament->started_at->diffInMinutes($tournament->ended_at);
                            $completedMatches = $tournament->matches->whereNotNull('completed_at')->count();
                            $avgDuration = $completedMatches > 0 ? round($totalMinutes / $completedMatches, 1) : 0;
                        @endphp
                        {{ $avgDuration }} min
                    </div>
                </div>
            @endif
            <div class="stats-row">
                <div class="stats-label">Score Moyen par Match:</div>
                <div class="stats-value">
                    @php
                        $scores = $tournament->matches->whereNotNull('score1')->whereNotNull('score2');
                        $avgScore1 = $scores->avg('score1');
                        $avgScore2 = $scores->avg('score2');
                        $overallAvg = ($avgScore1 + $avgScore2) / 2;
                    @endphp
                    {{ number_format($overallAvg, 1) }}
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Rapport généré le {{ $generated_at->format('d/m/Y à H:i') }} par RTFM2WIN</strong></p>
        <p>Tournoi ID: {{ $tournament->id }} | Type: {{ ucfirst(str_replace('_', ' ', $tournament->type)) }}</p>
        <p>{{ config('app.url') }}</p>
    </div>
</body>
</html>