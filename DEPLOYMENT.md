# Techmap Deployment Guide

This is the deployment-ready version of the Techmap application, configured for Render hosting.

## 📋 Deployment Checklist

### Required Environment Variables (Set in Render Dashboard):
```
NODE_ENV=production
SESSION_SECRET=your-secure-random-string-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-app-name.onrender.com (optional)
```

### Render Configuration:
- **Build Command**: `npm run build && npm run setup`
- **Start Command**: `npm start`
- **Runtime**: Node.js
- **Plan**: Free (or upgrade as needed)

### Google OAuth Setup:
After deployment, add this redirect URI to your Google OAuth configuration:
```
https://your-app-name.onrender.com/auth/google/callback
```

## 🚀 Deployment Steps

1. **Upload this entire folder as a ZIP file to Render**
2. **Configure the environment variables in Render dashboard**
3. **Update Google OAuth redirect URIs**
4. **Deploy and test**

## 📁 What's Changed for Deployment:

- ✅ Root `package.json` added with deployment scripts
- ✅ Backend `package.json` updated with engines and production scripts
- ✅ Server.js configured for production (HOST: 0.0.0.0)
- ✅ App.js updated with production CORS settings
- ✅ Frontend updated with dynamic API URLs
- ✅ Render configuration file (`render.yaml`) added
- ✅ Production-ready session configuration

## 🔧 Local Testing (Optional)

To test the production configuration locally:

```bash
# Set environment variables
export NODE_ENV=production
export SESSION_SECRET=your-test-secret
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

# Install and run
npm install
npm run setup
npm start
```

## 📱 Expected Live URL:
```
https://your-app-name.onrender.com
```

---
**Deployment Branch Created by**: The Blueprint Team  
**Date**: $(date)  
**Purpose**: Production deployment on Render
