#!/bin/bash

# ===========================================
# Cyphertrade App - Docker Setup Script
# ===========================================
# One-click setup for React development environment
# Compatible with: macOS, Linux, Windows (Git Bash)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)    OS="macos" ;;
        Linux*)     OS="linux" ;;
        MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
        *)          OS="unknown" ;;
    esac
    print_msg "Detected OS: $OS" "$GREEN"
}

# Check if Docker or Podman is available
check_container_runtime() {
    if command -v podman &> /dev/null; then
        CONTAINER_RUNTIME="podman"
        COMPOSE_CMD="podman-compose"
    elif command -v docker &> /dev/null; then
        CONTAINER_RUNTIME="docker"
        COMPOSE_CMD="docker-compose"
        if docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
        fi
    else
        print_msg "Error: Neither Docker nor Podman found. Please install one of them." "$RED"
        exit 1
    fi
    print_msg "Using container runtime: $CONTAINER_RUNTIME" "$GREEN"
    print_msg "Using compose command: $COMPOSE_CMD" "$GREEN"
}

# Check if API is accessible
check_api() {
    print_msg "Checking API availability..." "$YELLOW"
    
    local api_url="${VITE_API_URL:-http://localhost:8000/api/v1}"
    
    if curl -s --head "$api_url/health" | head -n 1 | grep -q "200\|404"; then
        print_msg "API is accessible at $api_url" "$GREEN"
        return 0
    fi
    
    print_msg "Warning: API not accessible at $api_url" "$YELLOW"
    print_msg "Make sure cyphertrade-api is running." "$YELLOW"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f ".env.docker" ]; then
        print_msg "Creating .env.docker from template..." "$YELLOW"
        cp .env.docker.example .env.docker
        print_msg "Created .env.docker - customize if needed" "$GREEN"
    else
        print_msg ".env.docker already exists, skipping..." "$YELLOW"
    fi
    
    # Create .env for Vite if it doesn't exist
    if [ ! -f ".env" ]; then
        print_msg "Creating .env for Vite..." "$YELLOW"
        echo "VITE_API_URL=${VITE_API_URL:-http://localhost:8000/api/v1}" > .env
        echo "VITE_WS_URL=${VITE_WS_URL:-ws://localhost:8082}" >> .env
        print_msg "Created .env" "$GREEN"
    fi
}

# Load environment variables
load_env() {
    if [ -f ".env.docker" ]; then
        export $(cat .env.docker | grep -v '^#' | xargs)
    fi
}

# Build containers
build_containers() {
    print_header "Building Docker Containers"
    
    if [ "$1" == "dev" ]; then
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml build
    else
        $COMPOSE_CMD build
    fi
    
    print_msg "Build completed!" "$GREEN"
}

# Start containers
start_containers() {
    print_header "Starting Containers"
    
    if [ "$1" == "dev" ]; then
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        $COMPOSE_CMD up -d
    fi
    
    print_msg "Containers started!" "$GREEN"
}

# Stop containers
stop_containers() {
    print_header "Stopping Containers"
    
    if [ "$1" == "dev" ]; then
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml down
    else
        $COMPOSE_CMD down
    fi
    
    print_msg "Containers stopped!" "$GREEN"
}

# Show status
show_status() {
    print_header "Container Status"
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml ps 2>/dev/null || $COMPOSE_CMD ps
    
    echo ""
    print_msg "Access URLs:" "$BLUE"
    print_msg "  React App:        http://localhost:${WEB_PORT:-3000}" "$GREEN"
    echo ""
    print_msg "API Configuration:" "$BLUE"
    print_msg "  API URL:          ${VITE_API_URL:-http://localhost:8000/api/v1}" "$YELLOW"
    print_msg "  WebSocket URL:    ${VITE_WS_URL:-ws://localhost:8082}" "$YELLOW"
}

# Install dependencies (for local development without Docker)
install_deps() {
    print_header "Installing Dependencies"
    
    if command -v npm &> /dev/null; then
        npm install
        print_msg "Dependencies installed!" "$GREEN"
    else
        print_msg "npm not found. Please install Node.js." "$RED"
        exit 1
    fi
}

# Main script
main() {
    print_header "Cyphertrade App Docker Setup"
    
    detect_os
    check_container_runtime
    
    case "${1:-setup}" in
        setup)
            setup_env
            load_env
            check_api
            build_containers "dev"
            start_containers "dev"
            show_status
            ;;
        start)
            load_env
            start_containers "${2:-dev}"
            show_status
            ;;
        stop)
            stop_containers "${2:-dev}"
            ;;
        restart)
            load_env
            stop_containers "${2:-dev}"
            start_containers "${2:-dev}"
            show_status
            ;;
        build)
            load_env
            build_containers "${2:-dev}"
            ;;
        build-prod)
            load_env
            print_header "Building Production Image"
            $COMPOSE_CMD build
            print_msg "Production build completed!" "$GREEN"
            ;;
        logs)
            $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml logs -f
            ;;
        shell)
            $CONTAINER_RUNTIME exec -it cyphertrade-web-dev /bin/sh
            ;;
        npm)
            shift
            $CONTAINER_RUNTIME exec cyphertrade-web-dev npm "$@"
            ;;
        status)
            load_env
            show_status
            ;;
        clean)
            print_header "Cleaning Up"
            $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi local
            print_msg "Cleanup completed!" "$GREEN"
            ;;
        local)
            # Run without Docker (local development)
            setup_env
            load_env
            install_deps
            print_msg "Starting Vite dev server locally..." "$YELLOW"
            npm run dev
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|restart|build|build-prod|logs|shell|npm|status|clean|local}"
            echo ""
            echo "Commands:"
            echo "  setup      - First time setup (build and start dev containers)"
            echo "  start      - Start containers"
            echo "  stop       - Stop containers"
            echo "  restart    - Restart containers"
            echo "  build      - Rebuild development containers"
            echo "  build-prod - Build production image"
            echo "  logs       - View container logs"
            echo "  shell      - Open shell in container"
            echo "  npm        - Run npm command in container"
            echo "  status     - Show container status"
            echo "  clean      - Remove containers, volumes, and images"
            echo "  local      - Run locally without Docker"
            exit 1
            ;;
    esac
}

main "$@"
