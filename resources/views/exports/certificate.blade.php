<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificat de Participation - {{ $session->quiz->title }}</title>
    <style>
        @page {
            margin: 20mm;
            size: A4 landscape;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .certificate-container {
            background: white;
            margin: 20px;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
            min-height: calc(100vh - 40px);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 177, 153, 0.3) 0%, transparent 50%);
        }
        .certificate-border {
            border: 8px solid #007bff;
            border-radius: 15px;
            padding: 30px;
            height: calc(100% - 60px);
            position: relative;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .certificate-title {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .certificate-subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .recipient-section {
            text-align: center;
            margin: 50px 0;
        }
        .recipient-label {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 15px;
        }
        .recipient-name {
            font-size: 42px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 30px;
            text-decoration: underline;
            text-decoration-color: #007bff;
            text-underline-offset: 10px;
        }
        .achievement-text {
            font-size: 22px;
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 40px;
            text-align: center;
        }
        .quiz-info {
            background: rgba(0, 123, 255, 0.1);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border-left: 5px solid #007bff;
        }
        .quiz-title {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-top: 15px;
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
        .performance-badge {
            text-align: center;
            margin: 30px 0;
        }
        .badge {
            display: inline-block;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .badge-excellent {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #2c3e50;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }
        .badge-good {
            background: linear-gradient(135deg, #10ac84, #7bed9f);
            box-shadow: 0 4px 15px rgba(16, 172, 132, 0.4);
        }
        .badge-average {
            background: linear-gradient(135deg, #ff6b6b, #ffa726);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        .footer {
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            display: table;
            width: 100%;
            padding: 0 30px;
        }
        .signature-section {
            display: table-row;
        }
        .signature-left {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-right {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-line {
            border-top: 2px solid #2c3e50;
            margin: 20px auto 10px;
            width: 200px;
        }
        .signature-title {
            font-size: 14px;
            color: #7f8c8d;
            font-weight: bold;
        }
        .date-info {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #7f8c8d;
        }
        .decorative-elements {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            pointer-events: none;
        }
        .corner-decoration {
            position: absolute;
            width: 80px;
            height: 80px;
            border: 3px solid #007bff;
            opacity: 0.3;
        }
        .top-left {
            top: 0;
            left: 0;
            border-right: none;
            border-bottom: none;
        }
        .top-right {
            top: 0;
            right: 0;
            border-left: none;
            border-bottom: none;
        }
        .bottom-left {
            bottom: 0;
            left: 0;
            border-right: none;
            border-top: none;
        }
        .bottom-right {
            bottom: 0;
            right: 0;
            border-left: none;
            border-top: none;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="decorative-elements">
            <div class="corner-decoration top-left"></div>
            <div class="corner-decoration top-right"></div>
            <div class="corner-decoration bottom-left"></div>
            <div class="corner-decoration bottom-right"></div>
        </div>
        
        <div class="certificate-border">
            <div class="header">
                <div class="logo">RTFM2WIN</div>
                <div class="certificate-title">Certificat de Participation</div>
                <div class="certificate-subtitle">Attestation officielle de réussite</div>
            </div>

            <div class="recipient-section">
                <div class="recipient-label">Ce certificat est décerné à</div>
                <div class="recipient-name">{{ $participant->user ? $participant->user->name : $participant->pseudo }}</div>
            </div>

            <div class="achievement-text">
                pour avoir participé avec succès au quiz interactif et démontré ses connaissances dans le domaine d'étude.
            </div>

            <div class="quiz-info">
                <div class="quiz-title">{{ $session->quiz->title }}</div>
                @if($session->quiz->description)
                    <div style="margin-bottom: 15px; color: #666;">{{ $session->quiz->description }}</div>
                @endif
                
                <div class="stats-grid">
                    <div class="stats-row">
                        <div class="stats-label">Score Obtenu:</div>
                        <div class="stats-value">{{ number_format($stats['score']) }} points</div>
                    </div>
                    <div class="stats-row">
                        <div class="stats-label">Classement:</div>
                        <div class="stats-value">{{ $stats['rank'] }}{{ $stats['rank'] == 1 ? 'er' : 'ème' }} sur {{ $stats['total_participants'] }}</div>
                    </div>
                    <div class="stats-row">
                        <div class="stats-label">Bonnes Réponses:</div>
                        <div class="stats-value">{{ $stats['correct_answers'] }}/{{ $stats['total_questions'] }}</div>
                    </div>
                    <div class="stats-row">
                        <div class="stats-label">Taux de Réussite:</div>
                        <div class="stats-value">
                            @php
                                $percentage = $stats['total_questions'] > 0 ? 
                                    round(($stats['correct_answers'] / $stats['total_questions']) * 100, 1) : 0;
                            @endphp
                            {{ $percentage }}%
                        </div>
                    </div>
                    @if($stats['completion_time'])
                        <div class="stats-row">
                            <div class="stats-label">Temps de Completion:</div>
                            <div class="stats-value">{{ $stats['completion_time'] }} minutes</div>
                        </div>
                    @endif
                </div>
            </div>

            <div class="performance-badge">
                @php
                    $percentage = $stats['total_questions'] > 0 ? 
                        round(($stats['correct_answers'] / $stats['total_questions']) * 100, 1) : 0;
                    
                    if ($percentage >= 90) {
                        $badgeClass = 'badge-excellent';
                        $badgeText = 'Excellence';
                    } elseif ($percentage >= 70) {
                        $badgeClass = 'badge-good';
                        $badgeText = 'Très Bien';
                    } else {
                        $badgeClass = 'badge-average';
                        $badgeText = 'Participation';
                    }
                @endphp
                <div class="badge {{ $badgeClass }}">{{ $badgeText }}</div>
            </div>

            <div class="footer">
                <div class="signature-section">
                    <div class="signature-left">
                        <div class="signature-line"></div>
                        <div class="signature-title">{{ $session->presenter->name ?? 'Présentateur' }}</div>
                        <div style="font-size: 12px; color: #999;">Organisateur du Quiz</div>
                    </div>
                    <div class="signature-right">
                        <div class="signature-line"></div>
                        <div class="signature-title">RTFM2WIN</div>
                        <div style="font-size: 12px; color: #999;">Plateforme de Quiz Interactif</div>
                    </div>
                </div>
                
                <div class="date-info">
                    Délivré le {{ $generated_at->format('d/m/Y') }} à {{ $generated_at->format('H:i') }}
                    <br>
                    Numéro de certificat: {{ strtoupper(substr(md5($session->id . $participant->id), 0, 8)) }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>