# Guide de déploiement RTFM2WIN sur HestiaCP/OVH

## Prérequis
- VPS avec HestiaCP installé
- PHP 8.3+ avec extensions Laravel
- MySQL/MariaDB
- Node.js 18+
- SSL activé (Let's Encrypt)

## 1. Configuration HestiaCP

### Créer le domaine
1. Connexion HestiaCP admin
2. Web → Add Domain → `rtfm2win.ovh`
3. Activer SSL (Let's Encrypt)
4. Créer base MySQL : `rtfm2win_prod`

### Configuration Nginx personnalisée
Copier le contenu de `nginx-hestiacp.conf` dans la section "Custom configuration" du domaine.

## 2. Déploiement initial

```bash
# 1. Accès SSH au serveur
ssh root@VOTRE_IP

# 2. Navigation vers le dossier web
cd /home/USERNAME/web/rtfm2win.ovh/public_html

# 3. Clone du projet
git clone VOTRE_REPO_GIT .

# 4. Configuration environnement
cp .env.production .env
nano .env  # Modifier avec vos vraies valeurs

# 5. Installation dépendances
composer install --no-dev --optimize-autoloader
npm ci --only=production

# 6. Génération clé et build
php artisan key:generate
npm run build

# 7. Permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 8. Base de données
php artisan migrate --force
php artisan db:seed --force

# 9. Optimisations Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

## 3. Configuration .env production

Valeurs importantes à modifier dans `.env` :

```env
APP_URL=https://rtfm2win.ovh
APP_DEBUG=false
APP_ENV=production

# Base de données HestiaCP
DB_HOST=localhost
DB_DATABASE=rtfm2win_prod
DB_USERNAME=rtfm2win_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE

# Email via serveur
MAIL_HOST=localhost
MAIL_FROM_ADDRESS=noreply@rtfm2win.ovh

# Session
SESSION_DOMAIN=rtfm2win.ovh
```

## 4. Tâches cron

Ajouter dans HestiaCP → Cron Jobs :
```
* * * * * cd /home/USERNAME/web/rtfm2win.ovh/public_html && php artisan schedule:run
```

## 5. Déploiements futurs

Utiliser le script `deploy.sh` :
```bash
chmod +x deploy.sh
./deploy.sh
```

## 6. Monitoring

- Logs Laravel : `storage/logs/laravel.log`
- Logs Nginx : `/var/log/nginx/rtfm2win.ovh.access.log`
- Logs PHP : `/var/log/php8.3-fpm.log`

## 7. Sécurité

- Certificat SSL automatique (Let's Encrypt)
- Fichiers sensibles bloqués par Nginx
- Sessions sécurisées
- CSRF protection activée

## 8. WebSockets (optionnel)

Si vous utilisez Pusher pour le temps réel :
1. Créer compte Pusher.com
2. Configurer les clés dans `.env`
3. Tester les événements temps réel