# 🚀 Deployment Guide for Trav Logistics Application

This guide will help you deploy your full-stack application with MongoDB backend.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier available)
- [Railway](https://railway.app/) account (free tier available)
- [Vercel](https://vercel.com/) account (free tier available)

## 🗄️ Step 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier recommended)

2. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add specific IP addresses for production

4. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your values

## 🚂 Step 2: Deploy Backend to Railway

1. **Prepare Repository**
   ```bash
   # Make sure all changes are committed
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [Railway](https://railway.app/)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `server/`
   - Railway will automatically detect it's a Node.js app

3. **Configure Environment Variables**
   - In your Railway project, go to "Variables"
   - Add these environment variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trav_db?retryWrites=true&w=majority
     JWT_SECRET=your_super_secret_jwt_key_here
     PORT=5000
     CORS_ORIGIN=https://your-frontend-domain.vercel.app
     ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - Copy your Railway domain (e.g., `https://your-app.railway.app`)

## 🌐 Step 3: Deploy Frontend to Vercel

1. **Update API Base URL**
   - In your frontend code, update the API base URL to your Railway domain
   - Look for files that make API calls and update the base URL

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Sign in with GitHub
   - Click "New Project" → "Import Git Repository"
   - Select your repository
   - Set the root directory to `.` (root of your project)
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel, go to your project → "Settings" → "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-railway-domain.railway.app
     ```

## 🔧 Step 4: Update CORS Settings

1. **Update Backend CORS**
   - In Railway, update the `CORS_ORIGIN` variable with your Vercel domain
   - Redeploy the backend

## 🧪 Step 5: Test Your Deployment

1. **Test Backend**
   - Visit: `https://your-railway-domain.railway.app/api/health`
   - Should see: `{"message":"Server is running","timestamp":"..."}`

2. **Test Frontend**
   - Visit your Vercel domain
   - Try to register/login
   - Test the main functionality

## 📱 Alternative Deployment Options

### **Option A: Render**
- Similar to Railway
- Free tier available
- Good for both frontend and backend

### **Option B: Heroku**
- More established platform
- Free tier discontinued
- Good for production apps

### **Option C: DigitalOcean App Platform**
- More control
- Pay-as-you-go pricing
- Good for scaling

## 🚨 Important Notes

1. **Environment Variables**: Never commit `.env` files to Git
2. **MongoDB**: Use MongoDB Atlas for production (don't use local MongoDB)
3. **CORS**: Always configure CORS properly for production
4. **JWT Secrets**: Use strong, unique secrets for production
5. **HTTPS**: All production deployments should use HTTPS

## 🔍 Troubleshooting

### **Backend Issues**
- Check Railway logs for errors
- Verify MongoDB connection string
- Check environment variables are set correctly

### **Frontend Issues**
- Check browser console for errors
- Verify API base URL is correct
- Check CORS settings

### **Database Issues**
- Verify MongoDB Atlas network access
- Check database user credentials
- Ensure cluster is running

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test locally first
4. Check the platform's documentation

---

**Happy Deploying! 🎉**
