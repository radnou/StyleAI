/**
 * Test Results Processor for Identity Domain Tests
 * Processes and formats test results for reporting
 */

const fs = require('fs');
const path = require('path');

module.exports = (results) => {
  // Generate test summary
  const summary = {
    testSuites: {
      total: results.numTotalTestSuites,
      passed: results.numPassedTestSuites,
      failed: results.numFailedTestSuites,
      pending: results.numPendingTestSuites,
    },
    tests: {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      pending: results.numPendingTests,
      todo: results.numTodoTests,
    },
    snapshots: {
      total: results.snapshot.total,
      added: results.snapshot.added,
      updated: results.snapshot.updated,
      unmatched: results.snapshot.unmatched,
      matched: results.snapshot.matched,
    },
    runtime: results.testResults.reduce((acc, suite) => acc + suite.perfStats.runtime, 0),
    success: results.success,
    startTime: results.startTime,
    timestamp: new Date().toISOString(),
  };

  // Process test suites
  const processedSuites = results.testResults.map(suite => ({
    testFilePath: suite.testFilePath,
    name: path.basename(suite.testFilePath),
    status: suite.numFailingTests > 0 ? 'failed' : 'passed',
    duration: suite.perfStats.runtime,
    numTests: suite.numPassingTests + suite.numFailingTests + suite.numPendingTests,
    numPassed: suite.numPassingTests,
    numFailed: suite.numFailingTests,
    numPending: suite.numPendingTests,
    tests: suite.testResults.map(test => ({
      title: test.title,
      fullName: test.fullName,
      status: test.status,
      duration: test.duration,
      failureMessages: test.failureMessages,
      location: test.location,
    })),
    coverage: suite.coverage ? {
      lines: suite.coverage.lines,
      functions: suite.coverage.functions,
      statements: suite.coverage.statements,
      branches: suite.coverage.branches,
    } : null,
  }));

  // Calculate domain-specific metrics
  const domainMetrics = {
    valueObjects: processedSuites.filter(suite => 
      suite.testFilePath.includes('/value-objects/')
    ).length,
    entities: processedSuites.filter(suite => 
      suite.testFilePath.includes('/entities/')
    ).length,
    useCases: processedSuites.filter(suite => 
      suite.testFilePath.includes('/use-cases/')
    ).length,
    repositories: processedSuites.filter(suite => 
      suite.testFilePath.includes('/repositories/')
    ).length,
    integration: processedSuites.filter(suite => 
      suite.testFilePath.includes('/integration/')
    ).length,
  };

  // Generate detailed report
  const detailedReport = {
    summary,
    domainMetrics,
    testSuites: processedSuites,
    environment: {
      node: process.version,
      platform: process.platform,
      ci: process.env.CI === 'true',
      branch: process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || 'unknown',
      commit: process.env.GITHUB_SHA || process.env.COMMIT_SHA || 'unknown',
    },
    coverage: results.coverageMap ? {
      summary: results.coverageMap.getCoverageSummary(),
      files: Object.keys(results.coverageMap.data).map(file => ({
        path: file,
        coverage: results.coverageMap.fileCoverageFor(file).toSummary(),
      })),
    } : null,
  };

  // Write detailed report to file
  const reportPath = path.join(__dirname, '../coverage/detailed-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

  // Generate markdown report
  const markdownReport = generateMarkdownReport(detailedReport);
  const markdownPath = path.join(__dirname, '../coverage/test-report.md');
  fs.writeFileSync(markdownPath, markdownReport);

  // Generate badge data
  const badges = generateBadgeData(summary);
  const badgePath = path.join(__dirname, '../coverage/badges.json');
  fs.writeFileSync(badgePath, JSON.stringify(badges, null, 2));

  // Log summary to console
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Test Suites: ${summary.testSuites.passed}/${summary.testSuites.total} passed`);
  console.log(`✅ Tests: ${summary.tests.passed}/${summary.tests.total} passed`);
  console.log(`⏱️  Total Runtime: ${(summary.runtime / 1000).toFixed(2)}s`);
  
  if (summary.tests.failed > 0) {
    console.log(`❌ Failed Tests: ${summary.tests.failed}`);
  }
  
  if (summary.tests.pending > 0) {
    console.log(`⏳ Pending Tests: ${summary.tests.pending}`);
  }

  // Return original results for Jest
  return results;
};

function generateMarkdownReport(report) {
  const { summary, domainMetrics, testSuites } = report;
  
  let markdown = `# Identity Domain Test Report\n\n`;
  markdown += `Generated: ${report.summary.timestamp}\n\n`;
  
  // Summary section
  markdown += `## Summary\n\n`;
  markdown += `| Metric | Count | Status |\n`;
  markdown += `|--------|-------|--------|\n`;
  markdown += `| Test Suites | ${summary.testSuites.passed}/${summary.testSuites.total} | ${summary.testSuites.failed === 0 ? '✅' : '❌'} |\n`;
  markdown += `| Tests | ${summary.tests.passed}/${summary.tests.total} | ${summary.tests.failed === 0 ? '✅' : '❌'} |\n`;
  markdown += `| Runtime | ${(summary.runtime / 1000).toFixed(2)}s | ⏱️ |\n\n`;
  
  // Domain metrics
  markdown += `## Domain Coverage\n\n`;
  markdown += `| Domain Layer | Test Suites |\n`;
  markdown += `|--------------|-------------|\n`;
  markdown += `| Value Objects | ${domainMetrics.valueObjects} |\n`;
  markdown += `| Entities | ${domainMetrics.entities} |\n`;
  markdown += `| Use Cases | ${domainMetrics.useCases} |\n`;
  markdown += `| Repositories | ${domainMetrics.repositories} |\n`;
  markdown += `| Integration | ${domainMetrics.integration} |\n\n`;
  
  // Failed tests
  if (summary.tests.failed > 0) {
    markdown += `## Failed Tests\n\n`;
    testSuites.forEach(suite => {
      if (suite.status === 'failed') {
        markdown += `### ${suite.name}\n\n`;
        suite.tests.forEach(test => {
          if (test.status === 'failed') {
            markdown += `- ❌ ${test.title}\n`;
            if (test.failureMessages.length > 0) {
              markdown += `  \`\`\`\n  ${test.failureMessages[0]}\n  \`\`\`\n`;
            }
          }
        });
        markdown += `\n`;
      }
    });
  }
  
  // Coverage summary
  if (report.coverage) {
    markdown += `## Coverage Summary\n\n`;
    markdown += `| Type | Percentage |\n`;
    markdown += `|------|------------|\n`;
    markdown += `| Lines | ${report.coverage.summary.lines.pct}% |\n`;
    markdown += `| Functions | ${report.coverage.summary.functions.pct}% |\n`;
    markdown += `| Statements | ${report.coverage.summary.statements.pct}% |\n`;
    markdown += `| Branches | ${report.coverage.summary.branches.pct}% |\n\n`;
  }
  
  return markdown;
}

function generateBadgeData(summary) {
  const testsPct = Math.round((summary.tests.passed / summary.tests.total) * 100);
  const suitesPct = Math.round((summary.testSuites.passed / summary.testSuites.total) * 100);
  
  return {
    tests: {
      schemaVersion: 1,
      label: 'tests',
      message: `${summary.tests.passed}/${summary.tests.total} passed`,
      color: summary.tests.failed === 0 ? 'brightgreen' : 'red',
    },
    testSuites: {
      schemaVersion: 1,
      label: 'test suites',
      message: `${summary.testSuites.passed}/${summary.testSuites.total} passed`,
      color: summary.testSuites.failed === 0 ? 'brightgreen' : 'red',
    },
    testsPercentage: {
      schemaVersion: 1,
      label: 'tests',
      message: `${testsPct}%`,
      color: testsPct >= 95 ? 'brightgreen' : testsPct >= 80 ? 'yellow' : 'red',
    },
    runtime: {
      schemaVersion: 1,
      label: 'runtime',
      message: `${(summary.runtime / 1000).toFixed(1)}s`,
      color: summary.runtime < 30000 ? 'brightgreen' : summary.runtime < 60000 ? 'yellow' : 'red',
    },
  };
}