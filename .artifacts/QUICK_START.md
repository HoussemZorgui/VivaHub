# 🚀 LifeHub - Guide de Démarrage Rapide

Bienvenue dans **LifeHub** ! Ce guide vous aidera à lancer l'application en quelques minutes.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Node.js** >= 18.0.0 ([Télécharger](https://nodejs.org/))
- ✅ **npm** >= 9.0.0 (inclus avec Node.js)
- ✅ **MongoDB** >= 6.0 ([Installation](https://www.mongodb.com/try/download/community))
- ✅ **PostgreSQL** >= 15.0 ([Installation](https://www.postgresql.org/download/))
- ✅ **Redis** >= 7.0 ([Installation](https://redis.io/download))
- ✅ **Expo CLI** (pour mobile): `npm install -g expo-cli`

### Vérification des installations

```bash
node --version    # devrait afficher v18.x.x ou supérieur
npm --version     # devrait afficher 9.x.x ou supérieur
mongo --version   # devrait afficher MongoDB shell version v6.x.x
psql --version    # devrait afficher psql (PostgreSQL) 15.x
redis-cli --version  # devrait afficher redis-cli 7.x.x
```

---

## 🎯 Installation Rapide

### Étape 1: Démarrer les bases de données

#### Option A: Avec Docker (Recommandé)

```bash
# Dans le répertoire racine
docker-compose up -d

# Vérifier que les conteneurs sont en cours d'exécution
docker ps
```

#### Option B: Installation locale

```bash
# MongoDB
mongod --dbpath ~/data/db

# PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Redis
redis-server
```

---

### Étape 2: Configuration Backend

```bash
# 1. Aller dans le dossier backend
cd lifehub-backend

# 2. Les dépendances sont déjà installées
# Si besoin: npm install

# 3. Le fichier .env a été créé depuis .env.example
# Vous pouvez le modifier si nécessaire
nano .env

# 4. Créer la base de données PostgreSQL pour les finances
createdb lifehub_finance

# 5. Démarrer le serveur backend
npm run dev
```

Le backend devrait démarrer sur `http://localhost:5000` 🎉

---

### Étape 3: Configuration Mobile

```bash
# 1. Ouvrir un nouveau terminal
cd lifehub-mobile

# 2. Installer les dépendances
npm install

# 3. Démarrer Expo
npx expo start
```

L'interface Expo DevTools s'ouvrira sur `http://localhost:8081`

---

## 📱 Lancer l'application mobile

### Sur iOS Simulator (Mac uniquement)

```bash
# Installer Xcode depuis l'App Store
# Puis:
npx expo start --ios
```

### Sur Android Emulator

```bash
# Installer Android Studio
# Créer un AVD (Android Virtual Device)
# Puis:
npx expo start --android
```

### Sur votre téléphone

1. Installer **Expo Go** depuis:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scanner le QR code affiché dans le terminal avec:
   - iOS : Appareil photo natif
   - Android : Application Expo Go

---

## ✅ Vérification du fonctionnement

### Backend

Ouvrir votre navigateur et aller sur:

```
http://localhost:5000/health
```

Vous devriez voir:

```json
{
  "success": true,
  "message": "LifeHub API is running",
  "timestamp": "2024-...",
  "uptime": 123.456,
  "environment": "development",
  "databases": {
    "mongodb": true,
    "postgres": true,
    "redis": true
  }
}
```

### Mobile

L'application devrait afficher l'écran de connexion (LoginScreen).

---

## 🔑 Configuration des APIs externes (Optionnel pour MVP)

### Obtenir les clés API gratuites

1. **OpenAI** (pour l'assistant IA):
   - Aller sur: https://platform.openai.com/
   - S'inscrire et obtenir une API key
   - Ajouter dans `.env`: `OPENAI_API_KEY=sk-...`

2. **Mapbox** (pour les cartes):
   - Aller sur: https://www.mapbox.com/
   - S'inscrire et créer un token
   - Ajouter dans `.env`: `MAPBOX_ACCESS_TOKEN=pk....`

3. **Nutritionix** (pour la nutrition):
   - Aller sur: https://developer.nutritionix.com/
   - S'inscrire et obtenir API ID + Key
   - Ajouter dans `.env`:
     ```
     NUTRITIONIX_API_KEY=...
     NUTRITIONIX_API_ID=...
     ```

4. **Firebase** (pour le stockage et notifications):
   - Créer un projet sur: https://console.firebase.google.com/
   - Télécharger le fichier de configuration
   - Ajouter les credentials dans `.env`

---

## 🧪 Tester l'API

### Avec curl

```bash
# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe"
  }'

# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Avec Postman

1. Importer la collection dans `.artifacts/postman_collection.json`
2. Tester les endpoints

---

## 🐛 Dépannage

### Le backend ne démarre pas

**Erreur: MongoDB connection failed**
```bash
# Vérifier que MongoDB est en cours d'exécution
mongosh

# Si erreur, démarrer MongoDB:
mongod --dbpath ~/data/db
```

**Erreur: PostgreSQL connection failed**
```bash
# Vérifier que PostgreSQL est en cours d'exécution
pg_isready

# Créer la base de données si elle n'existe pas:
createdb lifehub_finance
```

**Erreur: Redis connection failed**
```bash
# Vérifier que Redis est en cours d'exécution
redis-cli ping
# Devrait répondre: PONG

# Si erreur, démarrer Redis:
redis-server
```

### L'application mobile ne se connecte pas

**Erreur: Network request failed**

1. Vérifier que le backend est en cours d'exécution
2. Sur mobile réel: Assurer que le téléphone et l'ordinateur sont sur le même WiFi
3. Mettre à jour `src/config/index.ts`:
   ```typescript
   baseURL: 'http://192.168.1.X:5000/api' // Remplacer par votre IP locale
   ```

4. Obtenir votre IP locale:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

---

## 📚 Prochaines étapes

Maintenant que tout fonctionne:

1. **Lire la documentation** : Consultez [ARCHITECTURE.md](/.artifacts/ARCHITECTURE.md)
2. **Explorer les modules** : Voir [IMPLEMENTATION_PLAN.md](/.artifacts/IMPLEMENTATION_PLAN.md)
3. **Créer votre premier module** : Suivez le guide dans l'architecture
4. **Tester l'API** : Utilisez Postman ou curl
5. **Personnaliser le design** : Modifier `src/theme/index.ts`

---

## 🆘 Besoin d'aide ?

- 📖 Documentation complète : `README.md`
- 🏗️ Architecture : `.artifacts/ARCHITECTURE.md`
- 📋 Plan d'implémentation : `.artifacts/IMPLEMENTATION_PLAN.md`
- 💬 Issues GitHub : [Créer une issue](https://github.com/your-user/lifehub/issues)

---

## 🎉 Félicitations !

Vous avez maintenant **LifeHub** opérationnel sur votre machine !

```
╔═══════════════════════════════════════════╗
║                                           ║
║   🚀 LifeHub est prêt !                   ║
║                                           ║
║   Backend:  http://localhost:5000        ║
║   Mobile:   http://localhost:8081        ║
║                                           ║
║   Happy coding! 💻                        ║
║                                           ║
╚═══════════════════════════════════════════╝
```

---

**Made with ❤️ by the LifeHub Team**
