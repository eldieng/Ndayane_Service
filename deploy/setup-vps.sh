#!/bin/bash
# ===========================================
# SCRIPT DE DÉPLOIEMENT NDAYANE SERVICES
# VPS Hostinger - Ubuntu 24.04
# ===========================================

echo "🚀 Déploiement Ndayane Services..."
echo "=================================="

# 1. Mise à jour du système
echo "1. Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation de Node.js 20
echo "2. Installation de Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Installation de PostgreSQL
echo "3. Installation de PostgreSQL..."
apt install -y postgresql postgresql-contrib

# 4. Installation de Nginx
echo "4. Installation de Nginx..."
apt install -y nginx

# 5. Installation de PM2 (gestionnaire de processus)
echo "5. Installation de PM2..."
npm install -g pm2

# 6. Installation de Git
echo "6. Installation de Git..."
apt install -y git

# 7. Création de l'utilisateur pour l'application
echo "7. Création de l'utilisateur ndayane..."
useradd -m -s /bin/bash ndayane || true

# 8. Configuration de PostgreSQL
echo "8. Configuration de PostgreSQL..."
sudo -u postgres psql -c "CREATE USER ndayane WITH PASSWORD 'NdayaneSecure2024!';" || true
sudo -u postgres psql -c "CREATE DATABASE ndayane_db OWNER ndayane;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ndayane_db TO ndayane;" || true

# 9. Cloner le projet
echo "9. Clonage du projet..."
cd /var/www
git clone https://github.com/eldieng/Ndayane_Service.git ndayane || (cd ndayane && git pull)

# 10. Permissions
chown -R ndayane:ndayane /var/www/ndayane

echo "✅ Installation de base terminée!"
echo ""
echo "Prochaines étapes manuelles:"
echo "1. cd /var/www/ndayane/backend && npm install"
echo "2. Créer le fichier .env"
echo "3. npx prisma db push && npx prisma db seed"
echo "4. cd /var/www/ndayane/frontend && npm install && npm run build"
echo "5. Configurer Nginx"
echo "6. Lancer avec PM2"
