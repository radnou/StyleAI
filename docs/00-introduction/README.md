# StyleAI - Documentation Éducative

## Vue d'ensemble du projet

StyleAI est une application mobile de conseil en style personnalisé, développée avec React Native et Expo. Cette documentation a été conçue comme un guide d'apprentissage complet pour comprendre les technologies modernes de développement mobile et les bonnes pratiques architecturales.

## 🎯 Objectifs d'apprentissage

À travers cette documentation et ce projet, vous apprendrez :

1. **Développement mobile moderne** avec React Native et Expo
2. **Architecture propre** avec Domain-Driven Design (DDD)
3. **Développement piloté par les tests** (TDD)
4. **Gestion d'état** avec Zustand
5. **Backend-as-a-Service** avec Firebase
6. **TypeScript** pour un code type-safe
7. **CI/CD** et bonnes pratiques DevOps

## 🏗️ Architecture du projet

```
StyleAI/
├── src/
│   ├── core/              # Utilitaires et types partagés
│   ├── features/          # Modules métier (DDD)
│   │   ├── identity/      # Authentification et utilisateurs
│   │   ├── styling/       # Conseils de style IA
│   │   ├── wardrobe/      # Gestion garde-robe
│   │   ├── billing/       # Facturation et abonnements
│   │   └── analytics/     # Analyses et métriques
│   ├── navigation/        # Navigation et routing
│   ├── shared/           # Composants et thèmes partagés
│   └── store/            # Gestion d'état globale
├── docs/                 # Documentation éducative
└── __tests__/           # Tests automatisés
```

## 🛠️ Stack technique

### Frontend
- **React Native 0.79** - Framework mobile cross-platform
- **Expo ~53.0** - Plateforme de développement
- **TypeScript 5.8** - Langage typé
- **Tamagui** - Système de design et UI
- **React Navigation 7** - Navigation native

### Backend & Services
- **Firebase 11** - Backend-as-a-Service
- **Firestore** - Base de données NoSQL
- **Firebase Auth** - Authentification
- **Google Gemini AI** - Intelligence artificielle

### État et données
- **Zustand 5** - Gestion d'état simple
- **React Hook Form** - Gestion de formulaires
- **Zod** - Validation de schémas

### Qualité et tests
- **Jest 30** - Framework de tests
- **Testing Library** - Tests d'interface
- **ESLint & Prettier** - Linting et formatage
- **Husky** - Hooks Git

## 📚 Parcours d'apprentissage recommandé

### Phase 1 : Fondations (1-2 semaines)
1. [Setup et configuration](../03-guides/setup-guide.md)
2. [Introduction à React Native](../01-technologies/react-native/README.md)
3. [Expo et développement mobile](../01-technologies/expo/README.md)
4. [TypeScript pour React Native](../01-technologies/typescript/README.md)

### Phase 2 : Architecture (2-3 semaines)
5. [Domain-Driven Design](../02-patterns/domain-driven-design/README.md)
6. [Clean Architecture](../02-patterns/clean-architecture/README.md)
7. [Gestion d'état avec Zustand](../01-technologies/zustand/README.md)
8. [Navigation et routing](../01-technologies/react-native/navigation.md)

### Phase 3 : Backend et services (2 semaines)
9. [Firebase et Backend-as-a-Service](../01-technologies/firebase/README.md)
10. [Authentification et sécurité](../04-tutorials/building-features/authentication.md)
11. [Base de données Firestore](../01-technologies/firebase/firestore.md)

### Phase 4 : Interface utilisateur (1-2 semaines)
12. [Tamagui et système de design](../01-technologies/tamagui/README.md)
13. [Thèming et responsive design](../04-tutorials/building-features/theming.md)
14. [Composants réutilisables](../04-tutorials/building-features/components.md)

### Phase 5 : Intelligence artificielle (1 semaine)
15. [Intégration Gemini AI](../01-technologies/gemini-ai/README.md)
16. [Traitement d'images et style](../04-tutorials/building-features/ai-styling.md)

### Phase 6 : Tests et qualité (1-2 semaines)
17. [Test-Driven Development](../02-patterns/test-driven-development/README.md)
18. [Tests unitaires et d'intégration](../04-tutorials/testing-strategies/unit-testing.md)
19. [Tests end-to-end](../04-tutorials/testing-strategies/e2e-testing.md)

### Phase 7 : Déploiement et production (1 semaine)
20. [Build et déploiement](../03-guides/deployment-guide.md)
21. [Performance et optimisation](../03-guides/performance-guide.md)
22. [Monitoring et analytics](../04-tutorials/building-features/analytics.md)

## 🎥 Guide vidéo de formation

Cette documentation est conçue pour être accompagnée d'une série de vidéos éducatives. Consultez le [guide de création vidéo](../03-guides/video-guide.md) pour les détails de production.

## 🤝 Comment contribuer

Cette documentation est un projet éducatif collaboratif. Pour contribuer :

1. Fork le repository
2. Créez une branche pour vos modifications
3. Ajoutez ou améliorez la documentation
4. Soumettez une Pull Request

## 📝 Conventions

- **Exemples pratiques** : Chaque concept est illustré avec du code du projet
- **Exercices interactifs** : Des défis à réaliser pour pratiquer
- **Ressources externes** : Liens vers la documentation officielle
- **Niveau de difficulté** : 🟢 Débutant | 🟡 Intermédiaire | 🔴 Avancé

## 🔗 Ressources utiles

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Prêt à commencer ?** Dirigez-vous vers le [guide de setup](../03-guides/setup-guide.md) pour installer l'environnement de développement.