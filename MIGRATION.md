# Migration Multi-Repos - Guide Immédiat

## Phase 1: Préparation (30min)

### 1. Backup
```bash
cp -r StyleAI StyleAI-backup
cd StyleAI
```

### 2. Analyse dépendances
```bash
# Identifier fichiers partagés
find . -name "*.ts" -o -name "*.tsx" | grep -E "(types|utils|constants)"

# Identifier API calls
grep -r "fetch\|axios" src/
```

## Phase 2: Extraction (2h)

### 1. Créer repos
```bash
# Repo mobile
mkdir ../styleai-mobile
git init ../styleai-mobile

# Repo backend  
mkdir ../styleai-backend
git init ../styleai-backend

# Repo shared
mkdir ../styleai-shared
git init ../styleai-shared
```

### 2. Extraire mobile
```bash
# Copier code mobile
cp -r src/ ../styleai-mobile/
cp package.json ../styleai-mobile/
cp app.json ../styleai-mobile/
```

### 3. Extraire backend
```bash
# Copier code backend
cp -r backend/ ../styleai-backend/src/
cp requirements.txt ../styleai-backend/
```

### 4. Extraire shared
```bash
# Copier code partagé
mkdir ../styleai-shared/src
cp -r src/types/ ../styleai-shared/src/
cp -r src/constants/ ../styleai-shared/src/
cp -r src/utils/ ../styleai-shared/src/
```

## Phase 3: Configuration (1h)

### 1. Setup shared
```bash
cd ../styleai-shared
npm init -y
# package.json:
{
  "name": "@styleai/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### 2. Setup mobile
```bash
cd ../styleai-mobile
npm install @styleai/shared@file:../styleai-shared
```

### 3. Update imports
```bash
# Remplacer dans mobile:
# import { Type } from '../shared/types'
# par:
# import { Type } from '@styleai/shared'
```

## Phase 4: Validation (30min)

### 1. Test build
```bash
cd styleai-shared && npm run build
cd styleai-mobile && npm run build
cd styleai-backend && python manage.py check
```

### 2. Frontières vérifiées
- [ ] Mobile n'importe pas backend
- [ ] Backend n'importe pas mobile
- [ ] Shared ne dépend d'aucun repo
- [ ] API calls via REST uniquement

## Règles Strictes

### Interdictions
- Import direct cross-repo
- Code dupliqué
- Dépendances circulaires
- Accès DB depuis mobile

### Obligatoire
- Versionning shared strict
- Tests isolation
- API contracts
- Type safety

## Rollback
```bash
# Si problème:
rm -rf styleai-*
cp -r StyleAI-backup StyleAI
```

**Durée totale: 4h**
**Validation: Tests + Build success**