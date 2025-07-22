'use client';

import { useState, useEffect } from 'react';
import { soundService, Sound, UserSoundPreferences, SoundEventType } from '@/lib/api/sounds';

export default function SoundsPage() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserSoundPreferences | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SoundEventType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);

  const eventTypes: { value: SoundEventType | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les événements' },
    { value: 'correct_answer', label: 'Bonne réponse' },
    { value: 'wrong_answer', label: 'Mauvaise réponse' },
    { value: 'question_start', label: 'Début de question' },
    { value: 'question_end', label: 'Fin de question' },
    { value: 'quiz_start', label: 'Début de quiz' },
    { value: 'quiz_end', label: 'Fin de quiz' },
    { value: 'time_warning', label: 'Alerte temps' },
    { value: 'achievement_unlocked', label: 'Achievement débloqué' },
    { value: 'level_up', label: 'Montée de niveau' },
    { value: 'notification', label: 'Notification' },
    { value: 'button_click', label: 'Clic de bouton' },
    { value: 'page_transition', label: 'Transition de page' }
  ];

  useEffect(() => {
    loadSounds();
  }, [selectedCategory, selectedEvent]);

  const loadSounds = async () => {
    try {
      setLoading(true);
      const [soundsData, categoriesData, preferencesData] = await Promise.all([
        soundService.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          event_type: selectedEvent !== 'all' ? selectedEvent : undefined
        }),
        soundService.getCategories(),
        soundService.getPreferences()
      ]);
      
      setSounds(soundsData.data || []);
      setCategories((categoriesData.data || []).map((cat: any) => cat.name));
      setPreferences(preferencesData.data || null);
    } catch (error) {
      console.error('Erreur lors du chargement des sons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySound = async (soundId: number) => {
    try {
      setPlaying(soundId);
      await soundService.play(soundId);
      // Simuler la fin de lecture après 2 secondes
      setTimeout(() => setPlaying(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      setPlaying(null);
    }
  };

  const handleSetDefault = async (soundId: number, eventType: SoundEventType) => {
    try {
      await soundService.setDefaultForEvent(soundId, eventType);
      await loadSounds(); // Recharger pour mettre à jour les défauts
    } catch (error) {
      console.error('Erreur lors de la définition par défaut:', error);
    }
  };

  const handleUpdatePreferences = async (newPreferences: Partial<UserSoundPreferences>) => {
    try {
      const updated = await soundService.updatePreferences(newPreferences);
      setPreferences(updated.data || null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
    }
  };

  const handleToggleAllSounds = async (enabled: boolean) => {
    try {
      await soundService.toggleAllSounds(enabled);
      await loadSounds();
    } catch (error) {
      console.error('Erreur lors de l\'activation/désactivation:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Effets Sonores</h1>
        <p className="text-gray-600">Personnalisez les sons de votre expérience de jeu</p>
      </div>

      {/* Préférences utilisateur */}
      {preferences && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Préférences Audio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Volume principal</span>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.master_volume}
                onChange={(e) => handleUpdatePreferences({ master_volume: parseInt(e.target.value) })}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{preferences.master_volume}%</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Effets sonores</span>
              <input
                type="checkbox"
                checked={preferences.effects_enabled}
                onChange={(e) => handleUpdatePreferences({ effects_enabled: e.target.checked })}
                className="toggle"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Musique</span>
              <input
                type="checkbox"
                checked={preferences.music_enabled}
                onChange={(e) => handleUpdatePreferences({ music_enabled: e.target.checked })}
                className="toggle"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Sons de notification</span>
              <input
                type="checkbox"
                checked={preferences.notification_sounds}
                onChange={(e) => handleUpdatePreferences({ notification_sounds: e.target.checked })}
                className="toggle"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleToggleAllSounds(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Activer tous les sons
            </button>
            <button
              onClick={() => handleToggleAllSounds(false)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Désactiver tous les sons
            </button>
            <button
              onClick={() => soundService.resetPreferences()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'événement</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as SoundEventType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map((event) => (
                <option key={event.value} value={event.value}>{event.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{sounds.length}</div>
          <div className="text-gray-600">Sons disponibles</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {sounds.filter(s => s.is_active).length}
          </div>
          <div className="text-gray-600">Sons actifs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">
            {sounds.filter(s => s.is_default).length}
          </div>
          <div className="text-gray-600">Sons par défaut</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
          <div className="text-gray-600">Catégories</div>
        </div>
      </div>

      {/* Liste des sons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sounds.map((sound) => (
          <div key={sound.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{sound.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {sound.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {eventTypes.find(e => e.value === sound.event_type)?.label}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {sound.is_default && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Défaut
                    </span>
                  )}
                  {!sound.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {sound.description && (
                <p className="text-gray-600 text-sm mb-4">{sound.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Durée:</span>
                  <div>{formatDuration(sound.duration)}</div>
                </div>
                <div>
                  <span className="font-medium">Taille:</span>
                  <div>{formatFileSize(sound.file_size)}</div>
                </div>
                <div>
                  <span className="font-medium">Volume:</span>
                  <div>{sound.volume}%</div>
                </div>
                <div>
                  <span className="font-medium">Format:</span>
                  <div>{sound.file_path.split('.').pop()?.toUpperCase()}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePlaySound(sound.id)}
                  disabled={playing === sound.id}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {playing === sound.id ? '🔊 Lecture...' : '▶️ Écouter'}
                </button>
                
                {!sound.is_default && (
                  <button
                    onClick={() => handleSetDefault(sound.id, sound.event_type)}
                    className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    Définir par défaut
                  </button>
                )}
              </div>

              {/* Barre de volume personnalisée */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume pour cet événement
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={preferences?.event_sounds?.[sound.event_type]?.volume || 100}
                  className="w-full"
                  onChange={(e) => {
                    const volume = parseInt(e.target.value);
                    if (preferences) {
                      handleUpdatePreferences({
                        event_sounds: {
                          ...preferences.event_sounds,
                          [sound.event_type]: {
                            ...preferences.event_sounds[sound.event_type],
                            volume
                          }
                        }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {sounds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔊</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun son trouvé</h3>
          <p className="text-gray-500">
            {selectedCategory !== 'all' || selectedEvent !== 'all'
              ? 'Essayez de modifier les filtres pour voir plus de sons.'
              : 'Aucun effet sonore n\'est disponible pour le moment.'}
          </p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="mt-8 flex justify-center space-x-4">
        <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
          Importer des sons
        </button>
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Tester tous les événements
        </button>
      </div>
    </div>
  );
} 