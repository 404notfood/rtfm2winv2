# 🚀 GUIDE D'INSTALLATION PRODUCTION - RTFM2WIN

## 📋 **PRÉ-REQUIS VPS**

### Spécifications minimales recommandées :
- **OS :** Ubuntu 22.04 LTS ou Debian 11+
- **RAM :** 4 GB minimum (8 GB recommandé)
- **CPU :** 2 vCores minimum (4 vCores recommandé)
- **Stockage :** 50 GB SSD minimum
- **Bande passante :** Illimitée ou 1TB+

---

## 🔧 **ÉTAPE 1 : PRÉPARATION DU SERVEUR**

### 1.1 Connexion et mise à jour

```bash
# Connexion SSH
ssh root@votre-ip-vps

# Mise à jour du système
apt update && apt upgrade -y

# Installation des outils de base
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.2 Création d'un utilisateur non-root

```bash
# Créer un utilisateur pour l'application
adduser rtfm2win
usermod -aG sudo rtfm2win

# Basculer vers ce nouvel utilisateur
su - rtfm2win
```

---

## 🐘 **ÉTAPE 2 : INSTALLATION PHP 8.3**

```bash
# Ajouter le repository PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Installer PHP 8.3 et extensions nécessaires
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-pgsql php8.3-sqlite3 \
    php8.3-redis php8.3-xml php8.3-curl php8.3-mbstring php8.3-zip \
    php8.3-bcmath php8.3-intl php8.3-gd php8.3-imagick php8.3-soap \
    php8.3-xdebug php8.3-opcache php8.3-cli php8.3-common

# Vérifier l'installation
php -v
```

### 2.1 Configuration PHP pour production

```bash
# Éditer la configuration PHP-FPM
sudo nano /etc/php/8.3/fpm/php.ini
```

**Modifications importantes :**
```ini
memory_limit = 512M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 64M
post_max_size = 64M
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
```

```bash
# Redémarrer PHP-FPM
sudo systemctl restart php8.3-fpm
sudo systemctl enable php8.3-fpm
```

---

## 🎵 **ÉTAPE 3 : INSTALLATION COMPOSER**

```bash
# Télécharger et installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Vérifier l'installation
composer --version
```

---

## 🟢 **ÉTAPE 4 : INSTALLATION NODE.JS 20**

```bash
# Installer Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v
npm -v

# Installer PM2 pour la gestion des processus Node.js
sudo npm install -g pm2
```

---

## 🗄️ **ÉTAPE 5 : INSTALLATION MYSQL 8.0**

```bash
# Installer MySQL
sudo apt install -y mysql-server

# Sécuriser MySQL
sudo mysql_secure_installation
```

**Configuration MySQL :**
```sql
-- Connexion à MySQL
sudo mysql -u root -p

-- Créer la base de données et l'utilisateur
CREATE DATABASE rtfm2win CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rtfm2win_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON rtfm2win.* TO 'rtfm2win_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🚀 **ÉTAPE 6 : INSTALLATION REDIS (pour le cache et les sessions)**

```bash
# Installer Redis
sudo apt install -y redis-server

# Configurer Redis pour production
sudo nano /etc/redis/redis.conf
```

**Modifications Redis :**
```conf
# Sécurité
bind 127.0.0.1
requirepass votre_mot_de_passe_redis_securise

# Performance
maxmemory 1gb
maxmemory-policy allkeys-lru
```

```bash
# Redémarrer Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## 🌐 **ÉTAPE 7 : INSTALLATION NGINX**

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer et activer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.1 Configuration Nginx pour RTFM2WIN

```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/rtfm2win
```

**Configuration Nginx :**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    root /var/www/rtfm2win/public;
    index index.php index.html;

    # Logs
    access_log /var/log/nginx/rtfm2win-access.log;
    error_log /var/log/nginx/rtfm2win-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /(vendor|storage|bootstrap\/cache) {
        deny all;
    }

    # WebSocket proxy for real-time features
    location /app/ {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/rtfm2win /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 📁 **ÉTAPE 8 : DÉPLOIEMENT DE L'APPLICATION**

### 8.1 Cloner le projet

```bash
# Aller dans le répertoire web
cd /var/www

# Cloner le projet (remplacez par votre repository)
sudo git clone https://github.com/votre-username/rtfm2win.git
sudo chown -R rtfm2win:www-data rtfm2win
cd rtfm2win
```

### 8.2 Installation des dépendances

```bash
# Installer les dépendances PHP
composer install --no-dev --optimize-autoloader

# Installer les dépendances Node.js
npm ci --only=production

# Build des assets pour production
npm run build
```

### 8.3 Configuration Laravel

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer la configuration
nano .env
```

**Configuration .env pour production :**
```env
APP_NAME="RTFM2WIN"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://votre-domaine.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rtfm2win
DB_USERNAME=rtfm2win_user
DB_PASSWORD=votre_mot_de_passe_securise

BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=votre_mot_de_passe_redis_securise
REDIS_PORT=6379

# Configuration Pusher pour WebSockets (optionnel - vous pouvez utiliser Laravel WebSockets)
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

# Configuration email (pour les notifications)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

```bash
# Générer la clé d'application
php artisan key:generate

# Créer les liens symboliques
php artisan storage:link

# Exécuter les migrations
php artisan migrate --force

# Peupler la base avec les données de base
php artisan db:seed --force

# Optimiser l'application pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Créer les répertoires nécessaires et définir les permissions
sudo mkdir -p storage/logs
sudo mkdir -p storage/framework/{cache,sessions,views}
sudo mkdir -p storage/app/public
sudo chown -R rtfm2win:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## 🔐 **ÉTAPE 9 : CONFIGURATION SSL (Let's Encrypt)**

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Tester le renouvellement automatique
sudo certbot renew --dry-run
```

---

## ⚡ **ÉTAPE 10 : CONFIGURATION DES PROCESSUS EN ARRIÈRE-PLAN**

### 10.1 Configuration de Queue Worker

```bash
# Créer le service systemd pour les queues
sudo nano /etc/systemd/system/rtfm2win-worker.service
```

**Contenu du service :**
```ini
[Unit]
Description=RTFM2WIN Queue Worker
After=network.target

[Service]
Type=simple
User=rtfm2win
Group=www-data
Restart=always
RestartSec=5
ExecStart=/usr/bin/php /var/www/rtfm2win/artisan queue:work --sleep=3 --tries=3 --max-time=3600
WorkingDirectory=/var/www/rtfm2win

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable rtfm2win-worker
sudo systemctl start rtfm2win-worker
```

### 10.2 Configuration WebSocket Server (Laravel WebSockets)

```bash
# Installer Laravel WebSockets (si vous n'utilisez pas Pusher)
composer require pusher/pusher-php-server

# Créer le service pour WebSockets
sudo nano /etc/systemd/system/rtfm2win-websockets.service
```

**Contenu du service WebSockets :**
```ini
[Unit]
Description=RTFM2WIN WebSockets
After=network.target

[Service]
Type=simple
User=rtfm2win
Group=www-data
Restart=always
RestartSec=5
ExecStart=/usr/bin/php /var/www/rtfm2win/artisan websockets:serve --host=127.0.0.1 --port=6001
WorkingDirectory=/var/www/rtfm2win

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service WebSockets
sudo systemctl daemon-reload
sudo systemctl enable rtfm2win-websockets
sudo systemctl start rtfm2win-websockets
```

---

## 📊 **ÉTAPE 11 : MONITORING ET LOGS**

### 11.1 Configuration de la rotation des logs

```bash
# Créer la configuration logrotate
sudo nano /etc/logrotate.d/rtfm2win
```

**Configuration logrotate :**
```
/var/www/rtfm2win/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 rtfm2win rtfm2win
    su rtfm2win rtfm2win
}

/var/log/nginx/rtfm2win-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### 11.2 Configuration du monitoring

```bash
# Installer htop pour le monitoring système
sudo apt install -y htop iotop nethogs

# Créer un script de monitoring personnalisé
nano ~/monitor-rtfm2win.sh
```

**Script de monitoring :**
```bash
#!/bin/bash
echo "=== RTFM2WIN System Status ==="
echo "Date: $(date)"
echo ""

echo "=== System Resources ==="
free -h
echo ""
df -h /var/www/rtfm2win
echo ""

echo "=== Services Status ==="
systemctl is-active nginx
systemctl is-active php8.3-fpm
systemctl is-active mysql
systemctl is-active redis-server
systemctl is-active rtfm2win-worker
systemctl is-active rtfm2win-websockets
echo ""

echo "=== Recent Errors ==="
tail -n 5 /var/www/rtfm2win/storage/logs/laravel.log
echo ""

echo "=== Queue Status ==="
cd /var/www/rtfm2win && php artisan queue:work --once --quiet
```

```bash
chmod +x ~/monitor-rtfm2win.sh
```

---

## 🔄 **ÉTAPE 12 : SCRIPT DE DÉPLOIEMENT AUTOMATIQUE**

```bash
# Créer un script de déploiement
nano ~/deploy-rtfm2win.sh
```

**Script de déploiement :**
```bash
#!/bin/bash
set -e

PROJECT_PATH="/var/www/rtfm2win"
BACKUP_PATH="/var/backups/rtfm2win-$(date +%Y%m%d_%H%M%S)"

echo "🚀 Déploiement RTFM2WIN - $(date)"

# Sauvegarde
echo "📦 Création de la sauvegarde..."
sudo mkdir -p /var/backups
sudo cp -r $PROJECT_PATH $BACKUP_PATH
sudo mysqldump -u rtfm2win_user -p rtfm2win > $BACKUP_PATH/database.sql

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $PROJECT_PATH
git pull origin main

# Mise à jour des dépendances
echo "📦 Mise à jour des dépendances..."
composer install --no-dev --optimize-autoloader
npm ci --only=production

# Build des assets
echo "🔨 Build des assets..."
npm run build

# Mise à jour de la base de données
echo "🗄️ Mise à jour de la base de données..."
php artisan migrate --force

# Optimisation
echo "⚡ Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Redémarrage des services
echo "🔄 Redémarrage des services..."
sudo systemctl restart php8.3-fpm
sudo systemctl restart rtfm2win-worker
sudo systemctl restart rtfm2win-websockets

# Vérification des permissions
sudo chown -R rtfm2win:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo "✅ Déploiement terminé avec succès!"
echo "📊 Status des services:"
systemctl is-active nginx php8.3-fpm mysql redis-server rtfm2win-worker rtfm2win-websockets
```

```bash
chmod +x ~/deploy-rtfm2win.sh
```

---

## 🔐 **ÉTAPE 13 : SÉCURISATION AVANCÉE**

### 13.1 Configuration du pare-feu

```bash
# Installer et configurer UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Vérifier le status
sudo ufw status
```

### 13.2 Configuration Fail2Ban

```bash
# Installer Fail2Ban
sudo apt install -y fail2ban

# Créer la configuration personnalisée
sudo nano /etc/fail2ban/jail.local
```

**Configuration Fail2Ban :**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/rtfm2win-error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/rtfm2win-error.log
maxretry = 10
```

```bash
sudo systemctl restart fail2ban
```

---

## 📋 **ÉTAPE 14 : TÂCHES CRON**

```bash
# Éditer le crontab
crontab -e
```

**Tâches cron à ajouter :**
```cron
# Laravel Scheduler
* * * * * cd /var/www/rtfm2win && php artisan schedule:run >> /dev/null 2>&1

# Nettoyage des logs (optionnel)
0 2 * * * find /var/www/rtfm2win/storage/logs -name "*.log" -mtime +30 -delete

# Sauvegarde quotidienne de la base de données
0 3 * * * mysqldump -u rtfm2win_user -p'votre_mot_de_passe' rtfm2win > /var/backups/rtfm2win-db-$(date +\%Y\%m\%d).sql

# Nettoyage des anciennes sauvegardes (garde 7 jours)
0 4 * * * find /var/backups -name "rtfm2win-db-*.sql" -mtime +7 -delete
```

---

## ✅ **ÉTAPE 15 : VÉRIFICATION FINALE**

### 15.1 Tests de fonctionnement

```bash
# Vérifier tous les services
systemctl status nginx php8.3-fpm mysql redis-server rtfm2win-worker rtfm2win-websockets

# Tester l'application
curl -I https://votre-domaine.com

# Vérifier les logs
tail -f /var/www/rtfm2win/storage/logs/laravel.log
tail -f /var/log/nginx/rtfm2win-access.log
```

### 15.2 Tests de performance

```bash
# Installer Apache Bench pour les tests de charge
sudo apt install -y apache2-utils

# Test de charge basique
ab -n 100 -c 10 https://votre-domaine.com/
```

---

## 🎯 **COMMANDES UTILES DE MAINTENANCE**

```bash
# Redémarrer tous les services RTFM2WIN
sudo systemctl restart nginx php8.3-fpm mysql redis-server rtfm2win-worker rtfm2win-websockets

# Voir les logs en temps réel
tail -f /var/www/rtfm2win/storage/logs/laravel.log

# Vider le cache Laravel
cd /var/www/rtfm2win && php artisan cache:clear && php artisan config:cache

# Vérifier l'état des queues
cd /var/www/rtfm2win && php artisan queue:work --once

# Redémarrer les workers de queue
sudo systemctl restart rtfm2win-worker

# Voir les processus actifs
ps aux | grep php
ps aux | grep nginx
```

---

## 🚨 **DÉPANNAGE COURANT**

### Erreur 500 - Internal Server Error
```bash
# Vérifier les logs
tail -n 50 /var/www/rtfm2win/storage/logs/laravel.log
tail -n 50 /var/log/nginx/rtfm2win-error.log

# Vérifier les permissions
sudo chown -R rtfm2win:www-data /var/www/rtfm2win
sudo chmod -R 775 /var/www/rtfm2win/storage
sudo chmod -R 775 /var/www/rtfm2win/bootstrap/cache
```

### Problèmes de WebSocket
```bash
# Vérifier le service WebSocket
sudo systemctl status rtfm2win-websockets

# Redémarrer le service
sudo systemctl restart rtfm2win-websockets

# Tester la connexion WebSocket
telnet 127.0.0.1 6001
```

### Problèmes de Queue
```bash
# Vérifier les jobs en échec
cd /var/www/rtfm2win && php artisan queue:failed

# Relancer les jobs échoués
cd /var/www/rtfm2win && php artisan queue:retry all

# Redémarrer le worker
sudo systemctl restart rtfm2win-worker
```

---

## 🎉 **FÉLICITATIONS !**

Votre application **RTFM2WIN** est maintenant déployée en production sur votre VPS avec :

✅ **PHP 8.3 + Laravel 12** optimisé pour la production  
✅ **MySQL 8.0** avec base de données sécurisée  
✅ **Redis** pour le cache et les sessions  
✅ **Nginx** avec SSL/TLS (Let's Encrypt)  
✅ **WebSockets** pour les fonctionnalités temps réel  
✅ **Queue Workers** pour les tâches en arrière-plan  
✅ **Monitoring** et rotation des logs  
✅ **Sécurité** avec Fail2Ban et pare-feu  
✅ **Scripts de déploiement** automatisés  

**🌐 Votre application est accessible à :** `https://votre-domaine.com`

---

## 📞 **SUPPORT ET MAINTENANCE**

Pour toute question ou problème, consultez :
- Les logs Laravel : `/var/www/rtfm2win/storage/logs/laravel.log`
- Les logs Nginx : `/var/log/nginx/rtfm2win-*.log`
- La documentation Laravel : https://laravel.com/docs
- Le script de monitoring : `~/monitor-rtfm2win.sh` 