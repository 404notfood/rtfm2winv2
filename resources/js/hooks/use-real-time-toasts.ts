import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';
import type { EchoEventData } from '@/types/echo';

export function useRealTimeToasts() {
    const { toast } = useToast();
    
    useEffect(() => {
        // Toast pour les événements quiz
        if (window.Echo) {
            // Événements quiz session
            window.Echo.private('quiz-session')
                .listen('SessionStarted', (e: EchoEventData) => {
                    toast.success({
                        title: "Quiz démarré !",
                        description: `Le quiz "${e.quiz?.title}" a commencé`,
                    });
                })
                .listen('ParticipantJoined', (e: EchoEventData) => {
                    toast.info({
                        title: "Nouveau participant",
                        description: `${e.participant?.nickname} a rejoint le quiz`,
                    });
                })
                .listen('LeaderboardUpdated', (e: EchoEventData) => {
                    // Notification discrète pour mise à jour classement
                    const topThree = e.leaderboard?.slice(0, 3);
                    if (topThree && topThree.length > 0) {
                        toast.info({
                            title: "Classement mis à jour",
                            description: `${topThree?.[0]?.nickname} est en tête !`,
                        });
                    }
                });

            // Événements Battle Royale
            window.Echo.private('battle-royale')
                .listen('ParticipantEliminated', (e: EchoEventData) => {
                    toast.warning({
                        title: "Élimination !",
                        description: `${e.participant?.pseudo} a été éliminé`,
                    });
                })
                .listen('EliminationRound', (e: EchoEventData) => {
                    toast.warning({
                        title: "Round d'élimination",
                        description: `${e.eliminated?.length} participants éliminés. ${e.remaining} restants`,
                    });
                })
                .listen('BattleRoyaleEnded', (e: EchoEventData) => {
                    toast.success({
                        title: "🏆 Victoire !",
                        description: `${e.winner?.pseudo || 'Champion'} remporte la Battle Royale !`,
                    });
                });

            // Événements achievements
            window.Echo.private('user-achievements')
                .listen('AchievementUnlocked', (e: EchoEventData) => {
                    toast.success({
                        title: "🏆 Succès débloqué !",
                        description: `Vous avez obtenu: ${e.achievement?.name}`,
                    });
                })
                .listen('BadgeEarned', (e: EchoEventData) => {
                    toast.success({
                        title: "🥇 Badge obtenu !",
                        description: `Nouveau badge: ${e.badge?.name}`,
                    });
                });

            // Événements tournois
            window.Echo.private('tournaments')
                .listen('TournamentStarted', (e: EchoEventData) => {
                    toast.info({
                        title: "🏟️ Tournoi démarré",
                        description: `Le tournoi "${e.tournament?.name}" commence`,
                    });
                })
                .listen('MatchCompleted', (e: EchoEventData) => {
                    toast.info({
                        title: "Match terminé",
                        description: `${e.winner?.name} bat ${e.loser?.name}`,
                    });
                });

            // Notifications système
            window.Echo.private('notifications')
                .listen('SystemNotification', (e: EchoEventData) => {
                    const variant = e.priority === 'high' ? 'error' : 
                                   e.priority === 'medium' ? 'warning' : 'info';
                    
                    const toastFn = toast[variant as keyof typeof toast] as (props: { title?: string; description?: string }) => void;
                    toastFn({
                        title: e.title,
                        description: e.message,
                    });
                });
        }

        // Toast pour les flash messages Laravel
        const props = (router as any).page?.props;
        const flash = props?.flash ?? {};
        const flashSuccess = flash.success;
        const flashError = flash.error;
        const flashWarning = flash.warning;
        const flashInfo = flash.info;

        if (flashSuccess) {
            toast.success({
                title: "Succès",
                description: flashSuccess,
            });
        }

        if (flashError) {
            toast.error({
                title: "Erreur",
                description: flashError,
            });
        }

        if (flashWarning) {
            toast.warning({
                title: "Attention",
                description: flashWarning,
            });
        }

        if (flashInfo) {
            toast.info({
                title: "Information",
                description: flashInfo,
            });
        }

        // Cleanup
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('quiz-session');
                window.Echo.leaveChannel('battle-royale');
                window.Echo.leaveChannel('user-achievements');
                window.Echo.leaveChannel('tournaments');
                window.Echo.leaveChannel('notifications');
            }
        };
    }, []);
}

// Hook pour toasts manuels spécifiques au quiz
export function useQuizToasts() {
    const { toast } = useToast();
    
    const showCorrectAnswer = () => {
        toast.success({
            title: "✅ Bonne réponse !",
            description: "Vous avez gagné des points",
        });
    };

    const showIncorrectAnswer = () => {
        toast.error({
            title: "❌ Mauvaise réponse",
            description: "Continuez, vous ferez mieux la prochaine fois",
        });
    };

    const showTimeUp = () => {
        toast.warning({
            title: "⏰ Temps écoulé",
            description: "Passons à la question suivante",
        });
    };

    const showQuizStartingSoon = (seconds: number) => {
        toast.info({
            title: "🚀 Quiz bientôt démarré",
            description: `Le quiz commence dans ${seconds} secondes`,
        });
    };

    const showPowerUpActivated = (powerUp: string) => {
        toast.success({
            title: "⚡ Power-up activé !",
            description: `Vous avez utilisé: ${powerUp}`,
        });
    };

    return {
        showCorrectAnswer,
        showIncorrectAnswer,
        showTimeUp,
        showQuizStartingSoon,
        showPowerUpActivated,
    };
}