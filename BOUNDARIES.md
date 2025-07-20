# Règles Frontières Multi-Repos

## Architecture Stricte

```
┌─────────────┐    HTTP/WS    ┌─────────────┐
│   Mobile    │ ←----------→  │   Backend   │
│             │               │             │
└─────────────┘               └─────────────┘
       │                              │
       │ import                 import │
       ▼                              ▼
┌─────────────────────────────────────────────┐
│              Shared                         │
└─────────────────────────────────────────────┘
```

## Frontières par Repo

### styleai-mobile
```typescript
// ✅ AUTORISÉ
import { UserType } from '@styleai/shared';
const response = await fetch('/api/users');

// ❌ INTERDIT
import { dbQuery } from '../backend/utils';
import database from 'backend-lib';
```

### styleai-backend
```python
# ✅ AUTORISÉ
from shared.types import UserModel
return JsonResponse(data)

# ❌ INTERDIT
from mobile.components import Button
import mobile_navigation
```

### styleai-shared
```typescript
// ✅ AUTORISÉ
export interface ApiResponse<T> {
  data: T;
  status: number;
}

// ❌ INTERDIT
import { useState } from 'react';
import { Model } from 'django';
```

## Communication Rules

### Mobile → Backend
- REST API uniquement
- JWT auth required
- Rate limiting
- Schema validation

### Backend → Mobile
- JSON responses
- WebSocket events
- Error codes standardisés
- No direct calls

### Shared Dependencies
- Pure TypeScript types
- Constants only
- No runtime logic
- No external deps

## Validation Automatique

### Pre-commit Hooks
```bash
#!/bin/bash
# Check imports
if grep -r "import.*backend" styleai-mobile/; then
  echo "❌ Mobile importing backend"
  exit 1
fi

if grep -r "import.*mobile" styleai-backend/; then
  echo "❌ Backend importing mobile"
  exit 1
fi

echo "✅ Boundaries respected"
```

### CI Checks
```yaml
name: Boundary Check
on: [push, pull_request]
jobs:
  boundaries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check cross-repo imports
        run: ./scripts/check-boundaries.sh
```

## Violations = Bloquantes

### Niveau 1: Import direct
```typescript
// ❌ CRITIQUE - Build fail
import { something } from '../backend/file';
```

### Niveau 2: Logic sharing
```typescript
// ❌ MAJEUR - Code review fail
// Duplicated business logic
```

### Niveau 3: Coupling
```typescript
// ❌ MINEUR - Warning
// Tight coupling via shared state
```

## Exceptions = Aucune

Toute violation bloque:
- Merge request
- Deployment
- Release

**Zero tolerance policy**