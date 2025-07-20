# StyleAI Production Runbooks

This directory contains operational runbooks for managing StyleAI in production. Each runbook provides step-by-step procedures for handling specific scenarios.

## Available Runbooks

### Critical Issues
- [High Crash Rate](./high-crash-rate.md) - When crash-free sessions drop below 95%
- [High Error Rate](./high-error-rate.md) - When error rate exceeds 5%
- [Firestore Connection Issues](./firestore-connection.md) - Database connectivity problems

### Performance Issues
- [Slow API Response](./slow-api-response.md) - When API response times exceed 5 seconds
- [Memory Leaks](./memory-leaks.md) - High memory usage patterns
- [Storage Performance](./storage-performance.md) - File upload/download issues

### Security Incidents
- [Suspicious Login Activity](./suspicious-login.md) - Unusual authentication patterns
- [Rate Limit Violations](./rate-limit.md) - Excessive API usage
- [Data Breach Response](./data-breach-response.md) - Security incident procedures

### Resource Management
- [Storage Quota](./storage-quota.md) - When approaching storage limits
- [Billing Spike](./billing-spike.md) - Unexpected cost increases
- [Gemini API Quota](./gemini-quota.md) - AI API usage limits

### Business Metrics
- [User Drop](./user-drop.md) - Significant decrease in active users
- [Conversion Rate](./conversion-rate.md) - Declining premium conversions
- [Revenue Target](./revenue-target.md) - Missing revenue goals

### Operational Procedures
- [Deployment Rollback](./deployment-rollback.md) - Rolling back problematic releases
- [Database Maintenance](./database-maintenance.md) - Routine database operations
- [Certificate Renewal](./certificate-renewal.md) - SSL/TLS certificate updates

## Runbook Structure

Each runbook follows this standard format:

```markdown
# [Issue Title]

## Overview
Brief description of the issue and its impact.

## Symptoms
- Observable indicators
- Monitoring alerts
- User reports

## Immediate Actions
1. Steps to take immediately
2. Emergency measures
3. Stakeholder notifications

## Investigation Steps
1. Data to gather
2. Logs to check
3. Metrics to analyze

## Resolution Steps
1. Detailed resolution procedure
2. Verification steps
3. Monitoring to continue

## Prevention
- Long-term fixes
- Monitoring improvements
- Process changes

## Escalation
- When to escalate
- Who to contact
- What information to provide
```

## Emergency Contacts

### On-Call Rotation
- **Primary:** dev-oncall@styleai.com
- **Secondary:** dev-team@styleai.com
- **Manager:** engineering-manager@styleai.com

### External Services
- **Firebase Support:** Firebase console → Support
- **Expo Support:** expo.dev/support
- **Sentry Support:** sentry.io/support

### Service Status Pages
- **Firebase:** status.firebase.google.com
- **Expo:** status.expo.dev
- **Sentry:** status.sentry.io

## Quick Reference

### Common Commands

```bash
# Check app status
eas build:list --limit 5
firebase firestore:usage

# View logs
eas build:logs [build-id]
firebase functions:log

# Emergency deployment
eas build --platform all --profile production --non-interactive
```

### Important URLs
- **Production App:** https://styleai.com
- **Firebase Console:** https://console.firebase.google.com/project/styleai-prod
- **Sentry Dashboard:** https://sentry.io/organizations/styleai/projects/
- **Monitoring Dashboard:** [Internal monitoring URL]

## Severity Levels

### P0 - Critical
- App completely down
- Data loss/corruption
- Security breach
- Response time: Immediate

### P1 - High
- Major feature broken
- Performance degradation
- User-facing errors
- Response time: 1 hour

### P2 - Medium  
- Minor feature issues
- Non-critical performance issues
- Response time: 4 hours

### P3 - Low
- Cosmetic issues
- Enhancement requests
- Response time: Next business day

## Incident Response Process

1. **Detection**
   - Automated alerts
   - User reports
   - Monitoring dashboards

2. **Assessment**
   - Determine severity
   - Identify impact
   - Estimate timeline

3. **Response**
   - Follow appropriate runbook
   - Implement immediate fixes
   - Communicate status

4. **Resolution**
   - Apply permanent fix
   - Verify resolution
   - Update monitoring

5. **Post-Mortem**
   - Document incident
   - Identify improvements
   - Update procedures

## Training and Certification

All team members should be familiar with:
- [ ] Basic runbook procedures
- [ ] Escalation processes
- [ ] Emergency contacts
- [ ] Monitoring tools
- [ ] Deployment procedures

Regular training sessions are conducted quarterly to ensure team readiness.

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Owner:** Engineering Team