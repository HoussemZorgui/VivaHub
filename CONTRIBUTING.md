# 🤝 Guide de Contribution - LifeHub

Merci de vouloir contribuer à **LifeHub** ! Ce document vous guidera à travers le processus de contribution.

---

## 📋 Table des matières

1. [Code de conduite](#code-de-conduite)
2. [Comment contribuer](#comment-contribuer)
3. [Conventions de code](#conventions-de-code)
4. [Git workflow](#git-workflow)
5. [Tests](#tests)
6. [Documentation](#documentation)

---

## 🌟 Code de conduite

En contribuant à LifeHub, vous acceptez de:

- Être respectueux envers tous les contributeurs
- Donner et recevoir des retours constructifs
- Accepter les décisions des mainteneurs
- Aider les nouveaux contributeurs

---

## 🔧 Comment contribuer

### 1. Setup de développement

```bash
# Fork le repository
git clone https://github.com/YOUR_USERNAME/lifehub.git
cd lifehub

# Installer les dépendances
cd lifehub-backend && npm install
cd ../lifehub-mobile && npm install

# Créer une branche
git checkout -b feature/ma-nouvelle-feature
```

### 2. Types de contributions

- 🐛 **Bug fixes** - Corriger des bugs
- ✨ **Features** - Ajouter des fonctionnalités
- 📝 **Documentation** - Améliorer la documentation
- 🎨 **UI/UX** - Améliorer le design
- ⚡ **Performance** - Optimisations
- ✅ **Tests** - Ajouter des tests

---

## 📐 Conventions de code

### Backend (TypeScript/Node.js)

#### Naming
```typescript
// Classes: PascalCase
class UserController {}

// Interfaces: PascalCase avec I préfixe
interface IUser {}

// Functions/Variables: camelCase
const getUserById = () => {}
let userName = 'John';

// Constants: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';

// Files: kebab-case
user.controller.ts
auth.middleware.ts
```

#### Structure d'un module
```
modules/
└── my-module/
    ├── my-module.model.ts      # Modèle de données
    ├── my-module.controller.ts # Logique HTTP
    ├── my-module.service.ts    # Business logic
    ├── my-module.routes.ts     # Routes Express
    ├── my-module.validation.ts # Schémas Joi
    └── __tests__/              # Tests
        └── my-module.test.ts
```

#### Example de controller
```typescript
import { Request, Response } from 'express';
import { MyModuleService } from './my-module.service';

export class MyModuleController {
  private service: MyModuleService;

  constructor() {
    this.service = new MyModuleService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.findAll();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
```

### Mobile (React Native/TypeScript)

#### Naming
```typescript
// Components: PascalCase
const TaskCard = () => {}

// Hooks: camelCase avec "use" prefix
const useAuth = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Files: PascalCase pour components
TaskCard.tsx
LoginScreen.tsx

// Files: camelCase pour autres
useAuth.ts
apiService.ts
```

#### Structure d'un composant
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';

interface Props {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  // 1. Hooks
  const [state, setState] = useState(false);

  // 2. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3. Handlers
  const handlePress = () => {
    onPress?.();
  };

  // 4. Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
});
```

---

## 🌳 Git Workflow

### Branches

- `main` - Production
- `develop` - Développement
- `feature/xxx` - Nouvelles fonctionnalités
- `bugfix/xxx` - Corrections de bugs
- `hotfix/xxx` - Corrections urgentes production

### Commits

Format: `type(scope): message`

**Types:**
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage (pas de changement de code)
- `refactor` - Refactoring
- `test` - Ajout de tests
- `chore` - Tâches diverses (build, CI, etc.)

**Exemples:**
```bash
git commit -m "feat(tasks): add AI prioritization"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs(readme): update installation guide"
git commit -m "test(finance): add transaction tests"
```

### Pull Requests

1. **Créer une PR** avec un titre descriptif
2. **Décrire** les changements et la raison
3. **Lier** l'issue concernée (si applicable)
4. **Ajouter** des screenshots (pour UI)
5. **S'assurer** que les tests passent
6. **Attendre** la review

**Template de PR:**
```markdown
## Description
Brève description du changement

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Code testé
- [ ] Tests ajoutés
- [ ] Documentation mise à jour
- [ ] Pas de warnings
- [ ] Code review fait

## Screenshots (si applicable)
```

---

## ✅ Tests

### Backend

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

**Structure:**
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserController } from '../user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const userId = '123';

      // Act
      const result = await controller.getProfile(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });
  });
});
```

### Mobile

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch
```

**Structure:**
```typescript
import { render, screen } from '@testing-library/react-native';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  it('should render task title', () => {
    // Arrange
    const task = { id: '1', title: 'Test Task' };

    // Act
    render(<TaskCard task={task} />);

    // Assert
    expect(screen.getByText('Test Task')).toBeTruthy();
  });
});
```

---

## 📝 Documentation

### Code Comments

```typescript
/**
 * Calculate user's total points based on activities
 * @param userId - User identifier
 * @param activities - List of user activities
 * @returns Total points earned
 */
async function calculatePoints(
  userId: string,
  activities: Activity[]
): Promise<number> {
  // Implementation
}
```

### README pour nouveaux modules

Chaque nouveau module devrait avoir un README:

```markdown
# Module Name

## Description
Courte description du module

## Features
- Feature 1
- Feature 2

## API Endpoints
- `GET /api/xxx` - Description
- `POST /api/xxx` - Description

## Models
Description des modèles

## Usage
Exemples d'utilisation
```

---

## 🚀 Process de Review

1. **Auto-review** - Relire votre code avant de créer la PR
2. **Tests** - S'assurer que tous les tests passent
3. **Linting** - Aucune erreur de linting
4. **Documentation** - Mise à jour si nécessaire
5. **Review** - Attendre l'approbation de 1+ reviewers
6. **Merge** - Le maintainer merge après approbation

---

## 💡 Bonnes Pratiques

### General

✅ **DRY** - Don't Repeat Yourself  
✅ **KISS** - Keep It Simple, Stupid  
✅ **YAGNI** - You Aren't Gonna Need It  
✅ **SOLID** - Principes de conception

### Backend

✅ Toujours valider les entrées  
✅ Gérer les erreurs proprement  
✅ Utiliser TypeScript types  
✅ Ajouter des logs pertinents  
✅ Écrire des tests

### Mobile

✅ Utiliser les hooks React  
✅ Memoization quand nécessaire  
✅ Optimiser les rendus  
✅ Gérer les états de chargement  
✅ Accessibility (a11y)

---

## ❓ Questions ?

- 📖 Lire la [Documentation](../README.md)
- 💬 Rejoindre les [Discussions](https://github.com/your-user/lifehub/discussions)
- 🐛 Ouvrir une [Issue](https://github.com/your-user/lifehub/issues)
- 📧 Contact: dev@lifehub.app

---

## 📜 License

En contribuant à LifeHub, vous acceptez que vos contributions soient sous licence MIT.

---

**Merci pour vos contributions ! 🙏**
