# 🚀 VivaHub - The Ultimate Super App Ecosystem

VivaHub is an ultra-modern, high-performance "Super App" ecosystem built with **React Native (Expo)** for the mobile experience and **Node.js (TypeScript)** for a robust, scalable backend. It integrates multiple life-management modules into a single, unified interface.

---

## 🌟 Vision
VivaHub aims to be the central nervous system for your digital life, combining productivity, finance, health, and social features with powerful AI integration.

## 🏗️ Technical Architecture

### 📱 Frontend (Mobile)
- **Framework:** React Native with Expo (SDK 52+)
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack, Tabs)
- **State Management:** Zustand
- **UI System:** Custom Premium UI with `react-native-paper` and Micro-animations
- **Theming:** Dynamic Light/Dark mode support

### ⚙️ Backend (API)
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Databases:**
  - 🍃 **MongoDB Atlas:** For flexible document storage (User profiles, Tasks).
  - 🐘 **Supabase PostgreSQL:** For structured relational data (Finances, Transactions).
  - ⚡ **Redis:** For high-speed caching and sessions.
- **Real-time:** Socket.io for live updates.
- **Security:** JWT (Access/Refresh), MFA support, Helmet, and Rate-limiting.
- **AI Engine:** Integration with OpenAI (GPT-4) and HuggingFace.

---

## 📦 Project Structure

```text
VivaHub/
├── lifehub-mobile/    # React Native Expo Application
├── lifehub-backend/   # Node.js TypeScript API Server
├── .artifacts/        # Extensive project documentation & architecture guides
└── docker-compose.yml # Local database orchestration (Optional)
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Supabase account
- Redis (installed via brew or Docker)

### 2️⃣ Backend Setup
```bash
cd lifehub-backend
npm install
# Configure your .env (see .env.example)
npm run dev
```

### 3️⃣ Mobile Setup
```bash
cd lifehub-mobile
npm install
npx expo start
```

---

## ✨ Core Features (Roadmap)
- [x] **Core Infra:** Multi-database connection (Mongo, Postgres, Redis).
- [x] **Auth System:** Secure JWT-based authentication with Refresh tokens.
- [ ] **Task Engine:** Advanced task management with AI suggestions.
- [ ] **Wealth Manager:** Personal finance tracking with Supabase.
- [ ] **Health Hub:** Fitness and nutrition tracking.
- [ ] **Social Layer:** Community and sharing features.
- [ ] **AI Assistant:** Proactive lifestyle recommendations.

---

## 🛠️ Environment Configuration

| Service | Technology | Statut |
|---------|------------|--------|
| Database (Doc) | MongoDB Atlas | ✅ Configured |
| Database (Rel) | Supabase Postgres | ✅ Configured |
| Caching | Redis (Homebrew) | ✅ Configured |
| Server | Node/Express | ✅ Port 5001 |

---

## 📝 License
This project is licensed under the MIT License.

## 🤝 Contribution
Developed by **Houssem Zorgui**. Built for excellence.
