'use client';

import { useState, useEffect } from 'react';
import { themeService, Theme, UserThemePreferences } from '@/lib/api/theme';

// Classe POO pour la gestion centralisée des thèmes
class ThemeManager {
  static THEME_KEY = 'theme_code';

  /**
   * Applique le thème en mettant à jour l'attribut data-theme sur <html>
   */
  static applyTheme(themeCode: string) {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeCode);
    }
  }

  /**
   * Sauvegarde le code du thème dans le localStorage
   */
  static saveTheme(themeCode: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ThemeManager.THEME_KEY, themeCode);
    }
  }

  /**
   * Récupère le code du thème sauvegardé
   */
  static getSavedTheme(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ThemeManager.THEME_KEY);
    }
    return null;
  }

  /**
   * Convertit un nom de thème en code de thème
   */
  static getThemeCodeFromName(themeName: string): string {
    const themeNameToCode: { [key: string]: string } = {
      'light': 'light',
      'clair': 'light',
      'dark': 'dark', 
      'sombre': 'dark',
      'neon': 'neon',
      'néon': 'neon',
      'elegant': 'elegant',
      'élégant': 'elegant',
      'pastel': 'pastel',
      'fun': 'fun'
    };
    
    return themeNameToCode[themeName.toLowerCase()] || 'light';
  }

  /**
   * Applique un thème complet (visuel + sauvegarde)
   */
  static applyThemeComplete(themeCode: string) {
    this.applyTheme(themeCode);
    this.saveTheme(themeCode);
  }
}

// Fonction utilitaire pour valider la structure d'un thème
const validateTheme = (theme: any): theme is Theme => {
  return (
    theme &&
    typeof theme.id === 'number' &&
    typeof theme.name === 'string' &&
    theme.colors &&
    typeof theme.colors.primary === 'string' &&
    typeof theme.colors.secondary === 'string' &&
    typeof theme.colors.accent === 'string'
  );
};

// Fonction pour générer des couleurs basées sur le nom/code du thème
const generateThemeColors = (theme: any) => {
  const themeCode = theme?.code || theme?.name?.toLowerCase() || 'default';
  
  switch (themeCode) {
    case 'light':
    case 'clair':
      return {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text_primary: '#111827',
        text_secondary: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB'
      };
    case 'dark':
    case 'sombre':
      return {
        primary: '#1F2937',
        secondary: '#374151',
        accent: '#6366F1',
        background: '#111827',
        surface: '#1F2937',
        text_primary: '#F9FAFB',
        text_secondary: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      };
    case 'elegant':
    case 'élégant':
      return {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accent: '#C084FC',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text_primary: '#1E293B',
        text_secondary: '#64748B',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0EA5E9'
      };
    case 'neon':
    case 'néon':
      return {
        primary: '#00FF88',
        secondary: '#FF0080',
        accent: '#00D4FF',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        text_primary: '#FFFFFF',
        text_secondary: '#CCCCCC',
        success: '#00FF88',
        warning: '#FFD700',
        error: '#FF0080',
        info: '#00D4FF'
      };
    case 'pastel':
      return {
        primary: '#FFB3BA',
        secondary: '#BAFFC9',
        accent: '#BAE1FF',
        background: '#FFFACD',
        surface: '#FFFFFF',
        text_primary: '#4A4A4A',
        text_secondary: '#6B6B6B',
        success: '#98FB98',
        warning: '#F0E68C',
        error: '#FFB6C1',
        info: '#87CEEB'
      };
    case 'fun':
      return {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#45B7D1',
        background: '#FFF9E6',
        surface: '#FFFFFF',
        text_primary: '#2C3E50',
        text_secondary: '#7F8C8D',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB'
      };
    default:
      return defaultTheme.colors;
  }
};

// Fonction pour nettoyer et valider un thème
const sanitizeTheme = (theme: any): Theme => {
  console.log('Nettoyage du thème:', theme);
  
  if (validateTheme(theme)) {
    return theme;
  }
  
  // Générer des couleurs basées sur le thème
  const colors = generateThemeColors(theme);
  
  // Si le thème n'est pas valide, on retourne le thème par défaut avec les données disponibles
  const sanitizedTheme = {
    ...defaultTheme,
    id: theme?.id || 0,
    name: theme?.name || 'Thème inconnu',
    description: theme?.description || 'Thème avec données incomplètes',
    colors,
    fonts: theme?.fonts || defaultTheme.fonts,
    spacing: theme?.spacing || defaultTheme.spacing,
    effects: theme?.effects || defaultTheme.effects,
    is_default: theme?.is_default || false,
    is_active: theme?.is_active || false,
    is_public: theme?.is_public !== undefined ? theme.is_public : true,
    creator_id: theme?.creator_id,
    created_at: theme?.created_at || new Date().toISOString(),
    updated_at: theme?.updated_at || new Date().toISOString()
  };
  
  console.log('Thème nettoyé:', sanitizedTheme);
  return sanitizedTheme;
};

// Fonction pour générer des couleurs aléatoires pour les tests
const generateRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Thèmes de test avec des couleurs distinctes
const testThemes: Theme[] = [
  {
    id: 999,
    name: 'Thème Rouge',
    description: 'Thème de test rouge',
    colors: {
      primary: '#FF0000',
      secondary: '#FF6666',
      accent: '#FF3333',
      background: '#FFF5F5',
      surface: '#FFFFFF',
      text_primary: '#111827',
      text_secondary: '#6B7280',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB'
    },
    fonts: {
      primary_family: 'Inter, sans-serif',
      secondary_family: 'Inter, sans-serif',
      heading_size: '1.5rem',
      body_size: '1rem',
      small_size: '0.875rem',
      line_height: '1.5',
      letter_spacing: '0'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    effects: {
      border_radius: '0.5rem',
      shadow_sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      shadow_md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      shadow_lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      transition_duration: '150ms',
      animation_duration: '300ms'
    },
    is_default: false,
    is_active: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Thème par défaut de secours
const defaultTheme: Theme = {
  id: 0,
  name: 'Thème par défaut',
  description: 'Thème de base du système',
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text_primary: '#111827',
    text_secondary: '#6B7280',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB'
  },
  fonts: {
    primary_family: 'Inter, sans-serif',
    secondary_family: 'Inter, sans-serif',
    heading_size: '1.5rem',
    body_size: '1rem',
    small_size: '0.875rem',
    line_height: '1.5',
    letter_spacing: '0'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  effects: {
    border_radius: '0.5rem',
    shadow_sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadow_md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    shadow_lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition_duration: '150ms',
    animation_duration: '300ms'
  },
  is_default: true,
  is_active: false,
  is_public: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserThemePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les thèmes et le thème actuel
      const [themesData, currentThemeData] = await Promise.all([
        themeService.getAll(),
        themeService.getCurrent()
      ]);
      
      // Essayer de charger les préférences utilisateur (peut échouer)
      let preferencesData: any = { success: false, data: null };
      try {
        preferencesData = await themeService.getUserTheme();
      } catch (prefError) {
        console.warn('Impossible de charger les préférences utilisateur:', prefError);
      }
      
      console.log('Données des thèmes:', themesData);
      console.log('Thème actuel:', currentThemeData);
      console.log('Préférences:', preferencesData);
      
      // Debug: afficher la structure des thèmes
      if (themesData.data && themesData.data.length > 0) {
        console.log('Premier thème:', themesData.data[0]);
        console.log('Couleurs du premier thème:', themesData.data[0].colors);
        console.log('Structure complète du premier thème:', JSON.stringify(themesData.data[0], null, 2));
      }
      
      // Vérifier si les réponses sont valides (l'API Laravel retourne 'status' au lieu de 'success')
      if (themesData.success === false || (themesData as any).status === 'error') {
        throw new Error(themesData.message || 'Erreur lors du chargement des thèmes');
      }
      
      // Nettoyer et valider les thèmes
      const cleanThemes = (themesData.data || []).map(sanitizeTheme);
      const cleanCurrentTheme = currentThemeData.data ? sanitizeTheme(currentThemeData.data) : defaultTheme;
      
      // Utiliser seulement les thèmes de l'API (plus le thème de test rouge pour comparaison)
      const allThemes = [...cleanThemes, testThemes[0]]; // Seulement le thème rouge pour test
      
      setThemes(allThemes);
      setCurrentTheme(cleanCurrentTheme);
      setUserPreferences(preferencesData.data || null);
    } catch (error: any) {
      console.error('Erreur lors du chargement des thèmes:', error);
      setError(error.message || 'Erreur lors du chargement des thèmes');
      // En cas d'erreur, on définit des valeurs par défaut pour éviter les crashes
      setThemes([]);
      setCurrentTheme(defaultTheme);
      setUserPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async (themeId: number) => {
    try {
      setApplying(themeId);
      console.log('Application du thème ID:', themeId);
      
      // Trouver le thème sélectionné
      const selectedTheme = themes.find(theme => theme.id === themeId);
      if (!selectedTheme) {
        throw new Error('Thème introuvable');
      }

      // Déterminer le code du thème et l'appliquer visuellement
      const themeCode = ThemeManager.getThemeCodeFromName(selectedTheme.name);
      ThemeManager.applyThemeComplete(themeCode);
      
      // Appeler l'API pour sauvegarder côté serveur
      const result = await themeService.apply(themeId);
      console.log('Résultat de l\'application:', result);
      
      if (result.success || (result as any).status === 'success') {
        console.log('Thème appliqué avec succès, rechargement...');
        await loadThemes(); // Recharger pour mettre à jour le thème actuel
      } else {
        throw new Error(result.message || 'Erreur lors de l\'application du thème');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'application du thème:', error);
      setError(error.message || 'Erreur lors de l\'application du thème');
    } finally {
      setApplying(null);
    }
  };

  const handleResetTheme = async () => {
    try {
      setApplying(-1);
      
      // Réinitialiser au thème par défaut visuellement
      ThemeManager.applyThemeComplete('light');
      
      await themeService.reset();
      await loadThemes();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du thème:', error);
    } finally {
      setApplying(null);
    }
  };

  const handleCreateTheme = () => {
    // TODO: Rediriger vers la page de création de thème
    console.log('Redirection vers la création de thème');
    // window.location.href = '/themes/create';
    alert('Fonctionnalité de création de thème à implémenter');
  };

  const handleImportTheme = () => {
    // TODO: Ouvrir un modal d'import ou rediriger vers une page d'import
    console.log('Import de thème');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const themeData = JSON.parse(e.target?.result as string);
            console.log('Thème importé:', themeData);
            alert('Import de thème réussi ! (fonctionnalité à finaliser)');
          } catch (error) {
            alert('Erreur lors de l\'import du thème');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Thèmes</h1>
        <p className="text-gray-600">Personnalisez l'apparence de votre interface</p>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span>{error}</span>
            <button 
              onClick={loadThemes}
              className="ml-auto px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Thème actuel */}
      {currentTheme && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Thème actuel</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-16 h-16 rounded-lg mr-4 border-2 border-gray-300"
                style={{ backgroundColor: currentTheme.colors?.primary || '#3B82F6' }}
              ></div>
              <div>
                <h3 className="text-xl font-semibold">{currentTheme.name}</h3>
                <p className="text-gray-600">{currentTheme.description}</p>
              </div>
            </div>
            <button
              onClick={handleResetTheme}
              disabled={applying === -1}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              {applying === -1 ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </div>
        </div>
      )}

      {/* Préférences utilisateur */}
      {userPreferences && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Préférences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Mode sombre</span>
              <input
                type="checkbox"
                checked={userPreferences.dark_mode}
                className="toggle"
                readOnly
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Animations</span>
              <input
                type="checkbox"
                checked={userPreferences.animations_enabled}
                className="toggle"
                readOnly
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Contraste élevé</span>
              <input
                type="checkbox"
                checked={userPreferences.high_contrast}
                className="toggle"
                readOnly
              />
            </div>
          </div>
        </div>
      )}

      {/* Grille des thèmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
              currentTheme?.id === theme.id ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            {/* Aperçu du thème */}
            <div className="h-32 relative" style={{ backgroundColor: theme.colors?.background || '#F9FAFB' }}>
              <div className="absolute inset-0 p-4">
                <div 
                  className="w-full h-4 rounded mb-2"
                  style={{ backgroundColor: theme.colors?.primary || '#3B82F6' }}
                ></div>
                <div 
                  className="w-3/4 h-3 rounded mb-2"
                  style={{ backgroundColor: theme.colors?.secondary || '#6B7280' }}
                ></div>
                <div 
                  className="w-1/2 h-3 rounded"
                  style={{ backgroundColor: theme.colors?.accent || '#10B981' }}
                ></div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{theme.name}</h3>
                {theme.is_default && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Défaut
                  </span>
                )}
              </div>

              {theme.description && (
                <p className="text-gray-600 mb-4">{theme.description}</p>
              )}

              {/* Palette de couleurs */}
              <div className="flex space-x-2 mb-4">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme.colors?.primary || '#3B82F6' }}
                  title={`Couleur primaire: ${theme.colors?.primary || '#3B82F6'}`}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme.colors?.secondary || '#6B7280' }}
                  title={`Couleur secondaire: ${theme.colors?.secondary || '#6B7280'}`}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme.colors?.accent || '#10B981' }}
                  title={`Couleur d'accent: ${theme.colors?.accent || '#10B981'}`}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme.colors?.success || '#059669' }}
                  title={`Couleur de succès: ${theme.colors?.success || '#059669'}`}
                ></div>
              </div>

              {/* Debug: afficher les couleurs brutes */}
              <div className="text-xs text-gray-400 mb-2">
                Debug: P:{theme.colors?.primary} S:{theme.colors?.secondary} A:{theme.colors?.accent}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {theme.is_public ? 'Public' : 'Privé'}
                </div>
                
                {currentTheme?.id === theme.id ? (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                    ✓ Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyTheme(theme.id)}
                    disabled={applying === theme.id}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {applying === theme.id ? 'Application...' : 'Appliquer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun thème disponible</h3>
          <p className="text-gray-500">Les thèmes seront bientôt disponibles !</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex justify-center" style={{ marginTop: '15px', gap: '1em' }}>
        <button 
          onClick={handleCreateTheme}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Créer un thème personnalisé
        </button>
        <button 
          onClick={handleImportTheme}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Importer un thème
        </button>
        <button 
          onClick={loadThemes}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Chargement...' : 'Recharger les thèmes'}
        </button>
      </div>
    </div>
  );
} 