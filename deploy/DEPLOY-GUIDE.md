# Guide de Déploiement - Ndayane Services
## VPS Hostinger Ubuntu 24.04

### Informations VPS
- **IP**: 72.62.237.47
- **OS**: Ubuntu 24.04 LTS
- **Accès**: ssh root@72.62.237.47

---

## Étape 1: Connexion au VPS

```bash
ssh root@72.62.237.47
```
Entrer le mot de passe root.

---

## Étape 2: Installation des dépendances

```bash
# Mise à jour système
apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL
apt install -y postgresql postgresql-contrib

# Nginx
apt install -y nginx

# PM2
npm install -g pm2

# Git
apt install -y git
```

---

## Étape 3: Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans PostgreSQL, exécuter:
CREATE USER ndayane WITH PASSWORD 'NdayaneSecure2024!';
CREATE DATABASE ndayane_db OWNER ndayane;
GRANT ALL PRIVILEGES ON DATABASE ndayane_db TO ndayane;
\q
```

---

## Étape 4: Cloner le projet

```bash
cd /var/www
git clone https://github.com/eldieng/Ndayane_Service.git ndayane
cd ndayane
```

---

## Étape 5: Configuration Backend

```bash
cd /var/www/ndayane/backend

# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://ndayane:NdayaneSecure2024!@localhost:5432/ndayane_db"
JWT_SECRET="NdayaneJwtSecret2024SuperSecure!"
PORT=3001
NODE_ENV=production
EOF

# Initialiser la base de données
npx prisma db push
npx prisma db seed

# Compiler le backend
npm run build
```

---

## Étape 6: Configuration Frontend

```bash
cd /var/www/ndayane/frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local pour la production
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://72.62.237.47:3001
EOF

# Build de production
npm run build
```

---

## Étape 7: Configuration Nginx

```bash
# Créer la configuration
cat > /etc/nginx/sites-available/ndayane << 'EOF'
server {
    listen 80;
    server_name 72.62.237.47;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location ~ ^/(ventes|produits|clients|stock|categories|depots|utilisateurs|paiements|documents|dashboard|rapports|auth|factures) {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/ndayane /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester et redémarrer Nginx
nginx -t
systemctl restart nginx
```

---

## Étape 8: Lancer avec PM2

```bash
cd /var/www/ndayane

# Créer le fichier ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ndayane-backend',
      cwd: '/var/www/ndayane/backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'ndayane-frontend',
      cwd: '/var/www/ndayane/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
EOF

# Lancer les applications
pm2 start ecosystem.config.js

# Sauvegarder pour redémarrage auto
pm2 save
pm2 startup
```

---

## Étape 9: Ouvrir les ports du pare-feu

```bash
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable
```

---

## Vérification

L'application devrait être accessible à:
- **http://72.62.237.47**

Connexion admin:
- **Email**: admin@ndayane.sn
- **Mot de passe**: admin123

---

## Commandes utiles

```bash
# Voir les logs
pm2 logs

# Redémarrer les apps
pm2 restart all

# Statut
pm2 status

# Mettre à jour le code
cd /var/www/ndayane
git pull
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```
