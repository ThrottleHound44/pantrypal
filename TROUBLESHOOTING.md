# 🆘 Common Problems & Solutions

## Quick Fixes for Common Issues

---

## PART 1: Installation Problems

### ❌ "Git is not recognized" or "command not found"

**Problem:** Git isn't installed or not in PATH

**Solution:**
1. Close and reopen Command Prompt/Terminal
2. Try `git --version` again
3. If still doesn't work:
   - Windows: Reinstall Git, make sure to check "Add to PATH"
   - Mac: Try `xcode-select --install` again

---

### ❌ "Python is not recognized" 

**Problem:** Python isn't in PATH

**Solution:**
1. **Windows:** Reinstall Python, CHECK THE BOX "Add Python to PATH"
2. Try `python3 --version` instead of `python --version`
3. Restart your computer
4. Open new Command Prompt/Terminal

---

### ❌ "npm is not recognized"

**Problem:** Node.js isn't installed properly

**Solution:**
1. Reinstall Node.js from nodejs.org
2. Use the LTS version (left button)
3. Restart computer
4. Open new Command Prompt/Terminal

---

## PART 2: GitHub Problems

### ❌ "Git push failed" or "authentication failed"

**Problem:** GitHub needs login

**Solution:**

**Option 1: Use Personal Access Token**
1. Go to github.com
2. Click your profile picture → Settings
3. Scroll down → Developer settings
4. Personal access tokens → Tokens (classic)
5. Generate new token (classic)
6. Name: "PantryPal"
7. Check "repo" box
8. Click "Generate token"
9. **COPY THE TOKEN** (you can't see it again!)
10. When pushing, use token as password

**Option 2: Use GitHub Desktop (Easier)**
1. Download GitHub Desktop: desktop.github.com
2. Install it
3. Sign in with your GitHub account
4. File → Add Local Repository
5. Choose your pantrypal folder
6. Click "Publish repository"
7. Much easier! 😊

---

### ❌ "Repository already exists"

**Problem:** You created the repo twice

**Solution:**
1. Go to github.com
2. Find the pantrypal repository
3. Delete it (Settings → Danger Zone → Delete)
4. Create a new one
5. Try pushing again

---

### ❌ "No files showing up on GitHub"

**Problem:** Push didn't complete

**Solution:**
```bash
# Try these commands again:
git add .
git commit -m "Add all files"
git push origin main
```

If still doesn't work:
```bash
# Force push (only use if necessary)
git push -f origin main
```

---

## PART 3: MongoDB Atlas Problems

### ❌ "Cluster creation stuck"

**Problem:** MongoDB taking too long

**Solution:**
1. Wait 5 minutes
2. Refresh the page
3. If still stuck, delete cluster and create new one
4. Try different region (e.g., change from US East to US West)

---

### ❌ "Can't connect - authentication failed"

**Problem:** Wrong password in connection string

**Solution:**
1. Your connection string should look like:
   ```
   mongodb+srv://pantrypal_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
2. Make sure `YOUR_PASSWORD` is exactly what you saved
3. NO spaces before or after the password
4. NO `<` or `>` symbols - just the password!

**Example - WRONG:**
```
mongodb+srv://pantrypal_user:<Abc123>@cluster...
```

**Example - CORRECT:**
```
mongodb+srv://pantrypal_user:Abc123@cluster...
```

---

### ❌ "Network timeout" or "Can't reach database"

**Problem:** IP address not whitelisted

**Solution:**
1. Go to MongoDB Atlas
2. Click "Network Access" in left menu
3. Make sure you see:
   - Your current IP address
   - AND `0.0.0.0/0` (allow all)
4. If not, add `0.0.0.0/0`:
   - Click "Add IP Address"
   - Type: `0.0.0.0/0`
   - Comment: "Allow all"
   - Click "Confirm"

---

### ❌ "Database user not found"

**Problem:** User wasn't created properly

**Solution:**
1. Go to MongoDB Atlas
2. Click "Database Access" in left menu
3. Check if `pantrypal_user` exists
4. If not, create it:
   - Click "Add New Database User"
   - Username: `pantrypal_user`
   - Password: (autogenerate and save!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

---

## PART 4: Render.com Problems

### ❌ "Build failed" during deployment

**Problem:** Build command error

**Most Common Fixes:**

**Fix 1: Check the Build Command**
Should be EXACTLY this (all on one line):
```
cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
```

**Fix 2: Check all files are on GitHub**
1. Go to your GitHub repository
2. Make sure you see: backend/, frontend/, Dockerfile, etc.
3. If missing, push again:
   ```bash
   git add .
   git commit -m "Add missing files"
   git push origin main
   ```

**Fix 3: Redeploy**
1. In Render dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

---

### ❌ "Application Error" when opening URL

**Problem:** App crashed or can't start

**Solution:**
1. Click "Logs" tab in Render dashboard
2. Scroll to the bottom
3. Look for errors (usually in red)

**Common errors and fixes:**

**"Can't connect to database"**
- Check MONGO_URL environment variable
- Make sure password is correct
- Check MongoDB Atlas network access

**"Port already in use"**
- This shouldn't happen on Render (they manage ports)
- Try redeploying

**"Module not found"**
- Build didn't complete
- Try deploying again with "Clear build cache"

---

### ❌ App loads but shows "API connection error"

**Problem:** Frontend can't reach backend

**Solution:**
This shouldn't happen on Render (they're together), but if it does:

1. Check environment variables are set
2. Make sure Start Command is:
   ```
   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Redeploy

---

### ❌ "Service is extremely slow" or "Timeout"

**Problem:** Free tier sleeping

**Solution:**
1. This is NORMAL for Render free tier
2. First load after 15min of inactivity takes 30-60 seconds
3. After "waking up", it's fast
4. To avoid:
   - Keep a browser tab open
   - OR upgrade to paid plan ($7/month)
   - OR use a service like UptimeRobot to ping every 14 minutes

**Set up automatic pinging (free):**
1. Go to uptimerobot.com
2. Sign up (free)
3. Add new monitor:
   - Type: HTTP(s)
   - URL: your Render URL
   - Monitoring interval: 5 minutes
4. This keeps your app awake!

---

## PART 5: MongoDB Connection Issues

### ❌ "MongoServerError: bad auth" in logs

**Problem:** Wrong credentials

**Solution:**
1. Go to MongoDB Atlas
2. Database Access → Delete user
3. Create new user:
   - Username: `pantrypal_user`
   - Password: (autogenerate and SAVE it!)
4. Update MONGO_URL in Render:
   - Dashboard → Environment
   - Edit MONGO_URL
   - Update password
   - Save
5. Redeploy

---

### ❌ "No database named 'pantrypal'"

**Problem:** Database doesn't exist yet

**Solution:**
- This is NORMAL!
- MongoDB creates the database automatically when first item is added
- Just use the app and it will create the database
- Add a location or item - database will appear

---

## PART 6: Phone/Mobile Issues

### ❌ "Site can't be reached" on phone

**Problem:** URL is wrong or app not deployed

**Solution:**
1. Check URL is exactly from Render (looks like https://pantrypal-something.onrender.com)
2. Try on computer first
3. Make sure you're typing HTTPS (not HTTP)
4. Try copying URL and texting it to yourself, then open from text

---

### ❌ "Add to Home Screen" option not showing

**iPhone Solution:**
1. Make sure you're in Safari (not Chrome)
2. Tap the Share button (box with arrow UP)
3. Scroll down in the menu
4. Tap "Add to Home Screen"

**Android Solution:**
1. Tap menu (three dots)
2. Tap "Add to Home screen"
3. If not there, use Chrome browser

---

### ❌ Camera not working

**Problem:** Need HTTPS for camera

**Solution:**
- Render provides HTTPS automatically
- Make sure URL starts with `https://`
- Allow camera permissions when asked
- Try different browser (Chrome works best)

---

## PART 7: Feature Not Working

### ❌ "Generate Recipes" does nothing

**Problem:** No OpenAI API key

**Solution:**
- This is normal! You put `sk-placeholder`
- To fix:
  1. Get OpenAI API key from platform.openai.com
  2. Create account (needs payment method)
  3. Get API key
  4. In Render, update `OPENAI_API_KEY` with real key
  5. Redeploy

**Alternative:**
- Keep using placeholder
- You'll get "mock recipes" that show how it would work
- Real recipes require paid OpenAI account

---

### ❌ Photos not uploading

**Problem:** File too large

**Solution:**
1. The app compresses photos automatically
2. If still failing, try smaller photo
3. Check Render logs for error message

---

### ❌ Barcode scanner not finding anything

**Problem:** No location with that barcode

**Solution:**
1. Make sure you created a location first
2. Check the barcode number matches exactly
3. Barcodes are case-sensitive: `LOC001` ≠ `loc001`

---

## GENERAL TROUBLESHOOTING STEPS

When something doesn't work:

1. **Check Logs**
   - Render dashboard → Logs tab
   - Read the last 20 lines
   - Look for words like "error", "failed", "cannot"

2. **Try Redeploying**
   - Render dashboard → Manual Deploy
   - Sometimes fixes random issues

3. **Check Environment Variables**
   - Render dashboard → Environment
   - Make sure MONGO_URL and OPENAI_API_KEY are there
   - Check for typos or extra spaces

4. **Test on Different Device**
   - Try on computer
   - Try on different phone
   - Try in incognito/private mode

5. **Clear Cache**
   - Browser: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear cache and cookies
   - Reload page

---

## STILL STUCK?

If none of these solutions work:

**Tell me:**
1. What step you're on (use the checklist)
2. What error message you see (copy exact text)
3. What you tried already
4. Screenshot if possible

**Common info I'll need:**
- Your Render URL
- Your GitHub username
- Screenshot of error in Render logs
- What device you're using

I'll help you fix it! 😊

---

## BACKUP PLAN: Start Over

If everything is broken and you want to start fresh:

1. **Delete everything:**
   - Delete repository on GitHub
   - Delete service on Render  
   - Keep MongoDB Atlas (or delete cluster and make new one)

2. **Start from beginning:**
   - Follow BEGINNER_GUIDE.md step by step
   - Take your time
   - Check each step

Sometimes starting fresh is faster than debugging! 🔄

---

**Remember:** Most errors are simple typos or wrong commands. Read error messages carefully - they usually tell you what's wrong! 💪
