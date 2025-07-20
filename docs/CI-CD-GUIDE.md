# StyleAI CI/CD Guide

## Overview
StyleAI uses a comprehensive CI/CD pipeline built with GitHub Actions to ensure code quality, security, and reliable deployments.

## Pipeline Architecture

### Continuous Integration (CI)
Our CI pipeline runs on every push and pull request to ensure code quality.

#### Quality Checks
- **TypeScript Compilation**: Ensures type safety
- **ESLint**: Enforces code style and best practices
- **Prettier**: Validates code formatting
- **Security Audit**: Checks for vulnerable dependencies

#### Testing Strategy
1. **Unit Tests** (Target: 100% coverage)
   - Component tests
   - Service tests
   - Utility function tests

2. **Integration Tests**
   - API integration
   - Firebase services
   - Navigation flows

3. **Performance Tests**
   - Startup time measurement
   - Memory usage tracking
   - Bundle size analysis
   - Render performance

4. **Accessibility Tests**
   - WCAG 2.1 AA compliance
   - Screen reader compatibility
   - Touch target validation

### Continuous Deployment (CD)
Automated deployment pipeline for different environments.

#### Environments
- **Development**: Automatic deployment on commits to `develop`
- **Staging**: Deployment on merges to `master`
- **Production**: Manual trigger or tag-based releases

#### Deployment Process
1. Version determination
2. Environment configuration
3. Platform-specific builds (iOS, Android, Web)
4. App store submissions
5. Release note generation

## Branch Strategy

### Git Flow
- `master`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation

### Branch Protection Rules
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Include administrators
- Restrict force pushes

## Commit Standards

### Conventional Commits
Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

### Commit Hooks
- **pre-commit**: Runs lint-staged
- **commit-msg**: Validates commit message format
- **pre-push**: Runs type checking and unit tests

## Release Process

### Semantic Versioning
We follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Workflow
1. Create release branch from `master`
2. Bump version using npm
3. Generate changelog
4. Create pull request
5. After merge, tag and release

### Automated Release
```bash
# Patch release
npm run release -- --release-as patch

# Minor release
npm run release -- --release-as minor

# Major release
npm run release -- --release-as major

# Dry run
npm run release:dry-run
```

## Security

### Code Scanning
- **CodeQL**: Semantic code analysis
- **Snyk**: Dependency vulnerability scanning
- **SAST**: Static application security testing

### Secret Management
- Use GitHub Secrets for sensitive data
- Environment-specific configurations
- Never commit secrets to the repository

### Required Secrets
- `EXPO_TOKEN`: Expo authentication
- `FIREBASE_SERVICE_ACCOUNT`: Firebase deployment
- `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID`: iOS deployment
- `GOOGLE_PLAY_KEY`: Android deployment
- `CODECOV_TOKEN`: Coverage reporting
- `SNYK_TOKEN`: Security scanning
- `SLACK_WEBHOOK`: Notifications

## Monitoring

### Build Status
- GitHub Actions dashboard
- Status badges in README
- Slack notifications

### Quality Metrics
- Code coverage reports
- Performance benchmarks
- Bundle size tracking
- Accessibility compliance

## Local Development

### Running CI Checks Locally
```bash
# Run all checks
npm run lint && npm run type-check && npm run test

# Run specific tests
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:a11y
```

### Pre-flight Checklist
Before pushing code:
1. Run type checking: `npm run type-check`
2. Fix linting issues: `npm run lint:fix`
3. Format code: `npm run format`
4. Run tests: `npm run test`
5. Check coverage: `npm run coverage:check`

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (requires 20.x)
- Clear cache: `npm run clean:install`
- Verify environment variables

#### Test Failures
- Update snapshots: `npm run test -- -u`
- Check test environment setup
- Verify mock configurations

#### Deployment Issues
- Verify credentials and secrets
- Check environment configurations
- Review deployment logs

### Getting Help
1. Check build logs in GitHub Actions
2. Review error messages and stack traces
3. Consult team documentation
4. Contact DevOps team

## Best Practices

### Code Quality
- Write meaningful commit messages
- Keep PRs focused and small
- Add tests for new features
- Update documentation

### Performance
- Monitor bundle sizes
- Profile render performance
- Optimize images and assets
- Use code splitting

### Security
- Regular dependency updates
- Security scanning on PRs
- Follow OWASP guidelines
- Implement proper authentication

## Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)