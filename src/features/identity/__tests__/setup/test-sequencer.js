/**
 * Custom Test Sequencer for Identity Domain Tests
 * Ensures deterministic test execution order for reliable CI/CD
 */

const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class IdentityTestSequencer extends Sequencer {
  /**
   * Sorts test files to run in a specific order
   * Order: Value Objects -> Entities -> Use Cases -> Repositories -> Integration -> E2E
   */
  sort(tests) {
    // Define the execution order based on DDD layers and dependencies
    const orderMap = {
      // Core domain objects first (no dependencies)
      'value-objects': 1,
      
      // Entities second (depend on value objects)
      'entities': 2,
      
      // Use cases third (depend on entities and value objects)
      'use-cases': 3,
      
      // Repositories fourth (interfaces for entities)
      'repositories': 4,
      
      // Application services fifth (depend on use cases and repositories)
      'services': 5,
      
      // Infrastructure sixth (implementations)
      'infrastructure': 6,
      
      // Integration tests seventh (depend on all above)
      'integration': 7,
      
      // Presentation layer eighth (depend on application layer)
      'presentation': 8,
      
      // E2E tests last (depend on everything)
      'e2e': 9,
      
      // Mocks and utilities (can run anytime)
      'mocks': 0,
      'test-utils': 0,
      'setup': 0,
    };

    // Sort tests based on the order map
    const sortedTests = tests.sort((a, b) => {
      const aPath = path.relative(process.cwd(), a.path);
      const bPath = path.relative(process.cwd(), b.path);
      
      // Extract the test type from the path
      const getTestType = (testPath) => {
        for (const [type, order] of Object.entries(orderMap)) {
          if (testPath.includes(`/${type}/`) || testPath.includes(`\\${type}\\`)) {
            return order;
          }
        }
        return 999; // Unknown test types run last
      };
      
      const aOrder = getTestType(aPath);
      const bOrder = getTestType(bPath);
      
      // Primary sort by test type order
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Secondary sort by file name (alphabetical)
      const aFileName = path.basename(a.path);
      const bFileName = path.basename(b.path);
      
      return aFileName.localeCompare(bFileName);
    });

    // Log the execution order in development
    if (process.env.NODE_ENV !== 'production' && process.env.JEST_VERBOSE === 'true') {
      console.log('\n🔄 Test Execution Order:');
      sortedTests.forEach((test, index) => {
        const relativePath = path.relative(process.cwd(), test.path);
        console.log(`${index + 1}. ${relativePath}`);
      });
      console.log('');
    }

    return sortedTests;
  }

  /**
   * Determines if tests should run in parallel
   */
  allFailedTests(tests) {
    // Run failed tests first, but maintain the order within each group
    const failedTests = tests.filter(test => this.hasFailed(test));
    const passedTests = tests.filter(test => !this.hasFailed(test));
    
    return [
      ...this.sort(failedTests),
      ...this.sort(passedTests),
    ];
  }

  /**
   * Custom logic to determine if a test has failed
   */
  hasFailed(test) {
    // Check if test failed in previous runs (Jest cache)
    const cache = this.getCacheKey(test);
    return cache && cache.failed === true;
  }

  /**
   * Generate cache key for test
   */
  getCacheKey(test) {
    try {
      const cacheFile = path.join(
        path.dirname(test.path),
        '..',
        '.jest-cache',
        `${path.basename(test.path)}.json`
      );
      
      if (require('fs').existsSync(cacheFile)) {
        return JSON.parse(require('fs').readFileSync(cacheFile, 'utf8'));
      }
    } catch (error) {
      // Ignore cache errors
    }
    
    return null;
  }
}

module.exports = IdentityTestSequencer;