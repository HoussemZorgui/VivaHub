# 🚀 Guide de Démarrage Simplifié - LifeHub

## ⚠️ Situation Actuelle

Votre backend ne peut pas démarrer car **MongoDB, PostgreSQL et Redis ne sont pas installés** sur votre Mac.

---

## 🎯 **3 Options pour Démarrer**

### **Option 1 : Installation Rapide avec Homebrew (Recommandé pour Mac)** ⭐

C'est la méthode la plus simple pour installer les bases de données sur Mac.

#### 1. Installer Homebrew (si pas déjà installé)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Installer les bases de données

```bash
# MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# PostgreSQL
brew install postgresql@15

# Redis
brew install redis
```

#### 3. Démarrer les services

```bash
# Démarrer MongoDB
brew services start mongodb-community@7.0

# Démarrer PostgreSQL
brew services start postgresql@15

# Démarrer Redis
brew services start redis
```

#### 4. Créer la base de données PostgreSQL

```bash
createdb lifehub_finance
```

#### 5. Démarrer le Backend

```bash
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-backend
npm run dev
```

#### 6. Démarrer le Mobile (dans un nouveau terminal)

```bash
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-mobile
npm install  # Si pas déjà fait
npx expo start
```

---

### **Option 2 : Installer Docker Desktop (Plus isolé)** 🐳

#### 1. Télécharger Docker Desktop

Aller sur : https://www.docker.com/products/docker-desktop/

#### 2. Installer et lancer Docker Desktop

#### 3. Démarrer les bases de données

```bash
cd /Users/houssem_zorgui/Desktop/reactnative
docker-compose up -d
```

#### 4. Vérifier que les conteneurs sont lancés

```bash
docker ps
```

Vous devriez voir 3 conteneurs : lifehub-mongodb, lifehub-postgres, lifehub-redis

#### 5. Démarrer Backend et Mobile

```bash
# Terminal 1 - Backend
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-backend
npm run dev

# Terminal 2 - Mobile
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-mobile
npm install  # Si pas déjà fait
npx expo start
```

---

### **Option 3 : Développement Frontend Only (Pour tester le mobile)** 📱

Si vous voulez juste tester l'interface mobile sans backend :

#### 1. Modifier temporairement le code mobile

Ouvrir `lifehub-mobile/App.tsx` et commenter la partie auth :

```typescript
// Commentez temporairement pour tester sans backend
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <LoginScreen navigation={{}} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

#### 2. Démarrer le mobile

```bash
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-mobile
npm install  # Si pas déjà fait
npx expo start
```

#### 3. Scanner le QR code

- Sur iPhone : Ouvrir l'appareil photo et scanner le QR
- Sur Android : Installer "Expo Go" et scanner le QR

---

## ✅ **Vérification que tout fonctionne**

### Backend

Ouvrir dans votre navigateur :
```
http://localhost:5000/health
```

Vous devriez voir :
```json
{
  "success": true,
  "message": "LifeHub API is running",
  "databases": {
    "mongodb": true,
    "postgres": true,
    "redis": true
  }
}
```

### Mobile

L'application devrait afficher l'écran de connexion avec :
- Logo "LifeHub"
- Champs email et password
- Bouton "Login"
- Boutons social login

---

## 🆘 **Quelle option choisir ?**

| Option | Avantages | Inconvénients | Recommandé pour |
|--------|-----------|---------------|-----------------|
| **Homebrew** | ✅ Rapide<br>✅ Facile<br>✅ Services auto-start | ⚠️ Installé sur votre Mac | Développement quotidien |
| **Docker** | ✅ Isolé<br>✅ Facile à nettoyer<br>✅ Identique partout | ⚠️ Nécessite Docker Desktop (~500MB) | Production-like |
| **Frontend Only** | ✅ Aucune dépendance<br>✅ Test UI rapide | ❌ Pas de backend | Test interface seulement |

---

## 💡 **Ma Recommandation**

Pour commencer rapidement, je recommande **Option 1 (Homebrew)** :

1. Installer Homebrew (1 commande)
2. Installer MongoDB + PostgreSQL + Redis (3 commandes)
3. Démarrer les services (3 commandes)
4. Lancer backend et mobile

**Temps total : ~10 minutes** ⏱️

---

## 📞 **Besoin d'aide ?**

### Homebrew est déjà installé ?

Vérifier :
```bash
brew --version
```

### Les bases de données sont déjà installées ?

Vérifier :
```bash
mongosh --version
psql --version
redis-cli --version
```

### Vérifier si les services tournent

```bash
# MongoDB
brew services list | grep mongodb

# PostgreSQL
brew services list | grep postgresql

# Redis
brew services list | grep redis
```

---

## 🎯 **Commandes Résumées (Option Homebrew)**

```bash
# 1. Installer les DBs (une seule fois)
brew tap mongodb/brew
brew install mongodb-community@7.0 postgresql@15 redis

# 2. Démarrer les services (à chaque démarrage ou les mettre en auto-start)
brew services start mongodb-community@7.0
brew services start postgresql@15
brew services start redis

# 3. Créer la DB finance (une seule fois)
createdb lifehub_finance

# 4. Backend (Terminal 1)
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-backend
npm run dev

# 5. Mobile (Terminal 2)
cd /Users/houssem_zorgui/Desktop/reactnative/lifehub-mobile
npm install
npx expo start
```

---

**Quelle option souhaitez-vous utiliser ?** 🤔
