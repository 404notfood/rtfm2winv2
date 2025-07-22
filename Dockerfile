# Dockerfile multi-stage pour RTFM2WIN
# Stage 1: Build des assets frontend
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copier les fichiers de dépendances Node.js
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installer les dépendances Node.js
RUN npm ci --only=production

# Copier le code source frontend
COPY resources/ ./resources/
COPY public/ ./public/

# Build des assets
RUN npm run build

# Stage 2: Base PHP avec extensions
FROM php:8.3-fpm-alpine AS php-base

# Installer les dépendances système
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    redis \
    git \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        xml \
        zip \
        bcmath \
        intl \
        gd \
        opcache \
    && rm -rf /var/cache/apk/*

# Installer Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Configuration PHP pour production
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-rtfm2win.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Stage 3: Application Laravel
FROM php-base AS app

WORKDIR /var/www/html

# Copier les fichiers de dépendances PHP
COPY composer.json composer.lock ./

# Installer les dépendances PHP (sans dev)
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

# Copier le code source Laravel
COPY . .

# Copier les assets buildés depuis le stage Node.js
COPY --from=node-builder /app/public/build ./public/build

# Finaliser l'installation Composer
RUN composer dump-autoload --optimize

# Créer les répertoires nécessaires et définir les permissions
RUN mkdir -p storage/logs \
    && mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p storage/app/public \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Configuration Nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Configuration Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Script d'entrée
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Exposer le port 80
EXPOSE 80

# Utiliser le script d'entrée
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Commande par défaut
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Stage 4: Image de développement
FROM app AS development

# Réinstaller les dépendances de développement
RUN composer install --dev

# Installer Xdebug pour le développement
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del $PHPIZE_DEPS

# Configuration Xdebug
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

# Installer Node.js pour le développement
COPY --from=node:20-alpine /usr/local/bin/node /usr/local/bin/node
COPY --from=node:20-alpine /usr/local/bin/npm /usr/local/bin/npm

# Copier package.json pour le développement
COPY package*.json ./
RUN npm install

# Exposer le port Vite pour HMR
EXPOSE 5173

# Stage 5: Image de production finale
FROM app AS production

# Optimisations finales pour la production
RUN php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

# Sanity check
RUN php -v && nginx -t 