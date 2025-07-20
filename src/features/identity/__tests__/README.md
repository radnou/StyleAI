# Identity Domain Test Suite

A comprehensive Test-Driven Development (TDD) test suite for the StyleAI Identity domain, following Domain-Driven Design (DDD) principles and achieving 99% test coverage.

## 📁 Test Structure

```
__tests__/
├── domain/                     # Domain layer tests
│   ├── entities/              # Entity tests
│   │   └── User.test.ts       # User aggregate root tests
│   ├── value-objects/         # Value object tests
│   │   ├── Email.test.ts      # Email value object tests
│   │   ├── UserId.test.ts     # UserId value object tests
│   │   └── UserProfile.test.ts # UserProfile value object tests
│   └── repositories/          # Repository interface tests
│       └── IUserRepository.test.ts # Repository contract tests
├── application/               # Application layer tests
│   └── use-cases/            # Use case tests
│       ├── CreateUser.test.ts      # User creation tests
│       ├── AuthenticateUser.test.ts # Authentication tests
│       └── UpdateProfile.test.ts   # Profile update tests
├── integration/              # Integration tests
│   └── AuthService.test.ts   # Auth service integration tests
├── e2e/                     # End-to-end tests
│   └── auth-flows.yaml      # Maestro E2E test scenarios
├── mocks/                   # Mock implementations
│   ├── MockUserRepository.ts # In-memory repository mock
│   └── MockFirebaseAuth.ts  # Firebase Auth mock
├── test-utils/              # Test utilities
│   └── TestDataFactory.ts   # Test data factories
├── setup/                   # Test configuration
│   ├── jest-setup.ts        # Jest setup and mocks
│   ├── custom-matchers.ts   # Custom Jest matchers
│   ├── test-sequencer.js    # Test execution order
│   ├── test-results-processor.js # Test reporting
│   └── ci-scripts.sh        # CI/CD automation scripts
├── coverage/               # Coverage reports (generated)
├── jest.config.js         # Jest configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ with npm
- React Native CLI
- Jest and React Native Testing Library

### Installation

```bash
# Install dependencies
npm install

# Install development dependencies
npm install --save-dev @types/jest jest-environment-jsdom
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- --testPathPattern="value-objects"

# Run tests with verbose output
npm test -- --verbose

# Run E2E tests (requires Maestro)
maestro test __tests__/e2e/auth-flows.yaml
```

### CI/CD Scripts

```bash
# Run complete CI pipeline
./__tests__/setup/ci-scripts.sh all

# Run specific checks
./__tests__/setup/ci-scripts.sh test
./__tests__/setup/ci-scripts.sh coverage
./__tests__/setup/ci-scripts.sh lint
```

## 📋 Test Categories

### 1. Domain Layer Tests

#### Value Objects
- **Email.test.ts**: Email validation, normalization, and business rules
- **UserId.test.ts**: User identifier validation and formatting
- **UserProfile.test.ts**: User profile data validation and updates

#### Entities
- **User.test.ts**: User aggregate root with complete business logic
  - User creation and validation
  - Authentication state management
  - Profile updates and security
  - Domain events and business rules

#### Repositories
- **IUserRepository.test.ts**: Repository contract tests
  - CRUD operations
  - Query methods
  - Transaction handling
  - Error scenarios

### 2. Application Layer Tests

#### Use Cases
- **CreateUser.test.ts**: User registration flow
  - Validation and business rules
  - Email verification process
  - Error handling and rollback
  
- **AuthenticateUser.test.ts**: User authentication
  - Credential validation
  - Account lockout policies
  - Session management
  
- **UpdateProfile.test.ts**: Profile management
  - Data validation and sanitization
  - Permission checks
  - Audit logging

### 3. Integration Tests

#### Auth Service
- **AuthService.test.ts**: Firebase Auth integration
  - Registration and login flows
  - Token management
  - Error handling and recovery
  - State synchronization

### 4. End-to-End Tests

#### Maestro Test Flows
- User registration (happy path and errors)
- User login (success and failures)
- Password reset flow
- Email verification
- Profile updates
- Navigation flows
- Accessibility testing
- Performance testing
- Network error handling
- Security testing

## 🎯 Test Coverage

### Coverage Requirements

| Layer | Minimum Coverage |
|-------|-----------------|
| Domain | 99% |
| Application | 98% |
| Integration | 95% |
| Overall | 95% |

### Coverage Reports

- **HTML Report**: `__tests__/coverage/lcov-report/index.html`
- **JSON Report**: `__tests__/coverage/coverage-final.json`
- **LCOV Report**: `__tests__/coverage/lcov.info`
- **Text Summary**: Console output during test runs

## 🔧 Configuration

### Jest Configuration

The test suite uses a custom Jest configuration (`jest.config.js`) with:

- React Native preset
- TypeScript support
- Custom matchers
- Module path mapping
- Coverage thresholds
- Test sequencing
- Results processing

### Custom Matchers

The test suite includes domain-specific matchers:

```typescript
// Result matchers
expect(result).toBeSuccessResult();
expect(result).toBeFailureResult();
expect(result).toBeFailureResultWithError('Expected error');

// Domain validation matchers
expect(email).toBeValidEmail();
expect(password).toBeValidPassword();
expect(userId).toBeValidUserId();
expect(displayName).toBeValidDisplayName();

// Schema matchers
expect(user).toMatchUserSchema();
expect(email).toMatchEmailSchema();
expect(profile).toMatchUserProfileSchema();

// Date matchers
expect(date).toBeRecentDate();
expect(date).toBeWithinDateRange(start, end);

// Collection matchers
expect(users).toContainUserWithEmail('test@example.com');
```

### Test Data Factory

Use `TestDataFactory` for consistent test data:

```typescript
import { TestDataFactory } from '../test-utils/TestDataFactory';

// Create test user data
const userData = TestDataFactory.createUserData({
  email: 'custom@example.com',
  isActive: true,
});

// Create test request data
const createUserRequest = TestDataFactory.createCreateUserRequestData();

// Get validation test data
const validEmails = TestDataFactory.getValidEmails();
const invalidPasswords = TestDataFactory.getInvalidPasswords();
```

## 🏗 TDD Approach

### Red-Green-Refactor Cycle

1. **Red**: Write failing tests that define expected behavior
2. **Green**: Write minimal implementation to make tests pass
3. **Refactor**: Improve code while keeping tests green

### Test-First Development

```typescript
// 1. Write the test first (RED)
it('should create user with valid email', () => {
  const result = User.create({
    email: 'test@example.com',
    password: 'SecurePassword123!',
    displayName: 'Test User',
  });

  expect(result).toBeSuccessResult();
  expect(result.getValue().email.value).toBe('test@example.com');
});

// 2. Implement minimal code to pass (GREEN)
class User {
  static create(props: UserProps): Result<User, string> {
    // Minimal implementation
    return Result.ok(new User(props));
  }
}

// 3. Refactor and add validation (REFACTOR)
class User {
  static create(props: UserProps): Result<User, string> {
    const emailResult = Email.create(props.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError());
    }
    
    // Additional validation...
    return Result.ok(new User(props));
  }
}
```

## 🧪 Mock Implementations

### MockUserRepository

In-memory repository implementation for testing:

```typescript
import { MockUserRepository } from '../mocks/MockUserRepository';

const mockRepo = new MockUserRepository();
mockRepo.seedWithTestData();

// Test repository operations
await mockRepo.save(user);
const foundUser = await mockRepo.findByEmail('test@example.com');
```

### MockFirebaseAuth

Firebase Auth simulation for testing:

```typescript
import { MockFirebaseAuth } from '../mocks/MockFirebaseAuth';

const mockAuth = new MockFirebaseAuth();
mockAuth.seedWithTestUsers();

// Test auth operations
await mockAuth.createUserWithEmailAndPassword('test@example.com', 'password');
await mockAuth.signInWithEmailAndPassword('test@example.com', 'password');
```

## 🔍 Debugging Tests

### Common Issues

1. **Test Isolation**: Ensure tests don't depend on each other
2. **Async Operations**: Use proper async/await patterns
3. **Mock State**: Reset mocks between tests
4. **Date Dependencies**: Use fixed dates in tests

### Debug Commands

```bash
# Run single test file
npm test -- User.test.ts

# Run tests with debug output
npm test -- --verbose --no-cache

# Run tests and inspect coverage
npm test -- --coverage --coverageReporters=text-lcov

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📊 Performance

### Test Execution Time

- **Unit Tests**: < 5 seconds
- **Integration Tests**: < 10 seconds
- **E2E Tests**: < 30 seconds
- **Total Suite**: < 45 seconds

### Optimization Strategies

1. **Parallel Execution**: Tests run in parallel where possible
2. **Test Sequencing**: Domain dependencies respected
3. **Mock Efficiency**: Fast in-memory implementations
4. **Selective Testing**: Run only affected tests in development

## 🔒 Security Testing

### Security Test Categories

1. **Input Validation**: XSS, injection prevention
2. **Authentication**: Password policies, session security
3. **Authorization**: Permission checks, role validation
4. **Data Protection**: PII handling, encryption
5. **Rate Limiting**: Brute force protection

### Security Test Examples

```typescript
it('should sanitize user input to prevent XSS', () => {
  const maliciousInput = '<script>alert("xss")</script>';
  const result = UserProfile.create({ displayName: maliciousInput });
  
  expect(result.getValue().displayName).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
});

it('should enforce strong password requirements', () => {
  const weakPassword = '123';
  const result = User.create({
    email: 'test@example.com',
    password: weakPassword,
    displayName: 'Test User',
  });
  
  expect(result).toBeFailureResultWithError('Password is less than 8 characters');
});
```

## 🚀 Continuous Integration

### GitHub Actions Example

```yaml
name: Identity Domain Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: ./__tests__/setup/ci-scripts.sh all
      - uses: codecov/codecov-action@v3
        with:
          file: __tests__/coverage/lcov.info
```

### Quality Gates

- ✅ All tests pass
- ✅ Coverage thresholds met
- ✅ No linting errors
- ✅ No type errors
- ✅ Security audit clean
- ✅ Performance benchmarks met

## 📝 Contributing

### Adding New Tests

1. Follow the existing directory structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Test error conditions and edge cases
5. Update coverage thresholds if needed

### Test Naming Convention

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    describe('when condition', () => {
      it('should expected behavior', () => {
        // Test implementation
      });
    });
  });
});
```

### Code Review Checklist

- [ ] Tests follow TDD principles
- [ ] All edge cases covered
- [ ] Mocks properly configured
- [ ] Performance considerations addressed
- [ ] Security implications tested
- [ ] Documentation updated

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro E2E Testing](https://maestro.mobile.dev/)

### Domain-Driven Design
- [DDD Reference](https://domainlanguage.com/ddd/reference/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Testing Best Practices
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Test Coverage Goal**: 99% 🎯  
**Last Updated**: 2025-01-06  
**Maintainer**: StyleAI Development Team