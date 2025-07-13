# Miniapp Integration - Deployment Guide

## 🚀 Free Deployment Options

### Option 1: Render (Recommended)
**Best for beginners, easiest setup**

1. **Sign up**: Go to [render.com](https://render.com) and create an account
2. **Create Web Service**:
   - Connect your GitHub repository
   - Choose "Web Service"
   - Set build command: `npm install && cd client && npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables (see below)

3. **Add PostgreSQL Database**:
   - Create a new PostgreSQL service
   - Copy the `DATABASE_URL` to your web service environment variables

### Option 2: Railway
**Great developer experience**

1. **Sign up**: Go to [railway.app](https://railway.app)
2. **Deploy from GitHub**:
   - Connect your repository
   - Railway will auto-detect it's a Node.js app
   - Add PostgreSQL plugin from the marketplace
   - Set environment variables

### Option 3: Vercel + Railway
**Separate frontend and backend**

1. **Frontend (Vercel)**:
   - Deploy `client/` folder to Vercel
   - Set build command: `npm run build`
   - Set output directory: `build`

2. **Backend (Railway)**:
   - Deploy `server/` folder to Railway
   - Add PostgreSQL plugin
   - Update frontend API URL to point to Railway backend

## 🔧 Environment Variables

Set these in your hosting platform:

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this

# FIB Payment (keep your current values)
FIB_BASE_URL=https://fib.stage.fib.iq
FIB_CLIENT_ID=icf-market
FIB_CLIENT_SECRET=15dba883-3c31-4bf4-b27d-d6ab51c177b0

# FIB SSO (keep your current values)
FIB_SSO_BASE_URL=https://fib.stage.fib.iq
FIB_SSO_CLIENT_ID=stageSSO
FIB_SSO_CLIENT_SECRET=215233bd-0624-4fba-98e7-3e3616fdbf08

# Optional
FORCE_SAMPLE_PRODUCTS=false
```

## 📊 Database Migration

Your app will automatically:
1. Create all necessary tables on first run
2. Insert sample products if the database is empty
3. Work with both SQLite (development) and PostgreSQL (production)

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all secrets
- [ ] Enable CORS properly for your domain

## 🌐 Custom Domain (Optional)

After deployment:
1. Buy a domain (Namecheap, GoDaddy, etc.)
2. Point DNS to your hosting platform
3. Configure SSL certificate (usually automatic)

## 📱 Frontend Configuration

If deploying frontend separately:
1. Update API base URL in frontend
2. Set `REACT_APP_API_URL` environment variable
3. Update CORS settings in backend

## 🚨 Common Issues

### Database Connection Error
- Check `DATABASE_URL` format
- Ensure database is created and accessible
- Verify SSL settings for production

### Build Failures
- Check Node.js version (use 16+)
- Ensure all dependencies are in `package.json`
- Verify build commands

### CORS Errors
- Update CORS settings to allow your frontend domain
- Check if frontend and backend are on same domain

## 📞 Support

- **Render**: Excellent documentation and support
- **Railway**: Great Discord community
- **Vercel**: Extensive documentation

## 🎯 Next Steps

1. Deploy to your chosen platform
2. Test all functionality
3. Set up monitoring (optional)
4. Configure custom domain (optional)
5. Set up CI/CD for automatic deployments

---

**Note**: Your database will work perfectly in production! The app automatically switches between SQLite (development) and PostgreSQL (production) based on the `NODE_ENV` environment variable. 