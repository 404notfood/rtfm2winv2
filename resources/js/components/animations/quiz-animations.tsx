import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Animation pour l'apparition des questions
export const QuestionReveal = ({ children, isVisible }: { children: ReactNode; isVisible: boolean }) => (
    <AnimatePresence mode="wait">
        {isVisible && (
            <motion.div
                key="question"
                initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                transition={{ 
                    duration: 0.6, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    staggerChildren: 0.1
                }}
                className="transform-gpu"
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

// Animation pour les réponses
export const AnswerOption = ({ children, index, isSelected, isCorrect, isRevealed }: {
    children: ReactNode;
    index: number;
    isSelected?: boolean;
    isCorrect?: boolean;
    isRevealed?: boolean;
}) => {
    const getAnswerVariant = () => {
        if (!isRevealed) return 'default';
        if (isCorrect) return 'correct';
        if (isSelected && !isCorrect) return 'incorrect';
        return 'neutral';
    };

    const variants = {
        default: {
            backgroundColor: 'rgb(249 250 251)',
            borderColor: 'rgb(209 213 219)',
            scale: isSelected ? 1.02 : 1,
        },
        correct: {
            backgroundColor: 'rgb(220 252 231)',
            borderColor: 'rgb(34 197 94)',
            scale: 1.05,
        },
        incorrect: {
            backgroundColor: 'rgb(254 226 226)',
            borderColor: 'rgb(239 68 68)',
            scale: 0.98,
        },
        neutral: {
            backgroundColor: 'rgb(243 244 246)',
            borderColor: 'rgb(156 163 175)',
            scale: 1,
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, x: -10 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                x: 0,
                ...variants[getAnswerVariant()]
            }}
            whileHover={{ 
                scale: isRevealed ? variants[getAnswerVariant()].scale : 1.03,
                borderColor: isRevealed ? variants[getAnswerVariant()].borderColor : 'rgb(59 130 246)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
                delay: index * 0.1,
                duration: 0.3,
                type: "spring",
                stiffness: 400,
                damping: 30
            }}
            className="transform-gpu border-2 rounded-lg p-4 cursor-pointer"
        >
            {children}
        </motion.div>
    );
};

// Animation pour le leaderboard
export const LeaderboardEntry = ({ children, position, isCurrentUser, points }: {
    children: ReactNode;
    position: number;
    isCurrentUser?: boolean;
    points?: number;
}) => {
    const getRankColor = () => {
        switch (position) {
            case 1: return 'from-yellow-400 to-yellow-600'; // Or
            case 2: return 'from-gray-300 to-gray-500'; // Argent
            case 3: return 'from-amber-600 to-amber-800'; // Bronze
            default: return 'from-blue-500 to-blue-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            transition={{ 
                delay: position * 0.05,
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className={`
                relative overflow-hidden rounded-lg p-4 transform-gpu
                ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                ${position <= 3 ? `bg-gradient-to-r ${getRankColor()} text-white` : 'bg-white border'}
            `}
        >
            {/* Effet particules pour le podium */}
            {position <= 3 && (
                <motion.div
                    className="absolute inset-0 opacity-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.5 }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            initial={{ 
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                scale: 0
                            }}
                            animate={{ 
                                scale: [0, 1, 0],
                                y: [Math.random() * 100 + '%', '-10%']
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </motion.div>
            )}
            {children}
        </motion.div>
    );
};

// Animation pour les éliminatinos Battle Royale
export const EliminationAnimation = ({ children, isEliminated }: {
    children: ReactNode;
    isEliminated: boolean;
}) => (
    <motion.div
        animate={isEliminated ? {
            opacity: 0.3,
            scale: 0.95,
            filter: 'grayscale(100%)',
            x: -20,
        } : {
            opacity: 1,
            scale: 1,
            filter: 'grayscale(0%)',
            x: 0,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="transform-gpu"
    >
        {children}
        {isEliminated && (
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg"
            >
                <motion.span
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-red-600 font-bold text-lg"
                >
                    ÉLIMINÉ
                </motion.span>
            </motion.div>
        )}
    </motion.div>
);

// Animation pour les power-ups Battle Royale
export const PowerUpActivation = ({ powerUp, isActive }: {
    powerUp: string;
    isActive: boolean;
}) => (
    <AnimatePresence>
        {isActive && (
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                }}
                className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    ⚡ {powerUp}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// Animation pour le countdown/timer
export const CountdownTimer = ({ timeLeft, isUrgent }: {
    timeLeft: number;
    isUrgent: boolean;
}) => (
    <motion.div
        animate={isUrgent ? {
            scale: [1, 1.1, 1],
            color: ['rgb(239 68 68)', 'rgb(185 28 28)', 'rgb(239 68 68)'],
        } : {
            scale: 1,
            color: 'rgb(107 114 128)',
        }}
        transition={{ 
            duration: isUrgent ? 0.5 : 0.3,
            repeat: isUrgent ? Infinity : 0
        }}
        className="text-2xl font-bold transform-gpu"
    >
        <motion.span
            key={timeLeft}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {timeLeft}
        </motion.span>
    </motion.div>
);

// Animation pour les notifications de score
export const ScorePopup = ({ score, isVisible, type = 'correct' }: {
    score: number;
    isVisible: boolean;
    type?: 'correct' | 'incorrect' | 'bonus';
}) => {
    const getScoreColor = () => {
        switch (type) {
            case 'correct': return 'text-green-500';
            case 'incorrect': return 'text-red-500';
            case 'bonus': return 'text-purple-500';
            default: return 'text-blue-500';
        }
    };

    const getScoreIcon = () => {
        switch (type) {
            case 'correct': return '✅';
            case 'incorrect': return '❌';
            case 'bonus': return '🎉';
            default: return '⭐';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: [0.5, 1.2, 1], 
                        y: [20, -10, 0]
                    }}
                    exit={{ 
                        opacity: 0, 
                        scale: 0.8, 
                        y: -30,
                        transition: { duration: 0.4 }
                    }}
                    transition={{ 
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className={`text-2xl font-bold ${getScoreColor()} transform-gpu flex items-center gap-2`}
                >
                    <motion.span
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {getScoreIcon()}
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {type === 'correct' ? '+' : ''}{score} pts
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Animation pour les transitions de page
export const PageTransition = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="transform-gpu"
    >
        {children}
    </motion.div>
);