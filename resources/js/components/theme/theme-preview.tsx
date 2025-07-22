import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play, Trophy, XCircle } from 'lucide-react';

interface Props {
    variables: Record<string, string>;
    mode: 'desktop' | 'mobile';
    fontFamily: string;
    borderRadius: number;
}

export function ThemePreview({ variables, mode, fontFamily, borderRadius }: Props) {
    const containerClass = mode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full';

    const previewStyle = {
        fontFamily,
        '--border-radius': `${borderRadius}px`,
        ...Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, value])),
    } as React.CSSProperties;

    return (
        <div className={containerClass} style={previewStyle}>
            <div
                className="space-y-4 rounded-lg border p-4"
                style={{
                    backgroundColor: variables['--bg-primary'],
                    color: variables['--text-primary'],
                    borderColor: variables['--border-color'],
                }}
            >
                {/* Header Preview */}
                <div
                    className="flex items-center justify-between rounded-lg p-4"
                    style={{
                        backgroundColor: variables['--bg-secondary'],
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    <div>
                        <h3 className="text-lg font-semibold">RTFM2WIN Quiz</h3>
                        <p style={{ color: variables['--text-secondary'] }}>Aperçu du thème</p>
                    </div>
                    <Button
                        size="sm"
                        style={{
                            backgroundColor: variables['--button-primary-bg'],
                            color: variables['--button-primary-text'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Jouer
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="rounded-lg p-3 text-center"
                        style={{
                            backgroundColor: variables['--bg-tertiary'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <div className="text-xl font-bold" style={{ color: variables['--accent-primary'] }}>
                            1,234
                        </div>
                        <div className="text-xs" style={{ color: variables['--text-muted'] }}>
                            Points
                        </div>
                    </div>
                    <div
                        className="rounded-lg p-3 text-center"
                        style={{
                            backgroundColor: variables['--bg-tertiary'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <div className="text-xl font-bold" style={{ color: variables['--accent-secondary'] }}>
                            #3
                        </div>
                        <div className="text-xs" style={{ color: variables['--text-muted'] }}>
                            Classement
                        </div>
                    </div>
                </div>

                {/* Quiz Question Preview */}
                <div
                    className="rounded-lg border p-4"
                    style={{
                        backgroundColor: variables['--bg-secondary'],
                        borderColor: variables['--border-color'],
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">Question 3/10</span>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" style={{ color: variables['--timer-bg'] }} />
                            <span className="font-mono text-sm">0:15</span>
                        </div>
                    </div>

                    <h4 className="mb-3 font-semibold">Quelle est la capitale de la France ?</h4>

                    <div className="space-y-2">
                        {['Paris', 'Londres', 'Berlin', 'Madrid'].map((answer, index) => (
                            <button
                                key={answer}
                                className="w-full rounded-lg border p-3 text-left transition-colors"
                                style={{
                                    backgroundColor:
                                        index === 0
                                            ? variables['--quiz-correct'] + '20'
                                            : index === 1
                                              ? variables['--quiz-incorrect'] + '20'
                                              : variables['--bg-primary'],
                                    borderColor:
                                        index === 0
                                            ? variables['--quiz-correct']
                                            : index === 1
                                              ? variables['--quiz-incorrect']
                                              : variables['--border-color'],
                                    borderRadius: `${borderRadius}px`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                                        style={{
                                            borderColor:
                                                index === 0
                                                    ? variables['--quiz-correct']
                                                    : index === 1
                                                      ? variables['--quiz-incorrect']
                                                      : variables['--border-color'],
                                        }}
                                    >
                                        {index === 0 && <CheckCircle className="h-4 w-4" style={{ color: variables['--quiz-correct'] }} />}
                                        {index === 1 && <XCircle className="h-4 w-4" style={{ color: variables['--quiz-incorrect'] }} />}
                                    </div>
                                    <span>{answer}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div
                    className="rounded-lg border p-4"
                    style={{
                        backgroundColor: variables['--bg-secondary'],
                        borderColor: variables['--border-color'],
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <Trophy className="h-5 w-5" style={{ color: variables['--leaderboard-gold'] }} />
                        <span className="font-semibold">Classement</span>
                    </div>

                    <div className="space-y-2">
                        {[
                            { name: 'Alice', score: 3450, rank: 1, color: variables['--leaderboard-gold'] },
                            { name: 'Bob', score: 3200, rank: 2, color: variables['--leaderboard-silver'] },
                            { name: 'Charlie', score: 2980, rank: 3, color: variables['--leaderboard-bronze'] },
                        ].map((player) => (
                            <div
                                key={player.name}
                                className="flex items-center gap-3 rounded p-2"
                                style={{
                                    backgroundColor: variables['--bg-tertiary'],
                                    borderRadius: `${borderRadius}px`,
                                }}
                            >
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                                    style={{ backgroundColor: player.color }}
                                >
                                    {player.rank}
                                </div>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback style={{ fontSize: '0.75rem' }}>{player.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{player.name}</div>
                                    <div className="text-xs" style={{ color: variables['--text-muted'] }}>
                                        {player.score} points
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons Preview */}
                <div className="space-y-3">
                    <Button
                        className="w-full"
                        style={{
                            backgroundColor: variables['--button-primary-bg'],
                            color: variables['--button-primary-text'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Bouton principal
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        style={{
                            backgroundColor: variables['--button-secondary-bg'],
                            color: variables['--button-secondary-text'],
                            borderColor: variables['--border-color'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Bouton secondaire
                    </Button>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge
                        style={{
                            backgroundColor: variables['--success'] + '20',
                            color: variables['--success'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Succès
                    </Badge>
                    <Badge
                        style={{
                            backgroundColor: variables['--warning'] + '20',
                            color: variables['--warning'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Attention
                    </Badge>
                    <Badge
                        style={{
                            backgroundColor: variables['--error'] + '20',
                            color: variables['--error'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Erreur
                    </Badge>
                    <Badge
                        style={{
                            backgroundColor: variables['--info'] + '20',
                            color: variables['--info'],
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        Info
                    </Badge>
                </div>

                {/* Timer Preview */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Temps restant</span>
                        <span className="font-mono text-sm">0:30</span>
                    </div>
                    <div className="h-3 w-full rounded-full" style={{ backgroundColor: variables['--bg-tertiary'] }}>
                        <div
                            className="h-3 w-1/2 rounded-full transition-all"
                            style={{
                                backgroundColor: variables['--timer-bg'],
                                borderRadius: `${borderRadius}px`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
