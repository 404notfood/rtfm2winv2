import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface AuthModernLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthModernLayout({ children, title, description }: PropsWithChildren<AuthModernLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                    className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3] 
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
                <motion.div 
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5] 
                    }}
                    transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
                    animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1] 
                    }}
                    transition={{ 
                        duration: 20, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                />
            </div>

            {/* Main content */}
            <motion.div 
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Glass card effect */}
                <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                    {/* Card shine effect - using CSS animation class */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full animate-pulse" 
                         style={{
                             animation: 'shine 3s infinite',
                             animationTimingFunction: 'ease-in-out'
                         }} />
                    
                    {/* Header */}
                    <motion.div 
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Logo */}
                        <Link href={route('home')} className="inline-block mb-6 group">
                            <motion.div 
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300" />
                                <img 
                                    src="/img/logo4.png" 
                                    alt="RTFM2Win Logo" 
                                    className="relative w-16 h-16 mx-auto rounded-full shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                                />
                            </motion.div>
                        </Link>

                        {/* Title and description */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                {title}
                            </h1>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                {description}
                            </p>
                        </div>
                    </motion.div>

                    {/* Form content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div 
                    className="text-center mt-6 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <p>© 2024 RTFM2Win. Tous droits réservés.</p>
                </motion.div>
            </motion.div>

            {/* Add keyframes to global CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes shine {
                        0% { transform: translateX(-100%) skewX(-12deg); }
                        100% { transform: translateX(200%) skewX(-12deg); }
                    }
                `
            }} />
        </div>
    );
} 