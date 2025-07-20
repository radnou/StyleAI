# High Crash Rate Runbook

## Overview
This runbook addresses situations where the app's crash-free session rate drops below 95%, indicating a significant stability issue affecting user experience.

## Symptoms
- Crash-free sessions < 95% (monitoring alert)
- Increased user complaints about app crashes
- Spike in crash reports in Firebase Crashlytics/Sentry
- App store reviews mentioning crashes

## Immediate Actions

### 1. Assess Impact (5 minutes)
```bash
# Check current crash rate
firebase crashlytics:metrics --project styleai-prod

# Check affected versions
# Login to Firebase Console → Crashlytics → Crashes tab
```

### 2. Identify Crash Patterns (10 minutes)
- Check Crashlytics dashboard for crash clusters
- Identify most common crash signatures
- Determine if crashes are device/OS specific
- Check if related to recent deployment

### 3. Stakeholder Notification (Immediate)
```
Subject: [P1] High Crash Rate Detected - StyleAI Production

Current crash-free sessions: X%
Threshold: 95%
Time detected: [timestamp]
Affected users: [estimate]
Investigation in progress.

Engineering Team
```

## Investigation Steps

### 1. Crashlytics Analysis
```bash
# Export crash data
firebase crashlytics:symbols:upload --app [APP_ID]

# Check recent crashes
firebase crashlytics:crashes --project styleai-prod --limit 20
```

### 2. Sentry Analysis
- Review error trends in Sentry dashboard
- Check for new error types introduced recently
- Analyze crash breadcrumbs for context

### 3. Device/OS Analysis
- Check if crashes are specific to:
  - iOS vs Android
  - Specific OS versions
  - Specific device models
  - App version

### 4. Code Analysis
```bash
# Check recent deployments
git log --oneline --since="24 hours ago"

# Review recent code changes
git diff HEAD~5 HEAD

# Check for memory leaks or resource issues
grep -r "malloc\|alloc\|memory" src/
```

## Resolution Steps

### 1. Quick Fixes (if applicable)

#### Memory-related crashes:
```javascript
// Check for memory leaks in components
useEffect(() => {
  return () => {
    // Cleanup subscriptions, timers, etc.
  };
}, []);
```

#### Native module crashes:
```bash
# Rebuild native modules
cd ios && pod install && cd ..
npx react-native run-ios --reset-cache
```

### 2. Hotfix Deployment

If critical crash affecting >10% of users:

```bash
# Create hotfix branch
git checkout -b hotfix/crash-fix-[timestamp]

# Apply minimal fix
# Test thoroughly on staging
npm run test:all

# Build and deploy hotfix
eas build --platform all --profile production --non-interactive
eas submit --platform all --profile production
```

### 3. Gradual Rollout Strategy

For non-critical fixes:
```bash
# Deploy to 10% of users first
eas build --platform all --profile production
# Monitor for 2 hours
# If stable, increase to 50%, then 100%
```

### 4. App Store Emergency Updates

For severe crashes:
- Submit expedited review request to Apple
- Use staged rollout on Google Play
- Consider pulling app if necessary

## Prevention

### 1. Enhanced Testing
```bash
# Add crash detection tests
npm run test:crash-scenarios

# Memory leak detection
npm run test:memory-leaks

# Device-specific testing
npm run test:devices
```

### 2. Monitoring Improvements
```yaml
# monitoring/alerts.yaml
- alert: CrashRateIncrease
  expr: firebase_crashlytics_crash_free_sessions < 98
  for: 2m
  labels:
    severity: warning
```

### 3. Code Quality Gates
```bash
# Pre-deployment checks
npm run lint:strict
npm run test:coverage -- --threshold 95
npm run test:performance
```

### 4. Staged Deployment Process
- Always deploy to staging first
- Use canary deployments for production
- Monitor crash rates for 24 hours before full rollout

## Escalation

### When to Escalate
- Crash rate < 90% for more than 30 minutes
- No clear fix identified within 2 hours
- Crashes causing data loss or security issues
- Media attention or viral social media posts

### Escalation Contacts
- **Engineering Manager:** engineering-manager@styleai.com
- **CTO:** cto@styleai.com
- **CEO:** ceo@styleai.com (for critical business impact)

### External Escalation
- **Firebase Support:** Critical priority ticket
- **Expo Support:** Enterprise support channel
- **Apple/Google:** Emergency contact for app store issues

## Communication Templates

### Status Update Template
```
Subject: [Update] High Crash Rate - StyleAI Production

Current Status: [Investigating/Fix Deployed/Resolved]
Crash-free sessions: X%
Time to resolution: [estimate]
Actions taken:
- [Action 1]
- [Action 2]

Next update in 30 minutes.
```

### Resolution Communication
```
Subject: [Resolved] High Crash Rate - StyleAI Production

Issue resolved at: [timestamp]
Root cause: [brief description]
Fix applied: [description]
Current crash-free sessions: X%

Post-mortem scheduled for: [date/time]
```

## Post-Incident Actions

### 1. Monitoring Period
- Monitor crash rates for 48 hours post-fix
- Watch for regression or new crash patterns
- Collect user feedback

### 2. Post-Mortem
Schedule within 24 hours:
- Timeline of events
- Root cause analysis  
- Prevention measures
- Process improvements

### 3. Documentation Updates
- Update this runbook based on learnings
- Improve monitoring and alerting
- Enhance testing procedures

## Tools and Resources

### Monitoring Dashboards
- Firebase Crashlytics: [console link]
- Sentry Dashboard: [dashboard link]
- Custom monitoring: [internal dashboard]

### Documentation
- [Crash Analysis Best Practices](../docs/crash-analysis.md)
- [Performance Optimization Guide](../docs/performance.md)
- [Testing Strategies](../docs/testing.md)

### Code Quality Tools
```bash
# Static analysis
npm run lint:security
npm run analyze:bundle
npm run check:vulnerabilities
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Owner:** Engineering Team  
**Review Date:** March 2025