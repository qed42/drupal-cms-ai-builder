FROM php:8.4-fpm-alpine

# Install system dependencies and PHP extensions for Drupal
RUN apk add --no-cache \
    nginx \
    mariadb-client \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    icu-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd intl opcache pdo_mysql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Nginx config for Drupal
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy Drupal codebase
COPY . /var/www/html/
WORKDIR /var/www/html

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# PHP-FPM production tuning
RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    } > /usr/local/etc/php/conf.d/opcache-production.ini

# Set ownership for sites directory (multisite writes here)
RUN chown -R www-data:www-data /var/www/html/web/sites

EXPOSE 80

CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
