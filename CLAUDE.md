# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyIP is a comprehensive IP toolbox web application that provides IP information, connectivity testing, security checks, and network diagnostics. It's built as a Vue 3 frontend with an Express.js backend, designed for both self-hosted deployment and public use.

## Architecture

### Frontend (Vue 3 + Vite)
- **Location**: `/frontend/`
- **Entry point**: `frontend/main.js`
- **Key technologies**: Vue 3, Vue Router, Pinia (state management), Bootstrap 5, i18n
- **Components structure**:
  - Main components in `/frontend/components/`
  - Advanced tools in `/frontend/components/advanced-tools/`
  - IP info displays in `/frontend/components/ip-infos/`
  - Utility widgets in `/frontend/components/widgets/`

### Backend (Express.js)
- **Location**: Root directory
- **Main files**: `backend-server.js` (API server), `frontend-server.js` (static file server)
- **API handlers**: `/api/` directory containing modular API endpoints
- **Key features**: Rate limiting, IP detection, proxy support, multiple IP service integrations

### Build System
- **Vite** for frontend bundling with PWA support
- **Concurrent servers**: Frontend (port 18966) and backend (port 11966) run simultaneously
- **Manual chunk splitting** for optimized loading

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (runs both frontend and backend with hot reload)
npm run dev

# Build for production
npm run build

# Start production servers
npm start

# Start individual servers
npm run start-frontend  # Static file server
npm run start-backend   # API server only
```

## Environment Configuration

Environment variables are managed through `.env` files. Key variables include:
- `BACKEND_PORT` (default: 11966)
- `FRONTEND_PORT` (default: 18966)
- API keys for various IP services (IPInfo.io, IPAPI.is, etc.)
- Security settings (rate limiting, domain restrictions)

## Key Architectural Patterns

### State Management (Pinia)
- Main store: `frontend/store.js`
- Handles user preferences, Firebase auth, backend configurations
- Reactive state for mobile detection, theme switching

### API Integration
- Multiple IP service providers with fallback logic
- Modular API handlers in `/api/` directory
- Rate limiting and security middleware on backend

### Internationalization
- Vue i18n with locale files in `/frontend/locales/`
- Supports English, Chinese, and French
- Dynamic language switching with persistent preferences

### PWA Features
- Service worker with caching strategies
- Offline support for static assets
- Add-to-homescreen capability

## Testing & Quality

No automated test suite is currently configured. Manual testing is done through:
- Development server (`npm run dev`)
- Production build verification (`npm run build` then `npm start`)

## Key Integrations

- **MaxMind GeoIP**: Local database files in `/common/maxmind-db/`
- **Firebase**: Optional user authentication and achievements
- **Multiple IP Services**: IPInfo.io, IPAPI.com, IP2Location, etc.
- **Cloudflare**: Speed testing and network diagnostics
- **Google Analytics**: User behavior tracking (configurable)

## Security Considerations

- Built-in rate limiting and request throttling
- IP-based access controls
- Domain whitelist support for backend API
- No sensitive data stored in frontend code
- Environment-based API key management