'use client';

import NeonThemeWrapper from '@/components/Layout/NeonThemeWrapper';

export default function NeonExamplePage() {
  return (
    <NeonThemeWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Exemple Thème Néon</h1>
        
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">À propos du thème Néon</h2>
          <p className="mb-4">Cette page utilise automatiquement le thème Néon avec toutes ses fonctionnalités visuelles.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Couleurs vibrantes</h3>
              <p>Le thème Néon utilise des couleurs vives qui attirent l'attention.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Effets lumineux</h3>
              <p>Des ombres et effets de lueur qui simulent la lumière néon.</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button className="btn-primary">Bouton Primaire</button>
          <button className="btn-secondary">Bouton Secondaire</button>
          <button className="btn-outline">Bouton Contour</button>
        </div>
      </div>
    </NeonThemeWrapper>
  );
} 