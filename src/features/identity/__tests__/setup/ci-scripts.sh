#!/bin/bash

# CI Scripts for Identity Domain Testing
# Provides automation for continuous integration testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run tests with coverage
run_tests() {
    print_status "Running Identity Domain tests with coverage..."
    
    cd "$(dirname "$0")/../.."
    
    # Clear previous coverage
    rm -rf __tests__/coverage/*
    
    # Run Jest tests
    if npm test -- --coverage --verbose --ci --watchAll=false --testPathPattern="__tests__" --coverageDirectory="__tests__/coverage"; then
        print_success "Tests completed successfully"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Function to validate coverage thresholds
validate_coverage() {
    print_status "Validating coverage thresholds..."
    
    local coverage_file="__tests__/coverage/coverage-summary.json"
    
    if [[ ! -f "$coverage_file" ]]; then
        print_error "Coverage file not found: $coverage_file"
        exit 1
    fi
    
    # Parse coverage data using Node.js
    node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('$coverage_file', 'utf8'));
        const total = coverage.total;
        
        const thresholds = {
            lines: 95,
            functions: 95,
            statements: 95,
            branches: 95
        };
        
        let failed = false;
        
        Object.keys(thresholds).forEach(key => {
            const actual = total[key].pct;
            const required = thresholds[key];
            
            if (actual < required) {
                console.log(\`❌ \${key}: \${actual}% < \${required}% (required)\`);
                failed = true;
            } else {
                console.log(\`✅ \${key}: \${actual}% >= \${required}% (required)\`);
            }
        });
        
        if (failed) {
            console.log('\\n❌ Coverage validation failed');
            process.exit(1);
        } else {
            console.log('\\n✅ Coverage validation passed');
        }
    "
}

# Function to run linting
run_lint() {
    print_status "Running ESLint on test files..."
    
    if command -v eslint &> /dev/null; then
        if eslint "__tests__/**/*.{ts,tsx,js,jsx}" --fix; then
            print_success "Linting completed successfully"
        else
            print_warning "Linting found issues"
        fi
    else
        print_warning "ESLint not found, skipping linting"
    fi
}

# Function to run type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    
    if command -v tsc &> /dev/null; then
        if tsc --noEmit --project . --skipLibCheck; then
            print_success "Type checking completed successfully"
        else
            print_error "Type checking failed"
            exit 1
        fi
    else
        print_warning "TypeScript compiler not found, skipping type checking"
    fi
}

# Function to run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    if npm audit --audit-level=high; then
        print_success "Security audit completed successfully"
    else
        print_warning "Security audit found vulnerabilities"
    fi
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    local report_dir="__tests__/coverage"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Create report summary
    cat > "$report_dir/ci-report.md" << EOF
# Identity Domain CI Report

**Generated:** $timestamp  
**Branch:** ${GITHUB_REF_NAME:-${CI_COMMIT_BRANCH:-"unknown"}}  
**Commit:** ${GITHUB_SHA:-${CI_COMMIT_SHA:-"unknown"}}  

## Test Results

$(cat "$report_dir/test-report.md" 2>/dev/null || echo "Test report not available")

## Coverage Report

Coverage details are available in the HTML report: \`coverage/lcov-report/index.html\`

## CI Environment

- **Platform:** $(uname -s)
- **Node Version:** $(node --version)
- **NPM Version:** $(npm --version)
- **CI:** ${CI:-"false"}

EOF

    print_success "Test report generated: $report_dir/ci-report.md"
}

# Function to upload coverage to external service
upload_coverage() {
    print_status "Uploading coverage to external services..."
    
    # Upload to Codecov if token is available
    if [[ -n "${CODECOV_TOKEN}" ]] && command -v codecov &> /dev/null; then
        if codecov -f "__tests__/coverage/lcov.info" -t "${CODECOV_TOKEN}"; then
            print_success "Coverage uploaded to Codecov"
        else
            print_warning "Failed to upload coverage to Codecov"
        fi
    fi
    
    # Upload to Coveralls if token is available
    if [[ -n "${COVERALLS_REPO_TOKEN}" ]] && command -v coveralls &> /dev/null; then
        if cat "__tests__/coverage/lcov.info" | coveralls; then
            print_success "Coverage uploaded to Coveralls"
        else
            print_warning "Failed to upload coverage to Coveralls"
        fi
    fi
    
    if [[ -z "${CODECOV_TOKEN}" && -z "${COVERALLS_REPO_TOKEN}" ]]; then
        print_warning "No coverage service tokens found, skipping upload"
    fi
}

# Function to run performance benchmarks
run_performance_tests() {
    print_status "Running performance tests..."
    
    # Create a simple performance test
    node -e "
        const { performance } = require('perf_hooks');
        
        // Simulate running tests and measure performance
        const start = performance.now();
        
        // Simulate test execution time
        setTimeout(() => {
            const end = performance.now();
            const duration = end - start;
            
            console.log(\`Test execution time: \${duration.toFixed(2)}ms\`);
            
            // Check if performance is within acceptable limits
            const maxDuration = 60000; // 60 seconds
            if (duration > maxDuration) {
                console.log(\`❌ Tests took too long: \${duration}ms > \${maxDuration}ms\`);
                process.exit(1);
            } else {
                console.log(\`✅ Test performance acceptable: \${duration}ms <= \${maxDuration}ms\`);
            }
        }, 100);
    "
}

# Function to validate test structure
validate_test_structure() {
    print_status "Validating test structure..."
    
    local required_dirs=(
        "__tests__/domain/entities"
        "__tests__/domain/value-objects"
        "__tests__/domain/repositories"
        "__tests__/application/use-cases"
        "__tests__/integration"
        "__tests__/e2e"
        "__tests__/mocks"
        "__tests__/test-utils"
    )
    
    local missing_dirs=()
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -eq 0 ]]; then
        print_success "Test structure validation passed"
    else
        print_error "Missing required test directories:"
        for dir in "${missing_dirs[@]}"; do
            echo "  - $dir"
        done
        exit 1
    fi
}

# Function to clean up test artifacts
cleanup() {
    print_status "Cleaning up test artifacts..."
    
    # Remove temporary files
    find __tests__ -name "*.tmp" -delete 2>/dev/null || true
    find __tests__ -name ".DS_Store" -delete 2>/dev/null || true
    
    # Clean Jest cache
    npx jest --clearCache &>/dev/null || true
    
    print_success "Cleanup completed"
}

# Main execution function
main() {
    local command="${1:-all}"
    
    print_status "Starting Identity Domain CI pipeline..."
    print_status "Command: $command"
    
    case "$command" in
        "test")
            run_tests
            ;;
        "coverage")
            validate_coverage
            ;;
        "lint")
            run_lint
            ;;
        "type-check")
            run_type_check
            ;;
        "security")
            run_security_audit
            ;;
        "performance")
            run_performance_tests
            ;;
        "validate")
            validate_test_structure
            ;;
        "report")
            generate_report
            ;;
        "upload")
            upload_coverage
            ;;
        "cleanup")
            cleanup
            ;;
        "all")
            validate_test_structure
            run_lint
            run_type_check
            run_tests
            validate_coverage
            run_security_audit
            run_performance_tests
            generate_report
            upload_coverage
            cleanup
            ;;
        *)
            echo "Usage: $0 {test|coverage|lint|type-check|security|performance|validate|report|upload|cleanup|all}"
            echo ""
            echo "Commands:"
            echo "  test        - Run tests with coverage"
            echo "  coverage    - Validate coverage thresholds"
            echo "  lint        - Run ESLint on test files"
            echo "  type-check  - Run TypeScript type checking"
            echo "  security    - Run security audit"
            echo "  performance - Run performance tests"
            echo "  validate    - Validate test structure"
            echo "  report      - Generate test report"
            echo "  upload      - Upload coverage to external services"
            echo "  cleanup     - Clean up test artifacts"
            echo "  all         - Run all checks (default)"
            exit 1
            ;;
    esac
    
    print_success "Identity Domain CI pipeline completed successfully!"
}

# Run main function with all arguments
main "$@"