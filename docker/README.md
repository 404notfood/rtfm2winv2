# 🐳 Configuration Docker pour RTFM2WIN

Ce répertoire contient toute la configuration Docker nécessaire pour faire fonctionner RTFM2WIN en développement et en production.

## 📁 **Structure des Fichiers**

```
docker/
├── entrypoint.sh              # Script d'initialisation
├── php/
│   ├── php.ini               # Configuration PHP
│   ├── opcache.ini           # Configuration OPcache
│   └── xdebug.ini           # Configuration Xdebug (dev)
├── nginx/
│   ├── nginx.conf           # Configuration Nginx principale
│   └── default.conf         # Configuration vhost
├── supervisor/
│   └── supervisord.conf     # Configuration Supervisor
├── mysql/
│   ├── init.sql             # Script d'initialisation MySQL
│   └── prod.cnf             # Configuration MySQL production
└── README.md                # Cette documentation
```

## 🚀 **Démarrage Rapide**

### **Développement**

```bash
# Copier le fichier d'environnement
cp .env.example .env.docker

# Modifier .env.docker avec les valeurs Docker
# (DB_HOST=mysql, REDIS_HOST=redis, etc.)

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Accéder à l'application
open http://localhost:8000
```

### **Production**

```bash
# Créer le fichier d'environnement de production
cp .env.example .env.production

# Configurer .env.production avec vos valeurs

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

## 🛠️ **Services Disponibles**

### **Développement (`docker-compose.yml`)**

| Service | Port | Description |
|---------|------|-------------|
| `app` | 8000 | Application RTFM2WIN |
| `mysql` | 3306 | Base de données MySQL 8.0 |
| `redis` | 6379 | Cache et sessions Redis |
| `websockets` | 6001 | Serveur WebSockets |
| `queue` | - | Worker de files d'attente |
| `scheduler` | - | Planificateur de tâches |
| `mailhog` | 8025 | Interface web emails (SMTP: 1025) |
| `phpmyadmin` | 8080 | Interface MySQL |
| `redis-commander` | 8081 | Interface Redis |

### **Production (`docker-compose.prod.yml`)**

| Service | Port | Description |
|---------|------|-------------|
| `app` | 80/443 | Application avec SSL |
| `mysql` | - | MySQL optimisé production |
| `redis` | - | Redis sécurisé |
| `websockets` | 6001 | WebSockets production |
| `queue` | - | Workers (x2 replicas) |
| `traefik` | 80/443 | Reverse proxy + SSL |
| `prometheus` | 9090 | Monitoring |
| `grafana` | 3000 | Dashboards |
| `mysql-backup` | - | Backup automatique |

## 📋 **Commandes Utiles**

### **Gestion des Conteneurs**

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Rebuild les images
docker-compose build --no-cache

# Voir les logs en temps réel
docker-compose logs -f app

# Exécuter une commande dans le conteneur app
docker-compose exec app php artisan migrate

# Accéder au shell du conteneur
docker-compose exec app bash
```

### **Base de Données**

```bash
# Exécuter les migrations
docker-compose exec app php artisan migrate

# Seeders de développement
docker-compose exec app php artisan db:seed

# Reset complet de la BDD
docker-compose exec app php artisan migrate:fresh --seed

# Backup de la BDD
docker-compose exec mysql mysqldump -u root -p rtfm2win > backup.sql
```

### **Cache et Optimisations**

```bash
# Vider tous les caches
docker-compose exec app php artisan optimize:clear

# Optimisations production
docker-compose exec app php artisan optimize

# Redémarrer les workers
docker-compose exec app php artisan queue:restart
```

### **Assets Frontend**

```bash
# Build des assets
docker-compose exec app npm run build

# Mode développement avec HMR
docker-compose exec app npm run dev

# Tests JavaScript
docker-compose exec app npm test
```

## 🔧 **Configuration Avancée**

### **Variables d'Environnement Docker**

Créez un fichier `.env.docker` basé sur `.env.example` avec ces modifications :

```env
# Hosts Docker
DB_HOST=mysql
REDIS_HOST=redis
MAIL_HOST=mailhog

# WebSockets
PUSHER_HOST=websockets
PUSHER_PORT=6001
PUSHER_SCHEME=http

# URLs
APP_URL=http://localhost:8000
```

### **Volumes Persistants**

Les données importantes sont stockées dans des volumes Docker :

- `mysql_data` : Base de données MySQL
- `redis_data` : Cache Redis
- `node_modules` : Dépendances Node.js (performance)

### **Réseaux**

Tous les services communiquent via le réseau `rtfm2win-network` pour l'isolation et la sécurité.

## 🐛 **Dépannage**

### **Problèmes Courants**

#### **Port déjà utilisé**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :8000

# Changer le port dans docker-compose.yml
ports:
  - "8001:80"  # Au lieu de 8000:80
```

#### **Permissions des fichiers**
```bash
# Fixer les permissions
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache
```

#### **Base de données non accessible**
```bash
# Vérifier que MySQL est démarré
docker-compose ps mysql

# Voir les logs MySQL
docker-compose logs mysql

# Tester la connexion
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo();
```

#### **WebSockets ne fonctionnent pas**
```bash
# Vérifier le service WebSockets
docker-compose logs websockets

# Tester la connexion
curl -v http://localhost:6001/app/local-key
```

### **Logs et Debug**

```bash
# Logs de l'application
docker-compose logs -f app

# Logs Nginx
docker-compose exec app tail -f /var/log/nginx/error.log

# Logs PHP
docker-compose exec app tail -f /var/log/php_errors.log

# Logs Laravel
docker-compose exec app tail -f storage/logs/laravel.log
```

## 🔒 **Sécurité Production**

### **Variables Sensibles**

Pour la production, utilisez un fichier `.env.production` sécurisé :

```env
# Générer des valeurs aléatoires sécurisées
APP_KEY=base64:...
DB_PASSWORD=...
REDIS_PASSWORD=...
PUSHER_APP_SECRET=...
```

### **SSL/TLS**

Le setup production inclut Traefik pour le SSL automatique :

```yaml
# Configuration automatique Let's Encrypt
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.rtfm2win.rule=Host(`votre-domaine.com`)"
  - "traefik.http.routers.rtfm2win.tls.certresolver=letsencrypt"
```

### **Monitoring**

Le monitoring est inclus avec :
- **Prometheus** : Métriques
- **Grafana** : Dashboards
- **Backup automatique** : MySQL

## 📊 **Performance**

### **Optimisations Incluses**

- **OPcache** activé avec JIT PHP 8.3
- **Redis** pour cache et sessions
- **Nginx** optimisé avec compression gzip
- **MySQL** configuré pour les performances
- **Assets** avec cache longue durée

### **Monitoring des Ressources**

```bash
# Utilisation des ressources
docker stats

# Espace disque des volumes
docker system df

# Nettoyage
docker system prune -a
```

## 🚀 **Déploiement**

### **CI/CD avec GitHub Actions**

Le projet inclut une configuration GitHub Actions pour :
- Build automatique des images
- Tests sur chaque commit
- Déploiement automatique

### **Mise à jour**

```bash
# Mettre à jour le code
git pull

# Rebuild et redémarrer
docker-compose build --no-cache
docker-compose up -d

# Migrations si nécessaire
docker-compose exec app php artisan migrate
```

---

## 📞 **Support**

Pour toute question sur Docker :
1. Vérifiez les logs : `docker-compose logs`
2. Consultez cette documentation
3. Ouvrez une issue sur GitHub

**Votre environnement Docker RTFM2WIN est prêt ! 🎉** 