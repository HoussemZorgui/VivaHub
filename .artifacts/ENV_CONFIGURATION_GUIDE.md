# 🔐 Configuration .env - MongoDB Atlas & Supabase PostgreSQL

## 📊 **Analyse de votre .env actuel**

### ✅ **Ce qui est déjà configuré:**

#### 1. **MongoDB Atlas** (Lignes 6-7)
```env
MONGODB_URI=mongodb+srv://houssemzorgui10:uc1EQUI5tQxoLG7O@cluster0.b8jhtwq.mongodb.net/lifehub
```
✅ **Configuré correctement** - MongoDB Atlas cloud gratuit

#### 2. **Supabase PostgreSQL** (Lignes 13-24)
```env
POSTGRES_HOST=db.lnphepfuztpraqakafkr.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=6CYCA1N0ZtZJpCX3
```
✅ **Configuré** mais il semble y avoir un problème de réseau

---

## ⚠️ **Problèmes Détectés**

### 1. **Supabase PostgreSQL** - Erreur de connexion

**Erreur:** `getaddrinfo ENOTFOUND db.lnphepfuztpraqakafkr.supabase.co`

**Causes possibles:**
- L'URL Supabase n'est peut-être pas valide ou le projet est pausé
- Problème de réseau/DNS
- Le projet Supabase doit être réactivé

### 2. **Redis** - Non configuré
Redis est en `localhost` mais pas installé. **Solution:** J'ai modifié le code pour rendre Redis optionnel ✅

---

## 🔧 **Solutions**

### **Option 1: Vérifier Supabase (Recommandé)** ⭐

#### Étape 1: Se connecter à Supabase
1. Aller sur: https://supabase.com/dashboard
2. Se connecter avec votre compte

#### Étape 2: Vérifier le projet
1. Trouver votre projet `lnphepfuztpraqakafkr`
2. Si le projet est **pausé**, le **réactiver**
3. Si le projet n'existe pas, **créer un nouveau projet** (gratuit)

#### Étape 3: Obtenir les credentials corrects
Dans le tableau de bord Supabase:

1. **Aller dans Settings** ⚙️ > **Database**
2. **Scrollez jusqu'à "Connection string"**
3. Copier la **"URI" (Session mode)**

Exemple de format:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

#### Étape 4: Mettre à jour votre .env

Remplacez les lignes 13-20 par:
```env
# ==========================================
# Database - PostgreSQL (Supabase Cloud)
# ==========================================
POSTGRES_HOST=aws-0-eu-central-1.pooler.supabase.com  # Votre host
POSTGRES_PORT=6543  # Port Supabase (notez: 6543 pas 5432 pour pooler)
POSTGRES_DB=postgres
POSTGRES_USER=postgres.[PROJECT-REF]  # Votre user complet
POSTGRES_PASSWORD=[VOTRE_MOT_DE_PASSE]  # Votre password

# URL complète
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

### **Option 2: Créer un NOUVEAU projet Supabase** 🆕

Si vous n'avez pas de projet Supabase ou voulez en créer un nouveau:

#### 1. Créer un compte Supabase
- Aller sur: https://supabase.com
- Cliquer sur **"Start your project"**
- Se connecter avec GitHub/Google

#### 2. Créer un nouveau projet
- Cliquer sur **"New Project"**
- Nom: `lifehub` (ou ce que vous voulez)
- Database Password: **Choisir un mot de passe fort** et le sauvegarder !
- Region: Choisir la plus proche (ex: `Europe West (Ireland)`)
- Cliquer sur **"Create new project"** (⏱️ prend ~2 minutes)

#### 3. Obtenir les credentials

Une fois le projet créé:

1. **Aller dans Settings** ⚙️ (icône en bas à gauche)
2. Cliquer sur **"Database"**
3. Scroll jusqu'à **"Connection string"**
4. Sélectionner **"URI"** (pas Pooling)
5. Copy la string complète

Exemple:
```
postgresql://postgres:[YOUR-PASSWORD]@db.yourproject.supabase.co:5432/postgres
```

#### 4. Parser l'URL et mettre à jour .env

De cette URL:
```
postgresql://postgres:MOT_DE_PASS@db.xyz123.supabase.co:5432/postgres
```

Extraire:
- Host: `db.xyz123.supabase.co`
- Port: `5432`
- User: `postgres`
- Password: `MOT_DE_PASS`
- Database: `postgres`

Mettre à jour votre `.env`:
```env
POSTGRES_HOST=db.xyz123.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MOT_DE_PASS

DATABASE_URL=postgresql://postgres:MOT_DE_PASS@db.xyz123.supabase.co:5432/postgres
```

---

### **Option 3: Utiliser MongoDB SEULEMENT (Temporaire)** 

Si vous voulez juste tester rapidement, vous pouvez utiliser seulement MongoDB:

#### Modifier le code pour rendre PostgreSQL optionnel aussi

Le même principe que Redis - je peux modifier le code si vous voulez.

---

## ✅ **MongoDB Atlas - Déjà OK !**

Votre MongoDB Atlas est déjà bien configuré:
```env
MONGODB_URI=mongodb+srv://houssemzorgui10:uc1EQUI5tQxoLG7O@cluster0.b8jhtwq.mongodb.net/lifehub
```

Si ça ne fonctionne pas:

### Vérifier MongoDB Atlas

1. **Se connecter**: https://cloud.mongodb.com/
2. **Aller dans Database** > **Clusters**
3. **Vérifier que le cluster est actif** (pas pausé)
4. **Network Access**: Ajouter `0.0.0.0/0` (allow from anywhere) pour tester
5. **Database Users**: Vérifier user/password

### Obtenir nouvelle connection string

1. Cliquer sur **"Connect"** sur votre cluster
2. Choisir **"Connect your application"**
3. Driver: Node.js, Version: 5.5 or later
4. Copier la connection string
5. Remplacer `<password>` par votre mot de passe

---

## 🎯 **Configuration Finale Recommandée**

Votre `.env` devrait ressembler à:

```env
# Environment
NODE_ENV=development
PORT=5000

# ==========================================
# MongoDB Atlas (Cloud - Gratuit)
# ==========================================
MONGODB_URI=mongodb+srv://[USER]:[PASSWORD]@cluster0.xxxxx.mongodb.net/lifehub?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://[USER]:[PASSWORD]@cluster0.xxxxx.mongodb.net/lifehub_test?retryWrites=true&w=majority

# ==========================================
# Supabase PostgreSQL (Cloud - Gratuit)
# ==========================================
POSTGRES_HOST=db.[PROJECT-REF].supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[VOTRE_PASSWORD]

# URL complète Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase API (optionnel)
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[VOTRE_ANON_KEY]

# ==========================================
# Redis (Optionnel - maintenant non bloquant)
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ==========================================
# JWT (Important!)
# ==========================================
JWT_SECRET=a57J0xdgQuvLBCRGJSEDEDpC35PUMeGIaULHMPaglU4=
JWT_REFRESH_SECRET=[GÉNÉRER_NOUVEAU_SECRET]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ... (reste du .env)
```

---

## 🚀 **Démarrage après configuration**

### 1. Sauvegarder .env
Après avoir mis à jour les credentials

### 2. Redémarrer le backend
Le serveur devrait se recharger automatiquement avec `tsx watch`

Si pas, relancer:
```bash
cd lifehub-backend
npm run dev
```

### 3. Vérifier
Aller sur: http://localhost:5000/health

Vous devriez voir:
```json
{
  "databases": {
    "mongodb": true,
    "postgres": true,
    "redis": false  // OK si false
  }
}
```

---

## 💡 **Conseils**

### Sécurité
- ⚠️ **NE JAMAIS commit le .env dans Git !**
- Utiliser `.env.example` comme template
- Générer des secrets forts pour JWT

### Générer un JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Tester les connexions

#### MongoDB
```bash
# Dans le terminal
mongosh "mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/lifehub"
```

#### PostgreSQL (Supabase)
```bash
psql "postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres"
```

---

## 🆘 **Besoin d'aide ?**

### Problèmes courants

**MongoDB: "Authentication failed"**
→ Vérifier user/password dans MongoDB Atlas

**Supabase: "ENOTFOUND"**
→ Vérifier que le projet existe et est actif

**"Connection timeout"**
→ Vérifier Network Access (MongoDB) ou Firewall

---

**Quelle option voulez-vous suivre ?** 🤔

- ✅ **Option 1**: Vérifier/réactiver Supabase existant
- 🆕 **Option 2**: Créer nouveau projet Supabase
- ⚡ **Option 3**: MongoDB only (temporaire)
