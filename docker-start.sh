#!/bin/bash

# Script de démarrage rapide Docker pour RTFM2WIN
# Usage: ./docker-start.sh [dev|prod]

set -e

MODE=${1:-dev}
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Démarrage RTFM2WIN avec Docker${NC}"
echo -e "${YELLOW}Mode: ${MODE}${NC}"

# Fonction pour vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        echo "Installez Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
        echo "Installez Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi

    echo -e "${GREEN}✅ Docker et Docker Compose détectés${NC}"
}

# Fonction pour créer le fichier .env approprié
setup_env() {
    if [ "$MODE" = "dev" ]; then
        ENV_FILE=".env.docker"
        if [ ! -f "$ENV_FILE" ]; then
            echo -e "${YELLOW}📝 Création du fichier $ENV_FILE...${NC}"
            cp .env.example "$ENV_FILE"
            
            # Remplacer les valeurs pour Docker
            sed -i.bak 's/DB_HOST=127.0.0.1/DB_HOST=mysql/' "$ENV_FILE"
            sed -i.bak 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/' "$ENV_FILE"
            sed -i.bak 's/MAIL_HOST=127.0.0.1/MAIL_HOST=mailhog/' "$ENV_FILE"
            sed -i.bak 's/APP_URL=http:\/\/localhost/APP_URL=http:\/\/localhost:8000/' "$ENV_FILE"
            
            # Ajouter les configurations WebSockets
            echo "" >> "$ENV_FILE"
            echo "# Docker WebSockets" >> "$ENV_FILE"
            echo "PUSHER_HOST=websockets" >> "$ENV_FILE"
            echo "PUSHER_PORT=6001" >> "$ENV_FILE"
            echo "PUSHER_SCHEME=http" >> "$ENV_FILE"
            
            rm -f "$ENV_FILE.bak"
            echo -e "${GREEN}✅ Fichier $ENV_FILE créé${NC}"
        fi
    else
        ENV_FILE=".env.production"
        if [ ! -f "$ENV_FILE" ]; then
            echo -e "${YELLOW}📝 Création du fichier $ENV_FILE...${NC}"
            cp .env.example "$ENV_FILE"
            echo -e "${YELLOW}⚠️  N'oubliez pas de configurer $ENV_FILE avec vos valeurs de production !${NC}"
        fi
    fi
}

# Fonction pour démarrer les services
start_services() {
    if [ "$MODE" = "dev" ]; then
        echo -e "${YELLOW}🚀 Démarrage des services de développement...${NC}"
        docker-compose --env-file=.env.docker up -d
        
        echo -e "${YELLOW}⏳ Attente que les services soient prêts...${NC}"
        sleep 10
        
        # Exécuter les migrations et seeders
        echo -e "${YELLOW}🗄️ Exécution des migrations et seeders...${NC}"
        docker-compose exec -T app php artisan migrate:fresh --seed || true
        
        # Afficher les URLs utiles
        echo -e "${GREEN}✅ Services démarrés avec succès !${NC}"
        echo ""
        echo -e "${YELLOW}🌐 URLs disponibles:${NC}"
        echo "   Application:     http://localhost:8000"
        echo "   phpMyAdmin:      http://localhost:8080"
        echo "   Redis Commander: http://localhost:8081"
        echo "   MailHog:         http://localhost:8025"
        echo "   WebSockets:      ws://localhost:6001"
        
    else
        echo -e "${YELLOW}🚀 Démarrage des services de production...${NC}"
        docker-compose -f docker-compose.prod.yml --env-file=.env.production up -d
        
        echo -e "${YELLOW}⏳ Attente que les services soient prêts...${NC}"
        sleep 15
        
        echo -e "${GREEN}✅ Services de production démarrés !${NC}"
        echo ""
        echo -e "${YELLOW}🌐 URLs disponibles:${NC}"
        echo "   Application: https://votre-domaine.com"
        echo "   Traefik:     http://localhost:8080"
        echo "   Prometheus:  http://localhost:9090"
        echo "   Grafana:     http://localhost:3000"
    fi
}

# Fonction pour afficher les logs
show_logs() {
    echo ""
    echo -e "${YELLOW}📋 Pour voir les logs:${NC}"
    if [ "$MODE" = "dev" ]; then
        echo "   docker-compose logs -f"
        echo "   docker-compose logs -f app"
    else
        echo "   docker-compose -f docker-compose.prod.yml logs -f"
    fi
}

# Fonction pour afficher les commandes utiles
show_commands() {
    echo ""
    echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
    
    if [ "$MODE" = "dev" ]; then
        echo "   # Exécuter une commande Artisan"
        echo "   docker-compose exec app php artisan migrate"
        echo ""
        echo "   # Accéder au shell du conteneur"
        echo "   docker-compose exec app bash"
        echo ""
        echo "   # Arrêter les services"
        echo "   docker-compose down"
    else
        echo "   # Vérifier le statut"
        echo "   docker-compose -f docker-compose.prod.yml ps"
        echo ""
        echo "   # Arrêter les services"
        echo "   docker-compose -f docker-compose.prod.yml down"
    fi
}

# Fonction principale
main() {
    echo ""
    check_docker
    setup_env
    start_services
    show_logs
    show_commands
    
    echo ""
    echo -e "${GREEN}🎉 RTFM2WIN est maintenant accessible !${NC}"
    
    if [ "$MODE" = "dev" ]; then
        echo -e "${YELLOW}👉 Ouvrez http://localhost:8000 dans votre navigateur${NC}"
    fi
}

# Gestion des arguments
case $MODE in
    dev|development)
        MODE="dev"
        ;;
    prod|production)
        MODE="prod"
        ;;
    *)
        echo -e "${RED}❌ Mode invalide: $MODE${NC}"
        echo "Usage: $0 [dev|prod]"
        exit 1
        ;;
esac

# Exécuter le script principal
main 