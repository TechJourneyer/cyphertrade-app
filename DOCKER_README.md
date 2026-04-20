# Docker Setup - Cyphertrade App (React)

## Quick Start

```bash
# Make setup script executable
chmod +x setup.sh

# First time setup
./setup.sh setup

# Or run locally without Docker
./setup.sh local
```

## Prerequisites

**Important:** This React app connects to the **cyphertrade-api** backend.

1. Start the old cyphertrade project (for MySQL):
   ```bash
   cd ../cyphertrade
   ./setup.sh start
   ```

2. Start the API:
   ```bash
   cd ../cyphertrade-api
   ./setup.sh start
   ```

3. Then start this React app:
   ```bash
   ./setup.sh setup
   ```

## Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| Web | cyphertrade-web-dev | 3000 | React + Vite Dev Server |

## External Dependencies

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:8000 | Laravel API |
| WebSocket | ws://localhost:8082 | Market data stream |

## Files

```
docker/
├── Dockerfile          # Production (multi-stage: Node build → Nginx)
├── Dockerfile.dev      # Development (Vite dev server)
└── nginx/
    └── default.conf    # Nginx config for production

docker-compose.yml      # Production compose
docker-compose.dev.yml  # Development overrides
.env.docker.example     # Environment template
setup.sh                # One-click setup script
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `./setup.sh setup` | First time setup (Docker) |
| `./setup.sh local` | Run locally without Docker |
| `./setup.sh start` | Start containers |
| `./setup.sh stop` | Stop containers |
| `./setup.sh restart` | Restart containers |
| `./setup.sh build` | Rebuild development container |
| `./setup.sh build-prod` | Build production image |
| `./setup.sh logs` | View logs (follow mode) |
| `./setup.sh shell` | Open shell in container |
| `./setup.sh npm <cmd>` | Run npm command in container |
| `./setup.sh status` | Show container status |
| `./setup.sh clean` | Remove all containers & volumes |

## Development Modes

### Docker Development
```bash
./setup.sh setup
# App available at http://localhost:3000
# Hot reload enabled via volume mounts
```

### Local Development (No Docker)
```bash
./setup.sh local
# Installs deps and starts Vite dev server
# Requires Node.js 20+ installed locally
```

## Building for Production

```bash
# Build production Docker image
./setup.sh build-prod

# Or manually
docker build -t cyphertrade-app:latest \
  --build-arg VITE_API_URL=https://api.cyphertrade.com/api/v1 \
  --build-arg VITE_WS_URL=wss://ws.cyphertrade.com \
  -f docker/Dockerfile .
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:8000/api/v1 | Backend API URL |
| `VITE_WS_URL` | ws://localhost:8082 | WebSocket URL |
| `WEB_PORT` | 3000 | Local port to expose |

## Troubleshooting

### Hot Reload Not Working
```bash
# Ensure volumes are mounted correctly
docker exec cyphertrade-web-dev ls -la /app/src

# Check Vite logs
./setup.sh logs
```

### API Connection Errors
```bash
# Verify API is running
curl http://localhost:8000/api/v1/health

# Check CORS settings in API
```

### Build Failures
```bash
# Clear node_modules and rebuild
./setup.sh clean
rm -rf node_modules
./setup.sh setup
```
