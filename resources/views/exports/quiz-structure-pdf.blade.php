<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Structure du Quiz - {{ $quiz->title }}</title>
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
        .quiz-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #2c3e50;
        }
        .quiz-meta {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 5px solid #007bff;
        }
        .meta-grid {
            display: table;
            width: 100%;
        }
        .meta-row {
            display: table-row;
        }
        .meta-label {
            display: table-cell;
            font-weight: bold;
            width: 25%;
            padding: 6px 15px 6px 0;
            color: #2c3e50;
        }
        .meta-value {
            display: table-cell;
            padding: 6px 0;
            color: #007bff;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 15px 0;
            padding: 10px 0 8px 0;
            border-bottom: 2px solid #007bff;
        }
        .question-card {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        .question-header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            display: table;
            width: 100%;
        }
        .question-number {
            display: table-cell;
            width: 80px;
            font-size: 16px;
        }
        .question-info {
            display: table-cell;
            font-size: 14px;
        }
        .question-stats {
            display: table-cell;
            text-align: right;
            font-size: 11px;
            opacity: 0.9;
        }
        .question-content {
            padding: 20px;
        }
        .question-text {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            color: #2c3e50;
            line-height: 1.6;
        }
        .question-details {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 11px;
        }
        .detail-item {
            display: inline-block;
            margin-right: 20px;
            color: #666;
        }
        .detail-label {
            font-weight: bold;
            color: #2c3e50;
        }
        .answers-section {
            margin-top: 15px;
        }
        .answers-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
            font-size: 13px;
        }
        .answer-item {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
        }
        .answer-correct {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border: 1px solid #28a745;
        }
        .answer-incorrect {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        .answer-letter {
            display: table-cell;
            width: 25px;
            font-weight: bold;
            color: #666;
        }
        .answer-text {
            display: table-cell;
            color: #2c3e50;
        }
        .answer-status {
            display: table-cell;
            width: 80px;
            text-align: right;
            font-size: 10px;
            font-weight: bold;
        }
        .correct-indicator {
            color: #28a745;
        }
        .incorrect-indicator {
            color: #6c757d;
        }
        .quiz-summary {
            background: #e9ecef;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .summary-stats {
            display: table;
            width: 100%;
        }
        .summary-row {
            display: table-row;
        }
        .summary-label {
            display: table-cell;
            font-weight: bold;
            width: 40%;
            padding: 8px 15px 8px 0;
            color: #2c3e50;
        }
        .summary-value {
            display: table-cell;
            padding: 8px 0;
            color: #007bff;
            font-weight: bold;
        }
        .tags-section {
            margin: 15px 0;
        }
        .tag {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            margin: 0 5px 5px 0;
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
        .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .type-single-choice {
            background: #007bff;
            color: white;
        }
        .type-multiple-choice {
            background: #28a745;
            color: white;
        }
        .type-true-false {
            background: #ffc107;
            color: #2c3e50;
        }
        .type-open-ended {
            background: #17a2b8;
            color: white;
        }
        .difficulty-indicator {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .difficulty-easy {
            background: #28a745;
            color: white;
        }
        .difficulty-medium {
            background: #ffc107;
            color: #2c3e50;
        }
        .difficulty-hard {
            background: #dc3545;
            color: white;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">📝 RTFM2WIN</div>
        <div class="quiz-title">{{ $quiz->title }}</div>
        <div>Structure Détaillée du Quiz</div>
    </div>

    <div class="quiz-meta">
        <h3>ℹ️ Informations Générales</h3>
        <div class="meta-grid">
            <div class="meta-row">
                <div class="meta-label">Titre du Quiz:</div>
                <div class="meta-value">{{ $quiz->title }}</div>
            </div>
            @if($quiz->description)
                <div class="meta-row">
                    <div class="meta-label">Description:</div>
                    <div class="meta-value">{{ $quiz->description }}</div>
                </div>
            @endif
            <div class="meta-row">
                <div class="meta-label">Créateur:</div>
                <div class="meta-value">{{ $quiz->creator->name }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Date de Création:</div>
                <div class="meta-value">{{ $quiz->created_at->format('d/m/Y H:i') }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Dernière Modification:</div>
                <div class="meta-value">{{ $quiz->updated_at->format('d/m/Y H:i') }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Statut:</div>
                <div class="meta-value">
                    <span class="type-badge {{ $quiz->is_active ? 'type-single-choice' : 'difficulty-indicator difficulty-medium' }}">
                        {{ $quiz->is_active ? 'Actif' : 'Inactif' }}
                    </span>
                </div>
            </div>
            @if($quiz->category)
                <div class="meta-row">
                    <div class="meta-label">Catégorie:</div>
                    <div class="meta-value">{{ ucfirst($quiz->category) }}</div>
                </div>
            @endif
        </div>

        @if($quiz->tags && count($quiz->tags) > 0)
            <div class="tags-section">
                <strong>🏷️ Tags:</strong>
                @foreach($quiz->tags as $tag)
                    <span class="tag">{{ $tag->name }}</span>
                @endforeach
            </div>
        @endif
    </div>

    <div class="quiz-summary">
        <h3>📊 Résumé Statistique</h3>
        <div class="summary-stats">
            <div class="summary-row">
                <div class="summary-label">Nombre de Questions:</div>
                <div class="summary-value">{{ $quiz->questions->count() }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Points Totaux:</div>
                <div class="summary-value">{{ $quiz->questions->sum('points') }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Temps Estimé:</div>
                <div class="summary-value">{{ $quiz->questions->sum('time_limit') }} secondes ({{ number_format($quiz->questions->sum('time_limit') / 60, 1) }} min)</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Types de Questions:</div>
                <div class="summary-value">
                    @php
                        $questionTypes = $quiz->questions->groupBy('type');
                    @endphp
                    @foreach($questionTypes as $type => $questions)
                        <span class="type-badge type-{{ str_replace('_', '-', $type) }}">
                            {{ ucfirst(str_replace('_', ' ', $type)) }} ({{ $questions->count() }})
                        </span>
                    @endforeach
                </div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Difficulté Moyenne:</div>
                <div class="summary-value">
                    @php
                        $avgPoints = $quiz->questions->avg('points');
                        $difficulty = $avgPoints >= 500 ? 'hard' : ($avgPoints >= 300 ? 'medium' : 'easy');
                        $difficultyText = $avgPoints >= 500 ? 'Difficile' : ($avgPoints >= 300 ? 'Moyen' : 'Facile');
                    @endphp
                    <span class="difficulty-indicator difficulty-{{ $difficulty }}">{{ $difficultyText }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="section-title">❓ Questions Détaillées</div>

    @foreach($quiz->questions->sortBy('order') as $question)
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">Q{{ $question->order }}</div>
                <div class="question-info">
                    <span class="type-badge type-{{ str_replace('_', '-', $question->type) }}">
                        {{ ucfirst(str_replace('_', ' ', $question->type)) }}
                    </span>
                </div>
                <div class="question-stats">
                    {{ $question->points }} pts | {{ $question->time_limit }}s
                    @php
                        $qDifficulty = $question->points >= 500 ? 'hard' : ($question->points >= 300 ? 'medium' : 'easy');
                        $qDifficultyText = $question->points >= 500 ? 'Difficile' : ($question->points >= 300 ? 'Moyen' : 'Facile');
                    @endphp
                    <br><span class="difficulty-indicator difficulty-{{ $qDifficulty }}">{{ $qDifficultyText }}</span>
                </div>
            </div>
            
            <div class="question-content">
                <div class="question-text">{{ $question->text }}</div>
                
                <div class="question-details">
                    <span class="detail-item">
                        <span class="detail-label">Type:</span> {{ ucfirst(str_replace('_', ' ', $question->type)) }}
                    </span>
                    <span class="detail-item">
                        <span class="detail-label">Points:</span> {{ $question->points }}
                    </span>
                    <span class="detail-item">
                        <span class="detail-label">Temps limite:</span> {{ $question->time_limit }} secondes
                    </span>
                    @if($question->explanation)
                        <span class="detail-item">
                            <span class="detail-label">Explication disponible:</span> Oui
                        </span>
                    @endif
                </div>

                @if($options['include_answers'] ?? false)
                    <div class="answers-section">
                        <div class="answers-title">💡 Réponses Possibles:</div>
                        @foreach($question->answers->sortBy('order') as $answer)
                            <div class="answer-item {{ $answer->is_correct ? 'answer-correct' : 'answer-incorrect' }}">
                                <div class="answer-letter">{{ chr(65 + $loop->index) }}.</div>
                                <div class="answer-text">{{ $answer->text }}</div>
                                <div class="answer-status">
                                    @if($answer->is_correct)
                                        <span class="correct-indicator">✓ CORRECTE</span>
                                    @else
                                        <span class="incorrect-indicator">✗ Incorrecte</span>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                        
                        @if($question->explanation)
                            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                                <strong>📚 Explication:</strong><br>
                                {{ $question->explanation }}
                            </div>
                        @endif
                    </div>
                @else
                    <div class="answers-section">
                        <div class="answers-title">💡 Réponses: {{ $question->answers->count() }} options disponibles</div>
                        <div style="font-size: 11px; color: #666; font-style: italic;">
                            (Détails masqués - utilisez l'option "Inclure les réponses" pour les voir)
                        </div>
                    </div>
                @endif
            </div>
        </div>
    @endforeach

    @if($quiz->questions->count() > 10)
        <div class="page-break">
            <div class="section-title">📈 Analyse Avancée du Quiz</div>
            
            <div class="quiz-summary">
                <h4>🔍 Répartition des Questions</h4>
                <div class="summary-stats">
                    @php
                        $typeDistribution = $quiz->questions->groupBy('type');
                        $difficultyDistribution = $quiz->questions->groupBy(function($q) {
                            return $q->points >= 500 ? 'Difficile' : ($q->points >= 300 ? 'Moyen' : 'Facile');
                        });
                        $timeDistribution = $quiz->questions->groupBy(function($q) {
                            return $q->time_limit >= 60 ? 'Long (60s+)' : ($q->time_limit >= 30 ? 'Moyen (30-59s)' : 'Court (<30s)');
                        });
                    @endphp
                    
                    <div class="summary-row">
                        <div class="summary-label">Par Type:</div>
                        <div class="summary-value">
                            @foreach($typeDistribution as $type => $questions)
                                {{ ucfirst(str_replace('_', ' ', $type)) }}: {{ $questions->count() }}
                                @if(!$loop->last), @endif
                            @endforeach
                        </div>
                    </div>
                    
                    <div class="summary-row">
                        <div class="summary-label">Par Difficulté:</div>
                        <div class="summary-value">
                            @foreach($difficultyDistribution as $difficulty => $questions)
                                {{ $difficulty }}: {{ $questions->count() }}
                                @if(!$loop->last), @endif
                            @endforeach
                        </div>
                    </div>
                    
                    <div class="summary-row">
                        <div class="summary-label">Par Durée:</div>
                        <div class="summary-value">
                            @foreach($timeDistribution as $duration => $questions)
                                {{ $duration }}: {{ $questions->count() }}
                                @if(!$loop->last), @endif
                            @endforeach
                        </div>
                    </div>
                    
                    <div class="summary-row">
                        <div class="summary-label">Points par Question:</div>
                        <div class="summary-value">
                            Min: {{ $quiz->questions->min('points') }}, 
                            Max: {{ $quiz->questions->max('points') }}, 
                            Moyenne: {{ number_format($quiz->questions->avg('points'), 0) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <div class="footer">
        <p><strong>Structure générée le {{ $generated_at->format('d/m/Y à H:i') }} par RTFM2WIN</strong></p>
        <p>Quiz: "{{ $quiz->title }}" | {{ $quiz->questions->count() }} questions | Créé par {{ $quiz->creator->name }}</p>
        <p>{{ config('app.url') }}</p>
    </div>
</body>
</html>