<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Statistiques Utilisateur - {{ $user->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 30px -20px;
            padding: 30px 20px 20px 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .user-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .report-subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        .user-info {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border-left: 5px solid #007bff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
            padding: 8px 15px 8px 0;
            color: #2c3e50;
        }
        .info-value {
            display: table-cell;
            padding: 8px 0;
            color: #007bff;
            font-weight: 500;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 15px 0;
            padding: 10px 0 8px 0;
            border-bottom: 2px solid #007bff;
            position: relative;
        }
        .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            bottom: -2px;
            width: 50px;
            height: 4px;
            background: linear-gradient(135deg, #007bff, #0056b3);
        }
        .stats-cards {
            display: table;
            width: 100%;
            margin-bottom: 25px;
        }
        .stats-card {
            display: table-cell;
            width: 25%;
            padding: 15px;
            margin: 0 10px 20px 0;
            background: white;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            border-top: 4px solid #007bff;
        }
        .stats-card:last-child {
            margin-right: 0;
        }
        .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }
        .card-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .performance-chart {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            text-align: center;
        }
        .progress-bar {
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 20px;
            background: linear-gradient(90deg, #007bff, #0056b3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
        }
        .achievements-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .badge-grid {
            display: table;
            width: 100%;
        }
        .badge-row {
            display: table-row;
        }
        .badge-cell {
            display: table-cell;
            width: 33.33%;
            padding: 10px;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 5px;
        }
        .badge-creator {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
        }
        .badge-player {
            background: linear-gradient(135deg, #007bff, #6610f2);
            color: white;
        }
        .badge-achievement {
            background: linear-gradient(135deg, #ffc107, #fd7e14);
            color: #2c3e50;
        }
        .badge-social {
            background: linear-gradient(135deg, #e83e8c, #dc3545);
            color: white;
        }
        .recent-activity {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .activity-item {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-date {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
        }
        .activity-description {
            font-weight: 500;
            color: #2c3e50;
        }
        .activity-score {
            float: right;
            color: #007bff;
            font-weight: bold;
        }
        .period-badge {
            display: inline-block;
            padding: 6px 12px;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 2px solid #ddd;
            padding-top: 15px;
        }
        .recommendation-box {
            background: linear-gradient(135deg, #17a2b8, #007bff);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 25px;
        }
        .recommendation-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .comparison-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .rank-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .rank-top {
            background: #28a745;
            color: white;
        }
        .rank-good {
            background: #ffc107;
            color: #2c3e50;
        }
        .rank-average {
            background: #6c757d;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">📊 RTFM2WIN</div>
        <div class="user-title">Rapport de Performance</div>
        <div class="report-subtitle">{{ $user->name }} - Période: {{ ucfirst($period) }}</div>
    </div>

    <div class="user-info">
        <h3>👤 Informations du Joueur</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nom d'utilisateur:</div>
                <div class="info-value">{{ $user->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">{{ $user->email }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Membre depuis:</div>
                <div class="info-value">{{ $user->created_at->format('d/m/Y') }} ({{ $user->created_at->diffForHumans() }})</div>
            </div>
            <div class="info-row">
                <div class="info-label">Dernière activité:</div>
                <div class="info-value">{{ $user->updated_at->diffForHumans() }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Statut:</div>
                <div class="info-value">
                    <span class="rank-indicator {{ $user->is_active ? 'rank-top' : 'rank-average' }}">
                        {{ $user->is_active ? 'Actif' : 'Inactif' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="section-title">📈 Statistiques Globales</div>
    <div class="period-badge">Période analysée: {{ $stats['Période'] }}</div>
    
    <div class="stats-cards">
        <div class="stats-card">
            <div class="card-value">{{ $stats['Quiz joués'] }}</div>
            <div class="card-label">Quiz Joués</div>
        </div>
        <div class="stats-card">
            <div class="card-value">{{ number_format($stats['Score total']) }}</div>
            <div class="card-label">Score Total</div>
        </div>
        <div class="stats-card">
            <div class="card-value">{{ number_format($stats['Score moyen'], 0) }}</div>
            <div class="card-label">Score Moyen</div>
        </div>
        <div class="stats-card">
            <div class="card-value">{{ number_format($stats['Meilleur score']) }}</div>
            <div class="card-label">Meilleur Score</div>
        </div>
    </div>

    <div class="performance-chart">
        <div class="chart-title">🎯 Performance Détaillée</div>
        
        <div style="margin: 15px 0;">
            <strong>Précision des Réponses</strong>
            @php
                $totalQuestions = $stats['Quiz joués'] * 10; // Estimation moyenne
                $accuracyRate = $totalQuestions > 0 ? min(100, ($stats['Bonnes réponses totales'] / $totalQuestions) * 100) : 0;
            @endphp
            <div class="progress-bar">
                <div class="progress-fill" style="width: {{ $accuracyRate }}%;">
                    {{ number_format($accuracyRate, 1) }}%
                </div>
            </div>
        </div>

        <div style="margin: 15px 0;">
            <strong>Efficacité (Score/Temps)</strong>
            @php
                $efficiency = $stats['Temps de jeu total (min)'] > 0 ? 
                    min(100, ($stats['Score total'] / $stats['Temps de jeu total (min)']) / 100) : 0;
            @endphp
            <div class="progress-bar">
                <div class="progress-fill" style="width: {{ $efficiency }}%;">
                    {{ number_format($efficiency, 1) }}%
                </div>
            </div>
        </div>

        <div style="margin: 15px 0;">
            <strong>Activité de Création</strong>
            @php
                $creationActivity = min(100, $stats['Quiz créés'] * 10);
            @endphp
            <div class="progress-bar">
                <div class="progress-fill" style="width: {{ $creationActivity }}%;">
                    {{ $stats['Quiz créés'] }} quiz créés
                </div>
            </div>
        </div>
    </div>

    <div class="section-title">📊 Analyse Détaillée</div>
    
    <div class="comparison-section">
        <h4>🎮 Métriques de Jeu</h4>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Bonnes réponses totales:</div>
                <div class="info-value">{{ $stats['Bonnes réponses totales'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Temps de jeu total:</div>
                <div class="info-value">{{ $stats['Temps de jeu total (min)'] }} minutes ({{ number_format($stats['Temps de jeu total (min)'] / 60, 1) }}h)</div>
            </div>
            <div class="info-row">
                <div class="info-label">Temps moyen par quiz:</div>
                <div class="info-value">
                    {{ $stats['Quiz joués'] > 0 ? number_format($stats['Temps de jeu total (min)'] / $stats['Quiz joués'], 1) : 0 }} min
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Quiz créés:</div>
                <div class="info-value">{{ $stats['Quiz créés'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Badges obtenus:</div>
                <div class="info-value">{{ $stats['Badges obtenus'] }}</div>
            </div>
        </div>
    </div>

    @if($user->badges && count($user->badges) > 0)
        <div class="achievements-section">
            <h4>🏆 Badges et Réalisations</h4>
            <div class="badge-grid">
                <div class="badge-row">
                    @php
                        $badgeTypes = ['creator', 'player', 'achievement', 'social'];
                        $userBadges = collect($user->badges)->take(12); // Limite pour l'affichage
                    @endphp
                    @foreach($userBadges->chunk(3) as $badgeChunk)
                        @foreach($badgeChunk as $index => $badge)
                            <div class="badge-cell">
                                @php
                                    $type = $badgeTypes[$index % 4];
                                @endphp
                                <span class="badge badge-{{ $type }}">
                                    Badge {{ $loop->iteration }}
                                </span>
                            </div>
                        @endforeach
                    @endforeach
                </div>
            </div>
        </div>
    @endif

    <div class="recent-activity">
        <h4>📅 Résumé de Performance</h4>
        <div class="activity-item">
            <div class="activity-date">Score par quiz</div>
            <div class="activity-description">
                Score moyen de {{ number_format($stats['Score moyen'], 0) }} points
                <span class="activity-score">
                    @if($stats['Score moyen'] >= 2000)
                        <span class="rank-indicator rank-top">Excellent</span>
                    @elseif($stats['Score moyen'] >= 1000)
                        <span class="rank-indicator rank-good">Très Bien</span>
                    @else
                        <span class="rank-indicator rank-average">Peut Mieux Faire</span>
                    @endif
                </span>
            </div>
        </div>
        
        <div class="activity-item">
            <div class="activity-date">Régularité</div>
            <div class="activity-description">
                {{ $stats['Quiz joués'] }} quiz joués sur la période
                <span class="activity-score">
                    @if($stats['Quiz joués'] >= 20)
                        <span class="rank-indicator rank-top">Très Actif</span>
                    @elseif($stats['Quiz joués'] >= 5)
                        <span class="rank-indicator rank-good">Actif</span>
                    @else
                        <span class="rank-indicator rank-average">Peu Actif</span>
                    @endif
                </span>
            </div>
        </div>

        <div class="activity-item">
            <div class="activity-date">Contribution</div>
            <div class="activity-description">
                {{ $stats['Quiz créés'] }} quiz créés
                <span class="activity-score">
                    @if($stats['Quiz créés'] >= 5)
                        <span class="rank-indicator rank-top">Créateur Actif</span>
                    @elseif($stats['Quiz créés'] >= 1)
                        <span class="rank-indicator rank-good">Contributeur</span>
                    @else
                        <span class="rank-indicator rank-average">Spectateur</span>
                    @endif
                </span>
            </div>
        </div>
    </div>

    @php
        $overallScore = 0;
        $recommendations = [];
        
        // Calcul du score global
        if ($stats['Score moyen'] >= 2000) $overallScore += 25;
        elseif ($stats['Score moyen'] >= 1000) $overallScore += 15;
        else $overallScore += 5;
        
        if ($stats['Quiz joués'] >= 20) $overallScore += 25;
        elseif ($stats['Quiz joués'] >= 5) $overallScore += 15;
        else $overallScore += 5;
        
        if ($stats['Quiz créés'] >= 5) $overallScore += 25;
        elseif ($stats['Quiz créés'] >= 1) $overallScore += 15;
        else $overallScore += 5;
        
        if ($stats['Badges obtenus'] >= 10) $overallScore += 25;
        elseif ($stats['Badges obtenus'] >= 3) $overallScore += 15;
        else $overallScore += 5;
        
        // Recommandations
        if ($stats['Score moyen'] < 1500) {
            $recommendations[] = "Prenez plus de temps pour réfléchir aux réponses";
        }
        if ($stats['Quiz joués'] < 10) {
            $recommendations[] = "Participez à plus de quiz pour améliorer vos compétences";
        }
        if ($stats['Quiz créés'] == 0) {
            $recommendations[] = "Essayez de créer vos propres quiz pour diversifier votre expérience";
        }
    @endphp

    <div class="recommendation-box">
        <div class="recommendation-title">🎯 Score Global de Performance: {{ $overallScore }}/100</div>
        <div style="margin-top: 10px;">
            @if($overallScore >= 80)
                <strong>Excellent joueur !</strong> Vous maîtrisez parfaitement la plateforme.
            @elseif($overallScore >= 60)
                <strong>Bon joueur !</strong> Vous avez de solides compétences.
            @elseif($overallScore >= 40)
                <strong>Joueur prometteur !</strong> Continuez vos efforts.
            @else
                <strong>Débutant !</strong> Beaucoup de potentiel d'amélioration.
            @endif
        </div>
        
        @if(count($recommendations) > 0)
            <div style="margin-top: 15px;">
                <strong>Recommandations:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    @foreach($recommendations as $recommendation)
                        <li>{{ $recommendation }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>

    <div class="footer">
        <p><strong>Rapport généré le {{ $generated_at->format('d/m/Y à H:i') }} par RTFM2WIN</strong></p>
        <p>Période d'analyse: {{ ucfirst($period) }} | Utilisateur: {{ $user->name }} (ID: {{ $user->id }})</p>
        <p>{{ config('app.url') }}</p>
    </div>
</body>
</html>