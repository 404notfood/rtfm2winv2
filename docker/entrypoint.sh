#!/bin/bash
set -e

echo "🚀 Démarrage RTFM2WIN Docker..."

# Attendre que MySQL soit prêt
echo "⏳ Attente de MySQL..."
until php artisan tinker --execute="DB::connection()->getPdo(); echo 'MySQL OK';" 2>/dev/null; do
    echo "MySQL pas encore prêt, attente..."
    sleep 2
done

# Attendre que Redis soit prêt
echo "⏳ Attente de Redis..."
until php -r "
try {
    \$redis = new Redis();
    \$redis->connect(getenv('REDIS_HOST') ?: 'redis', 6379);
    if (getenv('REDIS_PASSWORD')) {
        \$redis->auth(getenv('REDIS_PASSWORD'));
    }
    \$redis->ping();
    echo 'Redis OK';
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "Redis pas encore prêt, attente..."
    sleep 2
done

# Générer la clé d'application si elle n'existe pas
if [ -z "$APP_KEY" ]; then
    echo "🔑 Génération de la clé d'application..."
    php artisan key:generate --force
fi

# Créer les liens symboliques
echo "🔗 Création des liens symboliques..."
php artisan storage:link || true

# Exécuter les migrations en production
if [ "$APP_ENV" = "production" ]; then
    echo "🗄️ Exécution des migrations..."
    php artisan migrate --force
    
    echo "⚡ Optimisations de production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    echo "🗄️ Exécution des migrations avec seeders..."
    php artisan migrate --seed
fi

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p storage/logs
mkdir -p storage/framework/{cache,sessions,views}
mkdir -p storage/app/public

# Fixer les permissions
echo "🔐 Configuration des permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "✅ Initialisation terminée!"

# Exécuter la commande passée en paramètre
exec "$@" 