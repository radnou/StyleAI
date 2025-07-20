#!/bin/bash

# StyleAI Production Deployment Script
# This script automates the production deployment process with safety checks

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOYMENT_LOG="deployment_${TIMESTAMP}.log"

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

# Function to log commands
log_and_run() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Running: $*" >> "$DEPLOYMENT_LOG"
    "$@" 2>&1 | tee -a "$DEPLOYMENT_LOG"
    local exit_code=${PIPESTATUS[0]}
    if [ $exit_code -ne 0 ]; then
        print_error "Command failed with exit code $exit_code: $*"
        exit $exit_code
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check required tools
    local tools=("node" "npm" "expo" "eas" "firebase" "git")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node -v | cut -d'v' -f2)
    local required_version="18.0.0"
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_error "Node.js version $node_version is below required version $required_version"
        exit 1
    fi
    
    # Check if we're on the main branch
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "You are not on the main branch (current: $current_branch)"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run tests
run_tests() {
    print_status "Running test suite..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_and_run npm ci
    
    # Run linting
    print_status "Running linter..."
    log_and_run npm run lint
    
    # Run type checking
    print_status "Running type check..."
    log_and_run npm run type-check
    
    # Run unit tests
    print_status "Running unit tests..."
    log_and_run npm run test:unit
    
    # Run integration tests
    print_status "Running integration tests..."
    log_and_run npm run test:integration
    
    # Run performance tests
    print_status "Running performance tests..."
    log_and_run npm run test:performance
    
    # Validate production build
    print_status "Validating production build..."
    log_and_run npm run validate:production
    
    print_success "All tests passed"
}

# Function to build the app
build_app() {
    local platform=$1
    print_status "Building for $platform..."
    
    # Clear EAS cache
    log_and_run eas build:clear-cache
    
    # Build the app
    log_and_run eas build --platform "$platform" --profile production --non-interactive
    
    print_success "$platform build completed"
}

# Function to submit to app stores
submit_app() {
    local platform=$1
    print_status "Submitting $platform to app store..."
    
    log_and_run eas submit --platform "$platform" --profile production --non-interactive
    
    print_success "$platform submitted to app store"
}

# Function to deploy Firebase functions and rules
deploy_firebase() {
    print_status "Deploying Firebase configuration..."
    
    # Switch to production project
    log_and_run firebase use styleai-prod
    
    # Deploy Firestore rules
    print_status "Deploying Firestore rules..."
    log_and_run firebase deploy --only firestore:rules
    
    # Deploy Storage rules
    print_status "Deploying Storage rules..."
    log_and_run firebase deploy --only storage
    
    # Deploy Functions
    print_status "Deploying Firebase Functions..."
    cd "$PROJECT_ROOT/firebase/functions"
    log_and_run npm ci
    cd "$PROJECT_ROOT"
    log_and_run firebase deploy --only functions
    
    print_success "Firebase deployment completed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check Firebase services
    print_status "Checking Firebase services..."
    log_and_run firebase firestore:usage
    
    # Check build status
    print_status "Checking build status..."
    log_and_run eas build:list --limit 5
    
    # Run smoke tests
    print_status "Running smoke tests..."
    log_and_run npm run test:smoke
    
    print_success "Deployment verification completed"
}

# Function to send notifications
send_notifications() {
    local status=$1
    local message=$2
    
    print_status "Sending deployment notifications..."
    
    # Slack notification (if webhook configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"StyleAI Production Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Email notification could be added here
    
    print_success "Notifications sent"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Archive deployment log
    local log_dir="$PROJECT_ROOT/deployment-logs"
    mkdir -p "$log_dir"
    mv "$DEPLOYMENT_LOG" "$log_dir/"
    
    print_success "Cleanup completed"
}

# Function to handle errors
error_handler() {
    local exit_code=$?
    print_error "Deployment failed with exit code $exit_code"
    
    # Send failure notification
    send_notifications "FAILED" "Exit code: $exit_code"
    
    # Archive log for debugging
    cleanup
    
    exit $exit_code
}

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --platform PLATFORM    Build for specific platform (ios|android|all)"
    echo "  -s, --skip-tests           Skip test execution"
    echo "  -f, --firebase-only        Deploy only Firebase (no app build)"
    echo "  -b, --build-only           Build only (no submission)"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                         Full deployment (iOS + Android)"
    echo "  $0 -p ios                  Deploy iOS only"
    echo "  $0 -s                      Skip tests and deploy"
    echo "  $0 -f                      Deploy Firebase only"
    echo "  $0 -b                      Build only (no submission)"
}

# Main function
main() {
    local platform="all"
    local skip_tests=false
    local firebase_only=false
    local build_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--platform)
                platform="$2"
                shift 2
                ;;
            -s|--skip-tests)
                skip_tests=true
                shift
                ;;
            -f|--firebase-only)
                firebase_only=true
                shift
                ;;
            -b|--build-only)
                build_only=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate platform
    if [[ "$platform" != "ios" && "$platform" != "android" && "$platform" != "all" ]]; then
        print_error "Invalid platform: $platform. Must be ios, android, or all"
        exit 1
    fi
    
    # Set up error handling
    trap error_handler ERR
    
    print_status "Starting StyleAI production deployment..."
    print_status "Platform: $platform"
    print_status "Skip tests: $skip_tests"
    print_status "Firebase only: $firebase_only"
    print_status "Build only: $build_only"
    print_status "Timestamp: $TIMESTAMP"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests (unless skipped)
    if [ "$skip_tests" = false ]; then
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    # Deploy Firebase (unless build-only)
    if [ "$firebase_only" = true ] || [ "$build_only" = false ]; then
        deploy_firebase
    fi
    
    # Build and submit app (unless firebase-only)
    if [ "$firebase_only" = false ]; then
        if [ "$platform" = "all" ] || [ "$platform" = "ios" ]; then
            build_app "ios"
            if [ "$build_only" = false ]; then
                submit_app "ios"
            fi
        fi
        
        if [ "$platform" = "all" ] || [ "$platform" = "android" ]; then
            build_app "android"
            if [ "$build_only" = false ]; then
                submit_app "android"
            fi
        fi
    fi
    
    # Verify deployment
    verify_deployment
    
    # Send success notification
    send_notifications "SUCCESS" "Platform: $platform"
    
    # Cleanup
    cleanup
    
    print_success "StyleAI production deployment completed successfully!"
    print_status "Deployment log saved to: deployment-logs/$DEPLOYMENT_LOG"
}

# Run main function with all arguments
main "$@"