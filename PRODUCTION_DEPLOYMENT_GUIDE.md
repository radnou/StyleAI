# StyleAI Production Deployment Guide

This comprehensive guide covers the complete production deployment process for StyleAI, from initial setup to app store submission.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Security Setup](#security-setup)
5. [EAS Build Configuration](#eas-build-configuration)
6. [Monitoring and Analytics](#monitoring-and-analytics)
7. [App Store Preparation](#app-store-preparation)
8. [Deployment Process](#deployment-process)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Accounts and Services
- [x] Expo account with EAS CLI access
- [x] Firebase project (production and staging)
- [x] Apple Developer Account ($99/year)
- [x] Google Play Developer Account ($25 one-time)
- [x] Sentry account for error tracking
- [x] Gemini AI API access
- [x] GitHub account for CI/CD

### Development Environment
- [x] Node.js 18+ installed
- [x] Expo CLI latest version
- [x] EAS CLI latest version
- [x] Firebase CLI installed
- [x] Git configured
- [x] iOS Simulator (for iOS builds)
- [x] Android Studio/Emulator (for Android builds)

## Environment Setup

### 1. Install Dependencies

```bash
# Install global dependencies
npm install -g @expo/cli eas-cli firebase-tools

# Verify installations
expo --version
eas --version
firebase --version

# Install project dependencies
npm install
```

### 2. Environment Variables

Create environment files for each environment:

#### Production (.env.production)
```bash
# Copy from .env.example and fill with production values
cp .env.example .env.production

# Required production variables:
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_FIREBASE_API_KEY=your_production_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=styleai-prod
EXPO_PUBLIC_GEMINI_API_KEY=your_production_gemini_key
EXPO_PUBLIC_SENTRY_DSN=your_production_sentry_dsn
```

#### Staging (.env.staging)
```bash
cp .env.example .env.staging

# Configure staging variables with staging Firebase project
```

### 3. Secrets Management

Store sensitive data in EAS Secrets:

```bash
# Firebase configuration
eas secret:create --scope project --name FIREBASE_API_KEY --value "your_api_key"
eas secret:create --scope project --name GEMINI_API_KEY --value "your_gemini_key"
eas secret:create --scope project --name SENTRY_DSN --value "your_sentry_dsn"

# Apple/Google service keys
eas secret:create --scope project --name APPLE_TEAM_ID --value "your_team_id"
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat google-services.json)"
```

## Firebase Configuration

### 1. Create Firebase Projects

#### Production Project
```bash
# Create production project
firebase projects:create styleai-prod

# Select project
firebase use styleai-prod

# Enable required services
firebase use --add styleai-prod

# Initialize Firebase features
firebase init firestore
firebase init storage
firebase init functions
firebase init hosting
```

#### Staging Project
```bash
firebase projects:create styleai-staging
firebase use --add styleai-staging
```

### 2. Configure Firestore Security Rules

Deploy the strict security rules:

```bash
# Test rules locally first
firebase emulators:start --only firestore

# Deploy to staging
firebase use styleai-staging
firebase deploy --only firestore:rules

# Deploy to production
firebase use styleai-prod
firebase deploy --only firestore:rules
```

### 3. Configure Storage Rules

```bash
# Deploy storage rules
firebase deploy --only storage
```

### 4. Setup Firebase Functions

```bash
cd firebase/functions
npm install

# Deploy to staging first
firebase use styleai-staging
firebase deploy --only functions

# Deploy to production
firebase use styleai-prod
firebase deploy --only functions
```

## Security Setup

### 1. Firestore Security Rules Validation

Test security rules thoroughly:

```bash
# Run security rules tests
npm run test:firebase

# Test with emulator
firebase emulators:start --only firestore
```

### 2. API Key Security

- Restrict Firebase API keys to specific domains/bundle IDs
- Enable App Check for additional protection
- Set up rate limiting in Firebase Functions

### 3. Storage Security

- Configure CORS policies
- Set up proper file size limits
- Enable virus scanning (if required)

## EAS Build Configuration

### 1. Configure EAS

```bash
# Login to EAS
eas login

# Initialize EAS in project
eas build:configure

# Verify configuration
eas config --validate
```

### 2. iOS Setup

#### Apple Developer Account
1. Create App ID in Apple Developer Portal
2. Generate Distribution Certificate
3. Create Provisioning Profiles

#### EAS iOS Configuration
```bash
# Create iOS credentials
eas credentials:configure --platform ios

# Verify iOS setup
eas build:inspect --platform ios --profile production
```

### 3. Android Setup

#### Google Play Console
1. Create app in Google Play Console
2. Generate upload keystore
3. Configure app signing

#### EAS Android Configuration
```bash
# Create Android credentials
eas credentials:configure --platform android

# Verify Android setup
eas build:inspect --platform android --profile production
```

## Monitoring and Analytics

### 1. Firebase Analytics Setup

```javascript
// Configure in app initialization
import analytics from '@react-native-firebase/analytics';

await analytics().logAppOpen();
```

### 2. Crashlytics Configuration

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// Enable crashlytics
crashlytics().setCrashlyticsCollectionEnabled(true);
```

### 3. Sentry Setup

```bash
# Install Sentry
npm install @sentry/react-native

# Configure Sentry
npx @sentry/wizard -i reactNative -p ios android
```

### 4. Performance Monitoring

Configure performance alerts in monitoring/alerts.yaml

## App Store Preparation

### 1. App Assets

Create required assets using specifications in app-store/store-config.json:

#### iOS Assets
- App icons (all sizes from 20x20 to 1024x1024)
- Screenshots for iPhone 6.5", 5.5", and iPad Pro
- App Preview videos (optional)

#### Android Assets
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots for phone and tablet

### 2. App Store Connect Setup

1. Create app in App Store Connect
2. Fill in app information using app-store/metadata.json
3. Set up pricing and availability
4. Configure in-app purchases
5. Submit for review

### 3. Google Play Console Setup

1. Create app in Google Play Console
2. Upload app bundle
3. Fill in store listing
4. Configure pricing and distribution
5. Submit for review

## Deployment Process

### 1. Pre-Deployment Checklist

```bash
# Run all tests
npm run test:all

# Check code quality
npm run lint
npm run type-check

# Validate production build
npm run validate:production

# Test on staging environment
npm run deploy:staging
```

### 2. Production Build

#### iOS Production Build
```bash
# Build for iOS
eas build --platform ios --profile production --non-interactive

# Wait for build completion and download
eas build:download --platform ios --profile production
```

#### Android Production Build
```bash
# Build for Android
eas build --platform android --profile production --non-interactive

# Download AAB file
eas build:download --platform android --profile production
```

### 3. App Store Submission

#### iOS Submission
```bash
# Submit to App Store
eas submit --platform ios --profile production

# Or manual upload to App Store Connect
# Upload IPA file and submit for review
```

#### Android Submission
```bash
# Submit to Google Play
eas submit --platform android --profile production

# Or manual upload to Google Play Console
# Upload AAB file and release
```

## Post-Deployment Checklist

### 1. Monitoring Setup

- [ ] Verify analytics are working
- [ ] Check crash reporting
- [ ] Monitor error rates
- [ ] Validate performance metrics

### 2. Functionality Testing

- [ ] Test authentication flow
- [ ] Verify wardrobe features
- [ ] Test style analysis
- [ ] Check AI chat functionality
- [ ] Validate in-app purchases

### 3. Performance Validation

- [ ] Monitor app launch time
- [ ] Check API response times
- [ ] Validate image upload performance
- [ ] Monitor memory usage

### 4. Security Verification

- [ ] Test Firestore rules
- [ ] Verify Storage permissions
- [ ] Check rate limiting
- [ ] Validate data encryption

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear EAS cache
eas build:clear-cache

# Check build logs
eas build:list
eas build:view [build-id]
```

#### Certificate Issues
```bash
# Reset iOS credentials
eas credentials:configure --platform ios --clear-provisioning-profile

# Regenerate Android keystore
eas credentials:configure --platform android --clear-keystore
```

#### Firebase Issues
```bash
# Check Firebase rules
firebase firestore:rules:get

# Test with emulator
firebase emulators:start
```

### Performance Issues

#### Slow API Responses
1. Check Firebase Functions logs
2. Optimize database queries
3. Implement caching
4. Scale Firebase plan if needed

#### High Crash Rate
1. Check Crashlytics reports
2. Review Sentry error logs
3. Analyze crash patterns
4. Implement fixes and hotpatch if critical

## Rollback Procedures

### 1. App Store Rollback

#### iOS Rollback
1. Login to App Store Connect
2. Go to App Store tab
3. Click on previous version
4. Click "Restore"

#### Android Rollback
1. Login to Google Play Console
2. Go to Production track
3. Create new release with previous AAB
4. Roll out to 100%

### 2. Firebase Rollback

```bash
# Rollback Firestore rules
firebase firestore:rules:list
firebase firestore:rules:release [ruleset-id]

# Rollback functions
firebase functions:log
firebase deploy --only functions
```

### 3. Hotfix Deployment

For critical issues:

```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix

# Make minimal fixes
# Test thoroughly
npm run test:all

# Deploy hotfix
eas build --platform all --profile production
eas submit --platform all --profile production
```

## Maintenance and Updates

### 1. Regular Maintenance

- Weekly monitoring dashboard review
- Monthly security audit
- Quarterly dependency updates
- Annual certificate renewal

### 2. Update Process

1. Create feature branch
2. Implement changes
3. Test on staging
4. Deploy to production
5. Monitor for issues
6. Update version numbers

### 3. Emergency Procedures

- 24/7 monitoring alerts
- Escalation procedures
- Emergency contact list
- Incident response plan

## Support and Documentation

- Technical documentation: `/docs`
- API documentation: `https://api.styleai.com/docs`
- Support email: `support@styleai.com`
- Developer contact: `dev@styleai.com`

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Next Review:** March 2025