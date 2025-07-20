# StyleAI - Architecture Multi-Repos

## Structure

```
StyleAI/
├── styleai-mobile/     # App React Native
├── styleai-backend/    # API Django + ML
└── styleai-shared/     # Code partagé
```

## Repos

### styleai-mobile
- React Native + Expo
- UI/UX mobile
- Navigation & state management

### styleai-backend
- Django REST API
- ML models (TensorFlow/PyTorch)
- Processing pipeline

### styleai-shared
- Types TypeScript
- Constants
- Utils communs

## Frontières

### Mobile → Backend
- API REST uniquement
- Auth JWT
- Pas d'accès direct DB

### Backend → Mobile
- JSON responses
- WebSocket events
- Push notifications

### Shared
- Import only
- No runtime dependencies
- Version locked

## Commands

```bash
# Clone all
git clone --recurse-submodules git@github.com:USER/styleai-mobile.git

# Update shared
git submodule update --remote

# Deploy
./deploy.sh [mobile|backend|all]
```
