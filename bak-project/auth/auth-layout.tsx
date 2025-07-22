'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import { useTheme } from '../providers/ThemeProvider';
import { BorderBeam } from "../../components/magicui/border-beam";
import styles from './auth.module.css';


interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Assurer que la vérification de thème ne se fait que côté client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Déterminer les couleurs de brillance en fonction du thème
  const getShineColors = () => {
    if (!mounted) return ["#4f46e5", "#7c3aed", "#ec4899"]; // Couleurs par défaut
    
    if (currentTheme?.code === 'neon') {
      return ["#ff00ff", "#00ffff", "#ff00aa"];
    }
    
    if (currentTheme?.code === 'dark') {
      return ["#4f46e5", "#7c3aed", "#3c3c89"];
    }
    
    // Si le thème a des couleurs primaires/secondaires spécifiques
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || "#7c3aed";
    
    return [primaryColor || "#4f46e5", secondaryColor, "#ec4899"];
  };
  
  const shineColors = getShineColors();
  
  // Déterminer la classe du thème pour l'appliquer au conteneur global
  const getThemeClass = () => {
    if (!mounted || !currentTheme) return '';
    return `theme-${currentTheme.code}`;
  };

  return (
    <div className={`${styles.authContainer} ${getThemeClass()}`}>
      {/* Arrière-plan */}
      <div className={styles.authBg}>
        <div className={styles.authBgPattern}></div>
        <div className={styles.authBgGradient}></div>
        
     
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Contenu principal */}
      <div className={styles.authContentWrapper}>
        <div className={styles.authContent}>
          <div className="relative w-full max-w-[450px]">
            <motion.div
              className={`${styles.authCard} relative`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* BorderBeam appliqué directement sur la carte */}
              <BorderBeam 
                size={600}
                duration={8}
                colorFrom={shineColors[0]}
                colorTo={shineColors[5]}
                delay={0}
              />
              
              {/* Effet de brillance supplémentaire (notre effet personnalisé) */}
              <div className={styles.authCardShine}></div>
            
              {/* Logo */}
              <motion.div 
                className={styles.authLogo}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link href="/">
                  <div className="flex items-center">
                    <Image
                      src="/img/logo4.png"
                      alt="RTFM2Win Logo"
                      width={50}
                      height={50}
                      className={styles.authLogoImg}
                    />
                    <span className={styles.authLogoText}>RTFM2Win</span>
                  </div>
                </Link>
              </motion.div>
              
              {/* Contenu enfant (formulaire) */}
              {children}
            </motion.div>
          </div>
          </div>
          
        </div>
      </div>
  );
} 