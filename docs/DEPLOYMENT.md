# 🚀 Guide de Déploiement - RTFM2WIN

## 📋 **Stratégies de Déploiement**

Ce guide couvre les différentes approches de déploiement pour RTFM2WIN, du déploiement manuel aux pipelines CI/CD automatisés.

---

## 🎯 **Types de Déploiement**

### **1. Déploiement Manuel**
- Contrôle total du processus
- Idéal pour les premiers déploiements
- Recommandé pour les petites équipes

### **2. Déploiement Semi-Automatisé**
- Scripts de déploiement personnalisés
- Validation manuelle avant production
- Équilibre entre contrôle et automatisation

### **3. Déploiement CI/CD Complet**
- Automatisation totale
- Tests et validations automatiques
- Déploiement sur plusieurs environnements

---

## 🌍 **Environnements de Déploiement**

### **Architecture Multi-Environnements**

```
Development → Staging → Production
     ↓           ↓         ↓
   Local      Testing   Live Site
```

#### **Environnement de Staging**
- Réplique exacte de la production
- Tests d'intégration et de performance
- Validation des fonctionnalités

#### **Environnement de Production**
- Configuration optimisée
- Monitoring et alertes
- Sauvegardes automatiques

---

## 🔧 **Déploiement Manuel**

### **Prérequis Serveur**

```bash
# Vérifications serveur
php -v                # PHP 8.3+
node -v               # Node.js 18+
mysql --version       # MySQL 8.0+
nginx -v              # Nginx
redis-server --version # Redis

# Extensions PHP requises
php -m | grep -E "(mysql|redis|curl|mbstring|xml|zip|bcmath|intl|gd)"
```

### **Script de Déploiement Manuel**

Créer `deploy.sh` :
```bash
#!/bin/bash
set -e

PROJECT_NAME="rtfm2win"
DOMAIN="votre-domaine.com"
PROJECT_PATH="/var/www/${PROJECT_NAME}"
BACKUP_PATH="/var/backups/${PROJECT_NAME}-$(date +%Y%m%d_%H%M%S)"
GIT_REPO="https://github.com/votre-username/rtfm2win.git"
BRANCH="main"

echo "🚀 Déploiement RTFM2WIN - $(date)"

# 1. Sauvegarde
echo "📦 Création sauvegarde..."
if [ -d "$PROJECT_PATH" ]; then
    sudo mkdir -p /var/backups
    sudo cp -r $PROJECT_PATH $BACKUP_PATH
    echo "✅ Sauvegarde créée: $BACKUP_PATH"
fi

# 2. Clone/Update du code
echo "📥 Mise à jour du code..."
if [ ! -d "$PROJECT_PATH" ]; then
    sudo git clone $GIT_REPO $PROJECT_PATH
    cd $PROJECT_PATH
else
    cd $PROJECT_PATH
    sudo git pull origin $BRANCH
fi

# 3. Configuration des permissions
echo "🔐 Configuration permissions..."
sudo chown -R $USER:www-data $PROJECT_PATH
sudo chmod -R 755 $PROJECT_PATH
sudo chmod -R 775 $PROJECT_PATH/storage
sudo chmod -R 775 $PROJECT_PATH/bootstrap/cache

# 4. Installation dépendances
echo "📦 Installation dépendances..."
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --only=production

# 5. Configuration environnement
echo "⚙️ Configuration environnement..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate --force
    echo "⚠️  ATTENTION: Configurez .env avec vos paramètres de production!"
    read -p "Appuyez sur Entrée après avoir configuré .env..."
fi

# 6. Base de données
echo "🗄️ Migration base de données..."
php artisan migrate --force

# 7. Build assets
echo "🔨 Build des assets..."
npm run build

# 8. Optimisations Laravel
echo "⚡ Optimisations Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 9. Liens symboliques
echo "🔗 Liens symboliques..."
php artisan storage:link

# 10. Services
echo "🔄 Redémarrage services..."
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

# 11. Tests post-déploiement
echo "🧪 Tests post-déploiement..."
curl -f https://$DOMAIN > /dev/null && echo "✅ Site accessible" || echo "❌ Site inaccessible"

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Site: https://$DOMAIN"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🤖 **CI/CD avec GitHub Actions**

### **Configuration GitHub Actions**

Créer `.github/workflows/deploy.yml` :
```yaml
name: Deploy RTFM2WIN

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  tests:
    runs-on: ubuntu-22.04
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: rtfm2win_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: --health-cmd="redis-cli ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mysql, redis, curl, mbstring, xml, zip, bcmath, intl, gd
          coverage: xdebug

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: ~/.composer/cache
          key: composer-${{ hashFiles('**/composer.lock') }}

      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader

      - name: Install NPM dependencies
        run: npm ci

      - name: Create .env file
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: Configure environment for testing
        run: |
          echo "DB_CONNECTION=mysql" >> .env
          echo "DB_HOST=127.0.0.1" >> .env
          echo "DB_PORT=3306" >> .env
          echo "DB_DATABASE=rtfm2win_test" >> .env
          echo "DB_USERNAME=root" >> .env
          echo "DB_PASSWORD=password" >> .env

      - name: Run database migrations
        run: php artisan migrate --force

      - name: Run PHP tests
        run: ./vendor/bin/pest --coverage --min=80

      - name: Build assets
        run: npm run build

      - name: Run JavaScript tests
        run: npm test

  deploy-staging:
    needs: tests
    runs-on: ubuntu-22.04
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/rtfm2win-staging
            git pull origin main
            composer install --no-dev --optimize-autoloader
            npm ci --only=production
            npm run build
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            sudo systemctl restart php8.3-fpm

  deploy-production:
    needs: [tests, deploy-staging]
    runs-on: ubuntu-22.04
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/rtfm2win
            
            # Backup
            sudo cp -r /var/www/rtfm2win /var/backups/rtfm2win-$(date +%Y%m%d_%H%M%S)
            
            # Deploy
            git pull origin main
            composer install --no-dev --optimize-autoloader
            npm ci --only=production
            npm run build
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan queue:restart
            
            # Restart services
            sudo systemctl restart php8.3-fpm
            sudo systemctl restart nginx
```

### **Configuration des Secrets GitHub**

Dans GitHub → Settings → Secrets and variables → Actions :

```
STAGING_HOST=ip-staging-server
STAGING_USER=admin
STAGING_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...

PRODUCTION_HOST=ip-production-server  
PRODUCTION_USER=admin
PRODUCTION_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

---

## 🐳 **Déploiement avec Docker**

### **Dockerfile Production**

```dockerfile
# Dockerfile
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    nginx \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /var/www

# Copy application code
COPY . /var/www

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
RUN npm ci --only=production && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

### **Docker Compose Production**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./storage:/var/www/storage
      - ./bootstrap/cache:/var/www/bootstrap/cache
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    depends_on:
      - mysql
      - redis
    networks:
      - rtfm2win-network

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - rtfm2win-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - rtfm2win-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./public:/var/www/public
      - ./storage/app/public:/var/www/storage/app/public
    depends_on:
      - app
    networks:
      - rtfm2win-network

volumes:
  mysql_data:
  redis_data:

networks:
  rtfm2win-network:
    driver: bridge
```

### **Commandes Docker**

```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# Migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Optimisations
docker-compose -f docker-compose.prod.yml exec app php artisan optimize

# Logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## ☸️ **Déploiement Kubernetes**

### **Configuration Kubernetes**

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rtfm2win-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rtfm2win-app
  template:
    metadata:
      labels:
        app: rtfm2win-app
    spec:
      containers:
      - name: rtfm2win
        image: rtfm2win:latest
        ports:
        - containerPort: 80
        env:
        - name: APP_ENV
          value: "production"
        - name: DB_HOST
          value: "mysql-service"
        - name: REDIS_HOST
          value: "redis-service"
        volumeMounts:
        - name: storage-volume
          mountPath: /var/www/storage
      volumes:
      - name: storage-volume
        persistentVolumeClaim:
          claimName: rtfm2win-storage-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: rtfm2win-service
spec:
  selector:
    app: rtfm2win-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

---

## 📊 **Monitoring et Alertes**

### **Configuration Monitoring**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"

volumes:
  grafana_data:
```

### **Alertes Slack**

```bash
# Script d'alerte
#!/bin/bash
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 RTFM2WIN: Déploiement terminé avec succès!"}' \
    $WEBHOOK_URL
```

---

## 🔒 **Sécurité de Déploiement**

### **SSL/TLS avec Let's Encrypt**

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Génération certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **Pare-feu et Sécurité**

```bash
# Configuration UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Fail2Ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### **Variables d'Environnement Sécurisées**

```bash
# Utiliser des outils comme sops, vault, ou sealed-secrets
# Exemple avec sops
sops -e .env.production > .env.production.encrypted
```

---

## 🔄 **Rollback et Recovery**

### **Script de Rollback**

```bash
#!/bin/bash
# rollback.sh

BACKUP_PATH="/var/backups"
PROJECT_PATH="/var/www/rtfm2win"

echo "📋 Sauvegardes disponibles:"
ls -la $BACKUP_PATH | grep rtfm2win

read -p "Entrez le nom de la sauvegarde à restaurer: " BACKUP_NAME

if [ -d "$BACKUP_PATH/$BACKUP_NAME" ]; then
    echo "🔄 Rollback vers $BACKUP_NAME..."
    
    # Arrêt services
    sudo systemctl stop php8.3-fpm nginx
    
    # Sauvegarde état actuel
    sudo mv $PROJECT_PATH ${PROJECT_PATH}-rollback-$(date +%Y%m%d_%H%M%S)
    
    # Restauration
    sudo cp -r $BACKUP_PATH/$BACKUP_NAME $PROJECT_PATH
    
    # Permissions
    sudo chown -R www-data:www-data $PROJECT_PATH
    
    # Redémarrage services
    sudo systemctl start php8.3-fpm nginx
    
    echo "✅ Rollback terminé!"
else
    echo "❌ Sauvegarde introuvable!"
fi
```

### **Tests Post-Rollback**

```bash
# Script de validation
#!/bin/bash
DOMAIN="votre-domaine.com"

echo "🧪 Tests post-rollback..."

# Test connectivité
curl -f https://$DOMAIN > /dev/null && echo "✅ Site accessible" || echo "❌ Site inaccessible"

# Test base de données
php artisan tinker --execute="dd(DB::connection()->getPdo());" > /dev/null && echo "✅ BDD OK" || echo "❌ BDD KO"

# Test cache
php artisan cache:clear && echo "✅ Cache vidé"

echo "🎉 Validation terminée!"
```

---

## 📈 **Optimisations Production**

### **Performance Web**

```nginx
# nginx.conf optimisations
server {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### **Optimisations Laravel**

```bash
# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
composer install --optimize-autoloader --no-dev
```

### **CDN et Assets**

```javascript
// vite.config.ts pour CDN
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
                }
            }
        }
    }
});
```

---

## 🎯 **Checklist de Déploiement**

### **Pre-Déploiement**
- [ ] Tests passent en local
- [ ] Code review terminée
- [ ] Variables d'environnement configurées
- [ ] Sauvegarde base de données
- [ ] Notification équipe

### **Déploiement**
- [ ] Pull du code
- [ ] Installation dépendances
- [ ] Migrations base de données
- [ ] Build des assets
- [ ] Optimisations Laravel
- [ ] Redémarrage services

### **Post-Déploiement**
- [ ] Tests smoke automatiques
- [ ] Vérification logs
- [ ] Monitoring actif
- [ ] Performance check
- [ ] Notification succès

---

## 🆘 **Support et Dépannage**

### **Logs de Production**

```bash
# Logs Laravel
tail -f /var/www/rtfm2win/storage/logs/laravel.log

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs système
journalctl -f -u php8.3-fpm
```

### **Commandes d'Urgence**

```bash
# Maintenance mode
php artisan down --message="Maintenance en cours" --retry=60

# Sortir du mode maintenance
php artisan up

# Vider tous les caches
php artisan optimize:clear
```

---

Votre pipeline de déploiement RTFM2WIN est maintenant prêt pour la production ! 🚀

Pour toute question sur le déploiement, consultez la documentation ou contactez l'équipe DevOps. 