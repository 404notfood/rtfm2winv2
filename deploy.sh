#!/bin/bash

# Script de déploiement pour RTFM2WIN sur HestiaCP
echo "🚀 Démarrage du déploiement RTFM2WIN..."

# 1. Mise en mode maintenance
php artisan down --message="Mise à jour en cours..." --retry=60

# 2. Mise à jour du code
echo "📥 Récupération du code..."
git pull origin main

# 3. Installation/mise à jour des dépendances
echo "📦 Installation des dépendances PHP..."
composer install --no-dev --optimize-autoloader

echo "📦 Installation des dépendances Node.js..."
npm ci --only=production

# 4. Optimisations Laravel
echo "⚡ Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 5. Migration de la base de données
echo "🗄️ Migration de la base de données..."
php artisan migrate --force

# 6. Build des assets frontend
echo "🎨 Build des assets frontend..."
npm run build

# 7. Optimisation finale
echo "🔧 Optimisations finales..."
php artisan storage:link
php artisan queue:restart

# 8. Sortie du mode maintenance
php artisan up

echo "✅ Déploiement terminé avec succès!"