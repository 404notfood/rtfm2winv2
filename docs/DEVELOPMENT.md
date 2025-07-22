# 🔧 Guide de Développement - RTFM2WIN

## 📋 **Configuration de l'Environnement de Développement**

Ce guide vous accompagne dans la configuration d'un environnement de développement optimal pour RTFM2WIN.

---

## 🛠️ **Prérequis de Développement**

### **Logiciels Requis**

- **PHP 8.3+** avec extensions :
  - `php-mysql`, `php-redis`, `php-curl`, `php-mbstring`, `php-xml`, `php-zip`
  - `php-bcmath`, `php-intl`, `php-gd`, `php-imagick`
- **Node.js 18+** et **npm 10+**
- **Composer 2.0+**
- **MySQL 8.0+** ou **PostgreSQL 13+**
- **Redis 7.0+** (optionnel mais recommandé)
- **Git 2.30+**

### **Outils de Développement Recommandés**

#### **IDE/Éditeurs**
- **VS Code** avec extensions :
  - PHP Intelephense
  - Laravel Extension Pack
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
- **PhpStorm** (version complète)
- **Neovim** avec LSP configuré

#### **Outils en ligne de commande**
```bash
# Laravel
composer global require laravel/installer
composer global require laravel/valet # macOS
composer global require friendsofphp/php-cs-fixer

# Node.js
npm install -g typescript
npm install -g @types/node
npm install -g eslint
npm install -g prettier
```

---

## 🚀 **Installation de l'Environnement de Développement**

### **1. Clone et Configuration Initiale**

```bash
# Cloner le repository
git clone https://github.com/votre-username/rtfm2win.git
cd rtfm2win

# Installer les dépendances
composer install
npm install

# Configuration environnement
cp .env.example .env.local
php artisan key:generate
```

### **2. Configuration Base de Données**

#### **Option A : MySQL Local**
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE rtfm2win_dev;
CREATE USER 'rtfm2win_dev'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rtfm2win_dev.* TO 'rtfm2win_dev'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### **Option B : Docker Compose (Recommandé)**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: rtfm2win_dev
      MYSQL_USER: rtfm2win_dev
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

```bash
# Démarrer les services
docker-compose -f docker-compose.dev.yml up -d
```

### **3. Configuration .env.local**

```env
APP_NAME="RTFM2WIN (DEV)"
APP_ENV=local
APP_KEY=base64:votre_clé_générée
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rtfm2win_dev
DB_USERNAME=rtfm2win_dev
DB_PASSWORD=password

BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# WebSockets pour développement
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# Mail en développement (Mailtrap ou MailHog)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="dev@rtfm2win.local"
MAIL_FROM_NAME="${APP_NAME}"

# Debug et développement
TELESCOPE_ENABLED=true
DEBUGBAR_ENABLED=true
```

### **4. Initialisation de l'Application**

```bash
# Migrations et données de test
php artisan migrate:fresh --seed

# Liens symboliques
php artisan storage:link

# Optimisation développement
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Build assets en mode développement
npm run dev
```

---

## 🏃‍♂️ **Démarrage de l'Environnement**

### **Scripts de Développement**

Créez un script `dev-start.sh` :
```bash
#!/bin/bash
echo "🚀 Démarrage environnement RTFM2WIN..."

# Démarrer les services Docker
docker-compose -f docker-compose.dev.yml up -d

# Attendre que MySQL soit prêt
echo "⏳ Attente de MySQL..."
sleep 10

# Démarrer Laravel
echo "🐘 Démarrage Laravel..."
php artisan serve &

# Démarrer Queue Worker
echo "⚡ Démarrage Queue Worker..."
php artisan queue:work &

# Démarrer WebSocket Server
echo "🔌 Démarrage WebSocket Server..."
php artisan websockets:serve &

# Démarrer Vite
echo "⚡ Démarrage Vite..."
npm run dev

echo "✅ Environnement prêt !"
echo "🌐 Application: http://localhost:8000"
echo "🔌 WebSockets: ws://localhost:6001"
```

```bash
chmod +x dev-start.sh
./dev-start.sh
```

---

## 🧪 **Tests et Qualité de Code**

### **Configuration PHPUnit/Pest**

```xml
<!-- phpunit.xml (déjà configuré) -->
<phpunit>
    <!-- Configuration existante -->
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### **Commandes de Test**

```bash
# Tests complets
./vendor/bin/pest

# Tests avec couverture
./vendor/bin/pest --coverage --min=80

# Tests spécifiques
./vendor/bin/pest --filter=QuizTest

# Tests en parallèle
./vendor/bin/pest --parallel

# Tests frontend
npm test

# Tests end-to-end (à configurer)
npm run test:e2e
```

### **Qualité de Code PHP**

```bash
# PHP CS Fixer
./vendor/bin/php-cs-fixer fix

# PHPStan (analyse statique)
./vendor/bin/phpstan analyse

# Larastan (PHPStan pour Laravel)
./vendor/bin/phpstan analyse --memory-limit=2G
```

### **Qualité de Code JavaScript/TypeScript**

```bash
# ESLint
npm run lint

# Prettier
npm run format

# Type checking TypeScript
npm run type-check
```

---

## 🔧 **Outils de Développement Avancés**

### **Laravel Telescope (Debug)**

```bash
# Installation
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Accès : `http://localhost:8000/telescope`

### **Laravel Debugbar**

```bash
# Installation
composer require barryvdh/laravel-debugbar --dev
```

### **Laravel IDE Helper**

```bash
# Installation
composer require --dev barryvdh/laravel-ide-helper
composer require --dev doctrine/dbal

# Génération des helpers
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

### **MailHog (Test emails)**

```bash
# Via Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Interface web : http://localhost:8025
```

---

## 📁 **Structure du Projet**

### **Architecture Backend**

```
app/
├── Console/Commands/          # Commandes Artisan personnalisées
├── Events/                   # Événements temps réel
├── Http/
│   ├── Controllers/          # Contrôleurs MVC
│   ├── Middleware/          # Middlewares personnalisés
│   └── Requests/            # Form Requests
├── Models/                  # Modèles Eloquent
├── Services/                # Services métier (POO)
└── Traits/                  # Traits réutilisables
```

### **Architecture Frontend**

```
resources/js/
├── components/              # Composants réutilisables
│   ├── ui/                 # Composants shadcn/ui
│   ├── quiz/               # Composants spécifiques quiz
│   └── real-time/          # Composants temps réel
├── hooks/                  # Hooks React personnalisés
├── layouts/                # Layouts de pages
├── pages/                  # Pages Inertia
├── types/                  # Définitions TypeScript
└── lib/                    # Utilitaires
```

---

## 🔄 **Workflow de Développement**

### **Git Flow Recommandé**

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développement avec commits fréquents
git add .
git commit -m "feat: ajouter système de notifications"

# Tests avant push
./vendor/bin/pest
npm test

# Push et Pull Request
git push origin feature/nouvelle-fonctionnalite
```

### **Convention de Commits**

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour documentation
style: formatage code
refactor: refactoring sans changement fonctionnel
test: ajout/modification tests
chore: tâches maintenance
```

### **Hooks Git (optionnel)**

Créer `.git/hooks/pre-commit` :
```bash
#!/bin/bash
# Exécuter les tests avant commit
./vendor/bin/pest --bail
npm test
```

---

## 🐛 **Debug et Dépannage**

### **Logs de Développement**

```bash
# Logs Laravel en temps réel
tail -f storage/logs/laravel.log

# Logs spécifiques
php artisan log:clear
php artisan queue:failed
```

### **Debug WebSockets**

```bash
# Tester la connexion WebSocket
wscat -c ws://localhost:6001/app/local-key

# Logs WebSocket
php artisan websockets:serve --debug
```

### **Problèmes Courants**

#### **Erreurs de Cache**
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
composer dump-autoload
```

#### **Problèmes de Permissions**
```bash
sudo chown -R $USER:www-data storage
sudo chown -R $USER:www-data bootstrap/cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

#### **Erreurs NPM**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🚀 **Optimisations de Développement**

### **Vite Configuration Avancée**

```javascript
// vite.config.ts
export default defineConfig({
    server: {
        hmr: {
            host: 'localhost',
        },
    },
    build: {
        sourcemap: true,
    },
});
```

### **Raccourcis VS Code**

```json
// .vscode/settings.json
{
    "php.suggest.basic": false,
    "php.validate.executablePath": "/usr/bin/php",
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

### **Scripts Package.json Utiles**

```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build && vite build --ssr",
        "test": "vitest",
        "test:coverage": "vitest --coverage",
        "lint": "eslint resources/js --ext .ts,.tsx",
        "lint:fix": "eslint resources/js --ext .ts,.tsx --fix",
        "type-check": "tsc --noEmit",
        "format": "prettier --write resources/js"
    }
}
```

---

## 📚 **Ressources de Développement**

### **Documentation Officielle**
- [Laravel 12 Docs](https://laravel.com/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Inertia.js](https://inertiajs.com)

### **Outils Utiles**
- [Laravel Shift](https://laravelshift.com) - Mise à jour automatique
- [Tinkerwell](https://tinkerwell.app) - REPL PHP avancé
- [Ray](https://myray.app) - Debug avancé
- [Herd](https://herd.laravel.com) - Environnement Laravel local

### **Communautés**
- [Laravel Discord](https://discord.gg/laravel)
- [React Community](https://reactjs.org/community/support.html)
- [Laracasts](https://laracasts.com) - Formations Laravel

---

## 🎯 **Bonnes Pratiques**

### **Code PHP**
- Suivre PSR-12 pour le style de code
- Utiliser les Form Requests pour la validation
- Services pour la logique métier complexe
- Traits pour le code réutilisable
- Tests unitaires pour les services

### **Code React/TypeScript**
- Composants fonctionnels avec hooks
- Props typées avec TypeScript
- Hooks personnalisés pour la logique réutilisable
- Tests unitaires avec Vitest
- Optimisation avec React.memo si nécessaire

### **Base de Données**
- Migrations pour tous les changements de schéma
- Seeders pour les données de test
- Index sur les colonnes fréquemment interrogées
- Relations Eloquent pour les jointures

### **Performance**
- Lazy loading pour les relations
- Cache Redis pour les données fréquentes
- Optimisation des requêtes N+1
- Compression des assets

---

Votre environnement de développement RTFM2WIN est maintenant prêt ! 🎉

Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub. 