'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

// Définition de l'interface Theme (sans filename car on utilise data-theme)
interface Theme {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  is_premium?: boolean;
}

// Définition du contexte de thème
interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  isLoading: boolean;
  setTheme: (themeId: number) => Promise<void>;
}

// Thèmes par défaut à utiliser si l'API est inaccessible
const defaultThemes: Theme[] = [
  {
    id: 1,
    name: 'Clair',
    code: 'light',
    description: 'Thème clair par défaut',
    is_default: true,
    is_active: true
  },
  {
    id: 2,
    name: 'Sombre',
    code: 'dark',
    description: 'Thème sombre',
    is_default: false,
    is_active: true
  },
  {
    id: 3,
    name: 'Néon',
    code: 'neon',
    description: 'Thème néon vibrant',
    is_default: false,
    is_active: true
  },
  {
    id: 4,
    name: 'Élégant',
    code: 'elegant',
    description: 'Thème élégant et minimaliste',
    is_default: false,
    is_active: true
  },
  {
    id: 5,
    name: 'Pastel',
    code: 'pastel',
    description: 'Thème aux couleurs pastel',
    is_default: false,
    is_active: true
  },
  {
    id: 6,
    name: 'Fun',
    code: 'fun',
    description: 'Thème amusant et coloré',
    is_default: false,
    is_active: true
  }
];

// Création du contexte avec des valeurs par défaut
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: null,
  themes: [],
  isLoading: true,
  setTheme: async () => {},
});

// Hook pour accéder au contexte de thème
export const useTheme = () => useContext(ThemeContext);

// Props du ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// Composant ThemeProvider
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Fonction pour appliquer le thème à l'élément HTML (méthode data-theme uniquement)
  const applyTheme = (theme: Theme) => {
    // 1. Définir l'attribut data-theme pour les variables CSS dans globals.css
    document.documentElement.setAttribute('data-theme', theme.code);
    
    // 2. Ajouter la classe du thème pour la compatibilité
    document.documentElement.classList.remove('light', 'dark', 'neon', 'elegant', 'pastel', 'fun');
    document.documentElement.classList.add(theme.code);
    
    // 3. Supprimer tout ancien lien de feuille de style de thème (plus nécessaire)
    const existingLink = document.getElementById('theme-stylesheet');
    if (existingLink) {
      existingLink.remove();
    }

    // 4. Définir le localStorage pour la persistance
    localStorage.setItem('theme', theme.code);
    
    console.log(`Thème appliqué: ${theme.name} (${theme.code})`);
  };

  // Fonction pour changer de thème
  const setTheme = async (themeId: number) => {
    setIsLoading(true);
    try {
      // Trouver le thème dans la liste des thèmes
      const theme = themes.find(t => t.id === themeId);
      
      if (!theme) {
        console.warn(`Thème avec l'ID ${themeId} non trouvé, utilisation du thème par défaut`);
        // Utiliser le thème par défaut si le thème demandé n'existe pas
        const defaultTheme = themes.find(t => t.is_default) || themes[0];
        if (defaultTheme) {
          applyTheme(defaultTheme);
          setCurrentTheme(defaultTheme);
        }
        return;
      }
      
      // Appliquer le thème localement
      applyTheme(theme);
      setCurrentTheme(theme);
      
      // Vérifier si l'utilisateur est authentifié avant de sauvegarder sur le serveur
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        try {
          await api.post('themes/apply', { theme_id: themeId });
          console.log(`Préférence de thème sauvegardée sur le serveur: ${theme.name}`);
        } catch (error) {
          console.warn('Impossible de sauvegarder la préférence de thème sur le serveur:', error);
        }
      } else {
        console.log('Utilisateur non connecté - thème sauvegardé localement uniquement');
      }
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les thèmes depuis l'API
  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      try {
        // Essayer de charger les thèmes depuis l'API
        const response = await api.get('themes');
        if (response && response.status === 'success' && response.data && response.data.length > 0) {
          setThemes(response.data);
          setIsOffline(false);
          return;
        }
        
        // Si l'API échoue, utiliser les thèmes par défaut
        console.warn('API indisponible, utilisation des thèmes par défaut');
        setIsOffline(true);
        setThemes(defaultThemes);
      } catch (error) {
        console.warn('Impossible de charger les thèmes depuis l\'API, utilisation des thèmes par défaut:', error);
        setIsOffline(true);
        setThemes(defaultThemes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Appliquer le thème par défaut au chargement
  useEffect(() => {
    // Fonction pour appliquer le thème par défaut
    const applyInitialTheme = () => {
      if (themes.length === 0) {
        console.warn("Aucun thème disponible, impossible d'appliquer un thème initial");
        return;
      }

      // 1. Vérifier si un thème est déjà stocké dans localStorage
      const savedThemeCode = localStorage.getItem('theme');
      if (savedThemeCode) {
        const savedTheme = themes.find(t => t.code === savedThemeCode);
        if (savedTheme) {
          applyTheme(savedTheme);
          setCurrentTheme(savedTheme);
          return;
        }
      }
      
      // 2. Sinon, utiliser le thème par défaut
      const defaultTheme = themes.find(t => t.is_default) || themes[0];
      if (defaultTheme) {
        applyTheme(defaultTheme);
        setCurrentTheme(defaultTheme);
      }
    };

    // Appliquer le thème initial seulement après avoir chargé les thèmes
    if (!isLoading && themes.length > 0) {
      applyInitialTheme();
    }
  }, [isLoading, themes]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, isLoading, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 
