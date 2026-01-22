# AI Call Center Frontend

Modern React frontend for AI-powered call center management system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/              # Source code
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── stores/       # State management (Zustand)
│   ├── hooks/        # Custom hooks
│   └── lib/          # Utilities
├── docs/             # Documentation
│   ├── api-docs/     # API documentation
│   └── ...           # Other docs
├── scripts/          # Deployment scripts
├── config/           # Configuration files
│   ├── nginx.conf    # Nginx HTTP config
│   └── nginx-ssl.conf # Nginx HTTPS config
└── public/           # Static assets
```

## 📚 Documentation

- **API Docs:** `docs/api-docs/`
- **Deployment:** `docs/DEPLOYMENT.md`
- **Quick Start:** `docs/QUICK_START.md`

## 🔧 Configuration

### Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FORCE_REAL_API=true
```

## 🛠️ Scripts

All deployment scripts are in `scripts/` directory:

- `deploy.sh` - Basic deployment
- `deploy-with-ssl.sh` - Deployment with SSL
- `quick-deploy.sh` - Quick deployment
- `setup-ssl.sh` - SSL setup

## 📝 License

MIT
