#!/bin/bash

# StyleAI Pre-Deployment Checklist Script
# This script validates all requirements before production deployment

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Functions for output
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_check() {
    echo -n "  ✓ Checking $1... "
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

print_pass() {
    echo -e "${GREEN}PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

print_fail() {
    echo -e "${RED}FAIL${NC}"
    echo -e "    ${RED}$1${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

print_warning() {
    echo -e "${YELLOW}WARNING${NC}"
    echo -e "    ${YELLOW}$1${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

# Check functions
check_git_status() {
    print_header "Git Repository Status"
    
    # Check if we're in a git repository
    print_check "Git repository"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        print_pass
    else
        print_fail "Not in a git repository"
        return 1
    fi
    
    # Check current branch
    print_check "Current branch"
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
        print_pass
    else
        print_warning "On branch '$current_branch' instead of main/master"
    fi
    
    # Check for uncommitted changes
    print_check "Uncommitted changes"
    if git diff-index --quiet HEAD --; then
        print_pass
    else
        print_fail "You have uncommitted changes"
    fi
    
    # Check if up to date with remote
    print_check "Remote sync status"
    git fetch > /dev/null 2>&1
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse @{u} 2>/dev/null || echo "")
    if [[ "$local_commit" == "$remote_commit" ]]; then
        print_pass
    else
        print_warning "Local branch is not in sync with remote"
    fi
}

check_dependencies() {
    print_header "Dependencies"
    
    # Check Node.js version
    print_check "Node.js version"
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node -v | cut -d'v' -f2)
        local required_version="18.0.0"
        if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" == "$required_version" ]; then
            print_pass
        else
            print_fail "Node.js version $node_version is below required $required_version"
        fi
    else
        print_fail "Node.js not installed"
    fi
    
    # Check npm
    print_check "npm"
    if command -v npm >/dev/null 2>&1; then
        print_pass
    else
        print_fail "npm not installed"
    fi
    
    # Check Expo CLI
    print_check "Expo CLI"
    if command -v expo >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Expo CLI not installed"
    fi
    
    # Check EAS CLI
    print_check "EAS CLI"
    if command -v eas >/dev/null 2>&1; then
        print_pass
    else
        print_fail "EAS CLI not installed"
    fi
    
    # Check Firebase CLI
    print_check "Firebase CLI"
    if command -v firebase >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Firebase CLI not installed"
    fi
    
    # Check package dependencies
    print_check "Package dependencies"
    if npm list >/dev/null 2>&1; then
        print_pass
    else
        print_fail "npm dependencies have issues - run 'npm install'"
    fi
}

check_environment_files() {
    print_header "Environment Configuration"
    
    # Check .env.production exists
    print_check ".env.production file"
    if [[ -f ".env.production" ]]; then
        print_pass
    else
        print_fail ".env.production file not found"
    fi
    
    # Check .env.staging exists
    print_check ".env.staging file"
    if [[ -f ".env.staging" ]]; then
        print_pass
    else
        print_fail ".env.staging file not found"
    fi
    
    # Check required environment variables in .env.production
    if [[ -f ".env.production" ]]; then
        local required_vars=(
            "EXPO_PUBLIC_ENVIRONMENT"
            "EXPO_PUBLIC_FIREBASE_API_KEY"
            "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
            "EXPO_PUBLIC_GEMINI_API_KEY"
        )
        
        for var in "${required_vars[@]}"; do
            print_check "Environment variable $var"
            if grep -q "^$var=" .env.production; then
                print_pass
            else
                print_fail "$var not found in .env.production"
            fi
        done
    fi
    
    # Check sensitive files are in .gitignore
    print_check ".gitignore configuration"
    local sensitive_patterns=(".env.production" ".env.staging" "*service-account*.json")
    local missing_patterns=()
    
    for pattern in "${sensitive_patterns[@]}"; do
        if ! grep -q "$pattern" .gitignore 2>/dev/null; then
            missing_patterns+=("$pattern")
        fi
    done
    
    if [[ ${#missing_patterns[@]} -eq 0 ]]; then
        print_pass
    else
        print_fail "Missing .gitignore patterns: ${missing_patterns[*]}"
    fi
}

check_firebase_config() {
    print_header "Firebase Configuration"
    
    # Check firebase.json exists
    print_check "firebase.json file"
    if [[ -f "firebase.json" ]]; then
        print_pass
    else
        print_fail "firebase.json not found"
    fi
    
    # Check Firestore rules
    print_check "Firestore rules file"
    if [[ -f "firebase/firestore.rules" ]]; then
        print_pass
    else
        print_fail "firebase/firestore.rules not found"
    fi
    
    # Check Storage rules
    print_check "Storage rules file"
    if [[ -f "firebase/storage.rules" ]]; then
        print_pass
    else
        print_fail "firebase/storage.rules not found"
    fi
    
    # Check Functions directory
    print_check "Firebase Functions"
    if [[ -d "firebase/functions" && -f "firebase/functions/package.json" ]]; then
        print_pass
    else
        print_fail "Firebase Functions not properly configured"
    fi
    
    # Test Firebase CLI authentication
    print_check "Firebase authentication"
    if firebase projects:list >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Firebase CLI not authenticated - run 'firebase login'"
    fi
}

check_eas_config() {
    print_header "EAS Configuration"
    
    # Check eas.json exists
    print_check "eas.json file"
    if [[ -f "eas.json" ]]; then
        print_pass
    else
        print_fail "eas.json not found"
    fi
    
    # Check EAS authentication
    print_check "EAS authentication"
    if eas whoami >/dev/null 2>&1; then
        print_pass
    else
        print_fail "EAS CLI not authenticated - run 'eas login'"
    fi
    
    # Validate eas.json
    print_check "EAS configuration validity"
    if eas config --validate >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Invalid eas.json configuration"
    fi
    
    # Check build profiles
    if [[ -f "eas.json" ]]; then
        print_check "Production build profile"
        if jq -e '.build.production' eas.json >/dev/null 2>&1; then
            print_pass
        else
            print_fail "Production build profile not found in eas.json"
        fi
        
        print_check "Staging build profile"
        if jq -e '.build.staging' eas.json >/dev/null 2>&1; then
            print_pass
        else
            print_fail "Staging build profile not found in eas.json"
        fi
    fi
}

check_app_config() {
    print_header "App Configuration"
    
    # Check app.json/app.config.js
    print_check "App configuration file"
    if [[ -f "app.json" || -f "app.config.js" ]]; then
        print_pass
    else
        print_fail "app.json or app.config.js not found"
    fi
    
    # Check bundle identifiers
    if [[ -f "app.json" ]]; then
        print_check "iOS bundle identifier"
        if jq -e '.expo.ios.bundleIdentifier' app.json >/dev/null 2>&1; then
            local bundle_id=$(jq -r '.expo.ios.bundleIdentifier' app.json)
            if [[ "$bundle_id" != "com.anonymous.StyleAI" ]]; then
                print_pass
            else
                print_fail "iOS bundle identifier still set to default"
            fi
        else
            print_fail "iOS bundle identifier not configured"
        fi
        
        print_check "Android package name"
        if jq -e '.expo.android.package' app.json >/dev/null 2>&1; then
            local package_name=$(jq -r '.expo.android.package' app.json)
            if [[ "$package_name" != "com.anonymous.StyleAI" ]]; then
                print_pass
            else
                print_fail "Android package name still set to default"
            fi
        else
            print_fail "Android package name not configured"
        fi
    fi
    
    # Check version
    print_check "App version"
    if [[ -f "app.json" ]]; then
        local app_version=$(jq -r '.expo.version // empty' app.json)
        local package_version=$(jq -r '.version // empty' package.json)
        if [[ "$app_version" == "$package_version" ]]; then
            print_pass
        else
            print_fail "App version ($app_version) doesn't match package.json version ($package_version)"
        fi
    fi
}

check_code_quality() {
    print_header "Code Quality"
    
    # Check TypeScript compilation
    print_check "TypeScript compilation"
    if npx tsc --noEmit >/dev/null 2>&1; then
        print_pass
    else
        print_fail "TypeScript compilation errors found"
    fi
    
    # Check ESLint
    print_check "ESLint checks"
    if npm run lint >/dev/null 2>&1; then
        print_pass
    else
        print_fail "ESLint errors found - run 'npm run lint:fix'"
    fi
    
    # Check Prettier formatting
    print_check "Prettier formatting"
    if npm run format:check >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Code formatting issues - run 'npm run format'"
    fi
    
    # Check for TODO/FIXME comments
    print_check "TODO/FIXME comments"
    local todo_count=$(grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | wc -l || echo 0)
    if [[ $todo_count -eq 0 ]]; then
        print_pass
    else
        print_warning "$todo_count TODO/FIXME comments found"
    fi
}

check_tests() {
    print_header "Tests"
    
    # Check unit tests
    print_check "Unit tests"
    if npm run test:unit >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Unit tests failing"
    fi
    
    # Check test coverage
    print_check "Test coverage"
    local coverage_output=$(npm run test:coverage --silent 2>/dev/null || echo "")
    if [[ $coverage_output == *"All files"* ]]; then
        local coverage_percent=$(echo "$coverage_output" | grep "All files" | awk '{print $4}' | sed 's/%//')
        if [[ $coverage_percent -ge 80 ]]; then
            print_pass
        else
            print_warning "Test coverage is $coverage_percent% (recommended: ≥80%)"
        fi
    else
        print_warning "Could not determine test coverage"
    fi
    
    # Check integration tests
    print_check "Integration tests"
    if npm run test:integration >/dev/null 2>&1; then
        print_pass
    else
        print_fail "Integration tests failing"
    fi
}

check_assets() {
    print_header "Assets"
    
    # Check app icon
    print_check "App icon"
    if [[ -f "assets/icon.png" ]]; then
        print_pass
    else
        print_fail "App icon (assets/icon.png) not found"
    fi
    
    # Check splash screen
    print_check "Splash screen"
    if [[ -f "assets/splash-icon.png" ]]; then
        print_pass
    else
        print_fail "Splash screen (assets/splash-icon.png) not found"
    fi
    
    # Check adaptive icon (Android)
    print_check "Adaptive icon"
    if [[ -f "assets/adaptive-icon.png" ]]; then
        print_pass
    else
        print_fail "Adaptive icon (assets/adaptive-icon.png) not found"
    fi
    
    # Check favicon
    print_check "Favicon"
    if [[ -f "assets/favicon.png" ]]; then
        print_pass
    else
        print_fail "Favicon (assets/favicon.png) not found"
    fi
}

check_security() {
    print_header "Security"
    
    # Check for hardcoded secrets
    print_check "Hardcoded secrets"
    local secret_patterns=("password" "secret" "key" "token" "api_key")
    local found_secrets=()
    
    for pattern in "${secret_patterns[@]}"; do
        local matches=$(grep -r -i "$pattern.*=" src/ --include="*.ts" --include="*.tsx" | grep -v "console.log" || echo "")
        if [[ -n "$matches" ]]; then
            found_secrets+=("$pattern")
        fi
    done
    
    if [[ ${#found_secrets[@]} -eq 0 ]]; then
        print_pass
    else
        print_warning "Potential hardcoded secrets found: ${found_secrets[*]}"
    fi
    
    # Check .env files are not committed
    print_check "Environment files in git"
    local committed_env=$(git ls-files | grep "\.env" || echo "")
    if [[ -z "$committed_env" ]]; then
        print_pass
    else
        print_fail "Environment files committed to git: $committed_env"
    fi
    
    # Check for vulnerable dependencies
    print_check "Vulnerable dependencies"
    if npm audit --audit-level high >/dev/null 2>&1; then
        print_pass
    else
        print_fail "High severity vulnerabilities found - run 'npm audit fix'"
    fi
}

check_documentation() {
    print_header "Documentation"
    
    # Check README
    print_check "README.md file"
    if [[ -f "README.md" ]]; then
        print_pass
    else
        print_warning "README.md not found"
    fi
    
    # Check deployment guide
    print_check "Deployment guide"
    if [[ -f "PRODUCTION_DEPLOYMENT_GUIDE.md" ]]; then
        print_pass
    else
        print_warning "PRODUCTION_DEPLOYMENT_GUIDE.md not found"
    fi
    
    # Check changelog
    print_check "CHANGELOG.md file"
    if [[ -f "CHANGELOG.md" ]]; then
        print_pass
    else
        print_warning "CHANGELOG.md not found"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}StyleAI Pre-Deployment Checklist${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    check_git_status
    check_dependencies
    check_environment_files
    check_firebase_config
    check_eas_config
    check_app_config
    check_code_quality
    check_tests
    check_assets
    check_security
    check_documentation
    
    # Summary
    echo -e "\n${BLUE}=== SUMMARY ===${NC}"
    echo -e "Total checks: $TOTAL_CHECKS"
    echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
    echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
    
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        echo -e "\n${GREEN}✓ All checks passed! Ready for deployment.${NC}"
        exit 0
    else
        echo -e "\n${RED}✗ $FAILED_CHECKS check(s) failed. Please fix issues before deployment.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"