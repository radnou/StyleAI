#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob').sync;

// Accessibility rules to check
const A11Y_RULES = {
  // Images must have alt text
  imageAlt: {
    pattern: /<Image(?![^>]*accessible)/g,
    message: 'Image components must have accessible prop',
    severity: 'error',
  },
  // Touchable elements must have accessibility label
  touchableLabel: {
    pattern: /<(TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback|Pressable)(?![^>]*accessibilityLabel)/g,
    message: 'Touchable components must have accessibilityLabel',
    severity: 'error',
  },
  // Text inputs must have labels
  inputLabel: {
    pattern: /<TextInput(?![^>]*accessibilityLabel)/g,
    message: 'TextInput components must have accessibilityLabel',
    severity: 'error',
  },
  // Minimum touch target size
  touchTargetSize: {
    pattern: /style=\{[^}]*(?:width|height):\s*[0-9]+(?![0-9])/g,
    message: 'Touch targets should be at least 44x44 points',
    severity: 'warning',
    minSize: 44,
  },
  // Color contrast (simplified check)
  colorContrast: {
    pattern: /color:\s*['"]#[0-9A-Fa-f]{3,6}['"]/g,
    message: 'Ensure sufficient color contrast (WCAG AA)',
    severity: 'warning',
  },
  // Screen reader hints
  accessibilityHint: {
    pattern: /<(Button|TouchableOpacity)(?![^>]*accessibilityHint).*(?:onPress|onLongPress)/g,
    message: 'Interactive elements should have accessibilityHint for complex actions',
    severity: 'info',
  },
  // Heading structure
  headingStructure: {
    pattern: /<Text(?![^>]*accessibilityRole=['"]header['"])[^>]*style=[^>]*fontSize:\s*[2-9][0-9]/g,
    message: 'Large text should be marked as header with accessibilityRole',
    severity: 'warning',
  },
};

async function checkFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');
  
  for (const [ruleName, rule] of Object.entries(A11Y_RULES)) {
    const matches = content.matchAll(rule.pattern);
    
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];
      
      // Special handling for touch target size
      if (ruleName === 'touchTargetSize') {
        const sizeMatch = match[0].match(/[0-9]+/);
        if (sizeMatch && parseInt(sizeMatch[0]) < rule.minSize) {
          issues.push({
            rule: ruleName,
            file: filePath,
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index),
            message: rule.message,
            severity: rule.severity,
            snippet: line.trim(),
          });
        }
      } else {
        issues.push({
          rule: ruleName,
          file: filePath,
          line: lineNumber,
          column: match.index - content.lastIndexOf('\n', match.index),
          message: rule.message,
          severity: rule.severity,
          snippet: line.trim(),
        });
      }
    }
  }
  
  return issues;
}

async function runAccessibilityTests() {
  console.log('🎯 StyleAI Accessibility Test Suite\n');
  
  // Find all TSX files
  const files = glob('src/**/*.tsx', {
    ignore: ['**/__tests__/**', '**/node_modules/**'],
  });
  
  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const allIssues = [];
  
  for (const file of files) {
    const issues = await checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
      totalIssues += issues.length;
      
      issues.forEach(issue => {
        switch (issue.severity) {
          case 'error':
            errorCount++;
            break;
          case 'warning':
            warningCount++;
            break;
          case 'info':
            infoCount++;
            break;
        }
      });
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesScanned: files.length,
      totalIssues,
      errors: errorCount,
      warnings: warningCount,
      info: infoCount,
    },
    issues: allIssues,
    passed: errorCount === 0,
  };
  
  // Save report
  const reportPath = path.join(process.cwd(), 'accessibility-results', `report-${Date.now()}.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('📊 Accessibility Test Results:');
  console.log('==============================');
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(`  🔴 Errors: ${errorCount}`);
  console.log(`  🟡 Warnings: ${warningCount}`);
  console.log(`  🔵 Info: ${infoCount}`);
  
  if (allIssues.length > 0) {
    console.log('\n📋 Issues by severity:\n');
    
    // Group by severity
    const grouped = allIssues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});
    
    for (const [severity, issues] of Object.entries(grouped)) {
      console.log(`${severity.toUpperCase()}:`);
      issues.slice(0, 5).forEach(issue => {
        console.log(`  ${issue.file}:${issue.line}`);
        console.log(`    ${issue.message}`);
        console.log(`    > ${issue.snippet}\n`);
      });
      
      if (issues.length > 5) {
        console.log(`  ... and ${issues.length - 5} more ${severity} issues\n`);
      }
    }
  }
  
  if (errorCount > 0) {
    console.log('\n❌ Accessibility test failed! Fix errors before proceeding.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️  Accessibility test passed with warnings.');
  } else {
    console.log('\n✅ All accessibility tests passed!');
  }
}

async function generateA11yReport() {
  const report = {
    guidelines: 'WCAG 2.1 AA',
    components: {
      compliant: [],
      needsWork: [],
      violations: [],
    },
    recommendations: [
      'Ensure all images have descriptive alt text',
      'Provide clear labels for all form inputs',
      'Maintain a 4.5:1 color contrast ratio for normal text',
      'Ensure touch targets are at least 44x44 points',
      'Use semantic markup and ARIA roles appropriately',
      'Test with screen readers (VoiceOver, TalkBack)',
    ],
  };
  
  const reportPath = path.join(process.cwd(), 'docs', 'accessibility-guidelines.md');
  const content = `# StyleAI Accessibility Guidelines

## Overview
This document outlines the accessibility standards and guidelines for the StyleAI application.

## WCAG 2.1 Compliance
We aim to meet WCAG 2.1 Level AA standards.

## Key Requirements

### Images
- All images must have descriptive alternative text
- Decorative images should be marked with \`accessible={false}\`

### Interactive Elements
- All touchable elements must have \`accessibilityLabel\`
- Complex actions should include \`accessibilityHint\`
- Touch targets must be at least 44x44 points

### Forms
- All inputs must have associated labels
- Error messages must be announced to screen readers
- Form validation must be accessible

### Navigation
- Screen titles must be announced
- Focus management for modal and drawer navigation
- Logical tab order

### Colors and Contrast
- Text must have a contrast ratio of at least 4.5:1
- Large text (18pt+) must have at least 3:1 contrast
- Don't rely on color alone to convey information

## Testing

### Automated Testing
Run accessibility tests with:
\`\`\`bash
npm run test:a11y
\`\`\`

### Manual Testing
1. Enable screen reader (VoiceOver/TalkBack)
2. Navigate through the app using gestures
3. Verify all content is accessible
4. Test with keyboard navigation (iPad)

## Resources
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
`;
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, content);
  
  return report;
}

if (require.main === module) {
  runAccessibilityTests().catch(console.error);
}

module.exports = {
  checkFile,
  runAccessibilityTests,
  generateA11yReport,
  A11Y_RULES,
};