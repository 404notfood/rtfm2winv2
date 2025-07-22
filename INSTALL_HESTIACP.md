# 🚀 INSTALLATION RTFM2WIN SUR VPS OVH + HestiaCP

## ⚠️ **IMPORTANT - ENVIRONNEMENT EXISTANT**

Ce guide est conçu pour installer RTFM2WIN sur un VPS OVH avec **HestiaCP déjà installé** et d'autres projets en cours. Nous n'allons **PAS** toucher à votre configuration existante.

---

## 📋 **PRÉ-REQUIS VÉRIFIÉS**

✅ VPS OVH avec HestiaCP installé  
✅ Nginx déjà configuré  
✅ Autres projets fonctionnels à préserver  
✅ Accès SSH et panel HestiaCP  

---

## 🔧 **ÉTAPE 1 : VÉRIFICATION DE L'ENVIRONNEMENT**

### 1.1 Connexion et vérification

```bash
# Connexion SSH
ssh admin@votre-ip-vps

# Vérifier les versions installées (sans rien modifier)
php -v
nginx -v
mysql --version
node -v
npm -v
```

### 1.2 Vérifier HestiaCP

```bash
# Vérifier que HestiaCP fonctionne
sudo systemctl status hestia
```

---

## 🌐 **ÉTAPE 2 : CRÉATION DU DOMAINE DANS HESTIACP**

### 2.1 Via l'interface HestiaCP

1. **Connectez-vous à HestiaCP** : `https://votre-ip:8083`
2. **Allez dans "Web"** 
3. **Cliquez sur "Add Domain"**
4. **Configurez :**
   - **Domain** : `rtfm2win.votre-domaine.com` (ou votre domaine)
   - **IP** : Votre IP principale
   - **Web Template** : `Laravel` (si disponible) ou `PHP-8.x`
   - **Backend Template** : `PHP-FPM-8.x`
   - **Proxy Template** : `nginx`

### 2.2 Ou via CLI (si vous préférez)

```bash
# Ajouter le domaine via CLI HestiaCP
sudo /usr/local/hestia/bin/v-add-domain admin rtfm2win.votre-domaine.com
sudo /usr/local/hestia/bin/v-add-web-domain admin rtfm2win.votre-domaine.com
```

---

## 📦 **ÉTAPE 3 : VÉRIFICATION DES DÉPENDANCES**

### 3.1 Vérifier PHP et extensions

```bash
# Vérifier PHP (doit être 8.1+ pour Laravel 12)
php -v

# Vérifier les extensions nécessaires
php -m | grep -E "(mysql|redis|curl|mbstring|xml|zip|bcmath|intl|gd)"
```

### 3.2 Installer les extensions manquantes (si nécessaire)

```bash
# Si des extensions manquent (ajustez selon votre version PHP)
sudo apt update
sudo apt install -y php8.3-mysql php8.3-redis php8.3-curl php8.3-mbstring \
    php8.3-xml php8.3-zip php8.3-bcmath php8.3-intl php8.3-gd php8.3-imagick

# Redémarrer PHP-FPM (attention à la version)
sudo systemctl restart php8.3-fpm
```

### 3.3 Vérifier Composer

```bash
# Vérifier Composer
composer --version

# Si Composer n'est pas installé globalement
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 3.4 Vérifier Node.js

```bash
# Vérifier Node.js (doit être 18+)
node -v

# Si Node.js est trop ancien ou absent
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 🗄️ **ÉTAPE 4 : CONFIGURATION BASE DE DONNÉES**

### 4.1 Via HestiaCP

1. **Allez dans "Databases"** dans HestiaCP
2. **Cliquez "Add Database"**
3. **Configurez :**
   - **Database** : `admin_rtfm2win`
   - **User** : `admin_rtfm2win` 
   - **Password** : Générez un mot de passe fort
   - **Host** : `localhost`

### 4.2 Ou via CLI

```bash
# Créer la base de données via HestiaCP CLI
sudo /usr/local/hestia/bin/v-add-database admin rtfm2win admin_rtfm2win mot_de_passe_securise
```

---

## 📁 **ÉTAPE 5 : DÉPLOIEMENT DE L'APPLICATION**

### 5.1 Aller dans le répertoire du domaine

```bash
# Aller dans le répertoire web de votre domaine (créé par HestiaCP)
cd /home/admin/web/rtfm2win.votre-domaine.com

# Sauvegarder le contenu par défaut
sudo mv public_html public_html_backup

# Cloner votre projet
git clone https://github.com/votre-username/rtfm2win.git public_html
cd public_html
```

### 5.2 Configuration des permissions

```bash
# Définir les bonnes permissions (important avec HestiaCP)
sudo chown -R admin:admin /home/admin/web/rtfm2win.votre-domaine.com/public_html
sudo chmod -R 755 /home/admin/web/rtfm2win.votre-domaine.com/public_html
sudo chmod -R 775 storage bootstrap/cache
```

### 5.3 Installation des dépendances

```bash
# Installer les dépendances PHP
composer install --no-dev --optimize-autoloader

# Installer les dépendances Node.js
npm ci --only=production

# Build des assets
npm run build
```

---

## ⚙️ **ÉTAPE 6 : CONFIGURATION LARAVEL**

### 6.1 Configuration .env

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer la configuration
nano .env
```

**Configuration .env adaptée HestiaCP :**
```env
APP_NAME="RTFM2WIN"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://rtfm2win.votre-domaine.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Base de données (adaptez selon vos paramètres HestiaCP)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=admin_rtfm2win
DB_USERNAME=admin_rtfm2win
DB_PASSWORD=votre_mot_de_passe_bdd

# Cache et sessions (Redis si installé, sinon file)
BROADCAST_DRIVER=pusher
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Si Redis est disponible, décommentez :
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=null
# REDIS_PORT=6379

# Configuration email (utilisez les paramètres SMTP de votre hébergeur)
MAIL_MAILER=smtp
MAIL_HOST=votre-smtp-host
MAIL_PORT=587
MAIL_USERNAME=votre-email@domaine.com
MAIL_PASSWORD=votre-mot-de-passe-email
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@votre-domaine.com"
MAIL_FROM_NAME="${APP_NAME}"

# WebSockets (on utilisera une solution adaptée à HestiaCP)
PUSHER_APP_ID=rtfm2win-app
PUSHER_APP_KEY=rtfm2win-key
PUSHER_APP_SECRET=rtfm2win-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

### 6.2 Finalisation Laravel

```bash
# Générer la clé d'application
php artisan key:generate

# Créer les liens symboliques
php artisan storage:link

# Exécuter les migrations
php artisan migrate --force

# Peupler la base avec les données de base
php artisan db:seed --force

# Optimiser pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 🌐 **ÉTAPE 7 : CONFIGURATION NGINX SPÉCIFIQUE**

### 7.1 Configuration via HestiaCP

1. **Allez dans "Web" > Votre domaine**
2. **Cliquez sur "Edit"**
3. **Dans "Proxy Template"**, sélectionnez `nginx`
4. **Cliquez sur "Advanced options"**
5. **Ajoutez cette configuration dans "Additional nginx directives" :**

```nginx
# Configuration Laravel pour RTFM2WIN
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

# Gestion des assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# WebSocket proxy (si vous utilisez Laravel WebSockets)
location /app/ {
    proxy_pass http://127.0.0.1:6001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Sécurité - cacher les fichiers sensibles
location ~ /\.(env|git) {
    deny all;
    return 404;
}

location ~ /(vendor|storage|bootstrap\/cache|node_modules) {
    deny all;
    return 404;
}
```

### 7.2 Ou modifier directement le fichier (ATTENTION)

```bash
# SEULEMENT si vous êtes à l'aise avec HestiaCP
sudo nano /home/admin/conf/web/rtfm2win.votre-domaine.com.nginx.conf_letsencrypt
```

---

## 🔐 **ÉTAPE 8 : SSL AVEC HESTIACP**

### 8.1 Via l'interface HestiaCP

1. **Allez dans "Web" > Votre domaine**
2. **Cliquez sur "Edit"**
3. **Activez "SSL Support"**
4. **Sélectionnez "Let's Encrypt"**
5. **Cochez "Force SSL redirect"**
6. **Cliquez "Save"**

### 8.2 Ou via CLI

```bash
# Activer SSL via CLI HestiaCP
sudo /usr/local/hestia/bin/v-add-letsencrypt-domain admin rtfm2win.votre-domaine.com
```

---

## ⚡ **ÉTAPE 9 : GESTION DES PROCESSUS (ADAPTÉ HESTIACP)**

### 9.1 Queue Worker via Cron (plus simple avec HestiaCP)

```bash
# Éditer le crontab de l'utilisateur admin
crontab -e
```

**Ajoutez ces tâches cron :**
```cron
# Laravel Scheduler
* * * * * cd /home/admin/web/rtfm2win.votre-domaine.com/public_html && php artisan schedule:run >> /dev/null 2>&1

# Queue Worker (traite les jobs toutes les minutes)
* * * * * cd /home/admin/web/rtfm2win.votre-domaine.com/public_html && php artisan queue:work --stop-when-empty --max-time=3600 >> /dev/null 2>&1

# Nettoyage des logs (optionnel)
0 2 * * * find /home/admin/web/rtfm2win.votre-domaine.com/public_html/storage/logs -name "*.log" -mtime +7 -delete
```

### 9.2 WebSocket Server (optionnel, pour les fonctionnalités temps réel)

Si vous voulez les WebSockets, créez un script simple :

```bash
# Créer un script WebSocket
nano ~/rtfm2win-websocket.sh
```

**Contenu du script :**
```bash
#!/bin/bash
cd /home/admin/web/rtfm2win.votre-domaine.com/public_html
php artisan websockets:serve --host=127.0.0.1 --port=6001
```

```bash
# Rendre exécutable
chmod +x ~/rtfm2win-websocket.sh

# Lancer en arrière-plan (pour tester)
nohup ~/rtfm2win-websocket.sh > /tmp/websocket.log 2>&1 &
```

---

## 📊 **ÉTAPE 10 : MONITORING ADAPTÉ HESTIACP**

### 10.1 Script de vérification

```bash
# Créer un script de monitoring simple
nano ~/check-rtfm2win.sh
```

**Script de monitoring :**
```bash
#!/bin/bash
echo "=== RTFM2WIN Status Check ==="
echo "Date: $(date)"
echo ""

# Vérifier que le site répond
echo "=== Site Status ==="
curl -Is https://rtfm2win.votre-domaine.com | head -1

# Vérifier les logs Laravel
echo "=== Recent Laravel Logs ==="
tail -n 5 /home/admin/web/rtfm2win.votre-domaine.com/public_html/storage/logs/laravel.log

# Vérifier l'espace disque
echo "=== Disk Usage ==="
df -h /home/admin/web/rtfm2win.votre-domaine.com/

echo "=== Done ==="
```

```bash
chmod +x ~/check-rtfm2win.sh
```

---

## 🔄 **ÉTAPE 11 : SCRIPT DE DÉPLOIEMENT SIMPLIFIÉ**

```bash
# Créer un script de mise à jour
nano ~/update-rtfm2win.sh
```

**Script de mise à jour :**
```bash
#!/bin/bash
set -e

PROJECT_PATH="/home/admin/web/rtfm2win.votre-domaine.com/public_html"
BACKUP_PATH="/home/admin/backups/rtfm2win-$(date +%Y%m%d_%H%M%S)"

echo "🚀 Mise à jour RTFM2WIN - $(date)"

# Sauvegarde
echo "📦 Sauvegarde..."
mkdir -p /home/admin/backups
cp -r $PROJECT_PATH $BACKUP_PATH

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $PROJECT_PATH
git pull origin main

# Mise à jour des dépendances
echo "📦 Mise à jour des dépendances..."
composer install --no-dev --optimize-autoloader
npm ci --only=production
npm run build

# Migration base de données
echo "🗄️ Migration base de données..."
php artisan migrate --force

# Optimisation
echo "⚡ Optimisation..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Permissions
sudo chown -R admin:admin $PROJECT_PATH
sudo chmod -R 775 $PROJECT_PATH/storage $PROJECT_PATH/bootstrap/cache

echo "✅ Mise à jour terminée!"
```

```bash
chmod +x ~/update-rtfm2win.sh
```

---

## ✅ **ÉTAPE 12 : VÉRIFICATION FINALE**

### 12.1 Tests de base

```bash
# Vérifier que le site fonctionne
curl -I https://rtfm2win.votre-domaine.com

# Vérifier les logs
tail -f /home/admin/web/rtfm2win.votre-domaine.com/public_html/storage/logs/laravel.log

# Tester une route Laravel
curl https://rtfm2win.votre-domaine.com/login
```

### 12.2 Via HestiaCP

1. **Vérifiez dans "Web"** que votre domaine est vert/actif
2. **Testez l'accès HTTPS** 
3. **Vérifiez les logs** dans "Log"

---

## 🎯 **COMMANDES DE MAINTENANCE RAPIDES**

```bash
# Aller dans le projet
cd /home/admin/web/rtfm2win.votre-domaine.com/public_html

# Vider le cache Laravel
php artisan cache:clear && php artisan config:cache

# Voir les logs en temps réel
tail -f storage/logs/laravel.log

# Redémarrer PHP-FPM (si nécessaire)
sudo systemctl restart php8.3-fpm

# Vérifier l'état HestiaCP
sudo systemctl status hestia
```

---

## 🚨 **DÉPANNAGE SPÉCIFIQUE HESTIACP**

### Erreur 500
```bash
# Vérifier les logs Laravel
tail -n 50 /home/admin/web/rtfm2win.votre-domaine.com/public_html/storage/logs/laravel.log

# Vérifier les logs Nginx HestiaCP
sudo tail -n 50 /var/log/nginx/domains/rtfm2win.votre-domaine.com.error.log

# Vérifier les permissions
sudo chown -R admin:admin /home/admin/web/rtfm2win.votre-domaine.com/public_html
sudo chmod -R 775 storage bootstrap/cache
```

### Problème SSL
```bash
# Renouveler le certificat via HestiaCP
sudo /usr/local/hestia/bin/v-update-letsencrypt-domain admin rtfm2win.votre-domaine.com
```

### Problème de domaine
```bash
# Reconstruire la configuration Nginx
sudo /usr/local/hestia/bin/v-rebuild-web-domain admin rtfm2win.votre-domaine.com
```

---

## 🎉 **FÉLICITATIONS !**

Votre application **RTFM2WIN** est maintenant installée sur votre VPS OVH avec HestiaCP **SANS PERTURBER** vos autres projets !

### ✅ **Ce qui est configuré :**
- ✅ Domaine configuré dans HestiaCP
- ✅ Base de données dédiée  
- ✅ SSL automatique Let's Encrypt
- ✅ Configuration Nginx optimisée pour Laravel
- ✅ Queue workers via Cron
- ✅ Scripts de maintenance et mise à jour
- ✅ Monitoring basique

### 🌐 **Accès à votre application :**
`https://rtfm2win.votre-domaine.com`

### 🔧 **Maintenance :**
- **Mise à jour :** `~/update-rtfm2win.sh`
- **Vérification :** `~/check-rtfm2win.sh`
- **HestiaCP :** `https://votre-ip:8083`

**Votre installation est prête et sécurisée ! 🚀** 