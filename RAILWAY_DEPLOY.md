# Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pantrypal)

## What This Does

Clicking the button above will:
1. Create a new Railway project
2. Deploy PantryPal automatically
3. Set up MongoDB database
4. Give you a public URL

## After Clicking:

1. **Sign in to Railway** (free, no credit card needed initially)
2. **Configure variables**:
   - `OPENAI_API_KEY` - Your OpenAI key (optional)
   - MongoDB will be auto-configured
3. **Deploy** - Wait 2-3 minutes
4. **Visit your URL** - Railway gives you: `https://your-app.railway.app`

## Cost:
- **Free trial**: $5 credit (lasts ~1 month for hobby use)
- **After trial**: ~$5/month

## Alternative: Manual Railway Deploy

If the button doesn't work:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd pantrypal
railway init

# 4. Add MongoDB
railway add mongodb

# 5. Deploy
railway up

# 6. Get URL
railway open
```

Done! Your app is now live! 🚀
