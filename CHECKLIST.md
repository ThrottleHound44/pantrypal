# ✅ PantryPal Deployment Checklist

Print this page and check off each step as you complete it!

---

## PREPARATION (Day 1 - or whenever you're ready)

### Create Accounts:
- [ ] GitHub account created (www.github.com)
- [ ] Render account created (www.render.com) 
- [ ] MongoDB Atlas account created (www.mongodb.com/cloud/atlas)

### Install Software:
- [ ] Git installed
  - Test: Open terminal, type `git --version`
- [ ] Python installed  
  - Test: Type `python --version` or `python3 --version`
- [ ] Node.js installed
  - Test: Type `node --version`

### Prepare Files:
- [ ] Downloaded pantrypal-cloud-ready.zip
- [ ] Extracted to Desktop
- [ ] Opened Command Prompt/Terminal in pantrypal folder
  - Test: Type `dir` (Windows) or `ls` (Mac) - see backend, frontend folders

---

## UPLOAD TO GITHUB (30 minutes)

- [ ] Configured Git with email and name
  ```
  git config --global user.email "youremail@example.com"
  git config --global user.name "Your Name"
  ```

- [ ] Created new repository on GitHub
  - Repository name: `pantrypal`
  - Made it PUBLIC
  - Did NOT add README

- [ ] Initialized Git in folder
  ```
  git init
  ```

- [ ] Added all files
  ```
  git add .
  ```

- [ ] Made first commit
  ```
  git commit -m "Initial commit"
  ```

- [ ] Connected to GitHub
  ```
  git remote add origin https://github.com/YOUR_USERNAME/pantrypal.git
  ```

- [ ] Pushed to GitHub
  ```
  git branch -M main
  git push -u origin main
  ```

- [ ] Verified files appear on GitHub website

---

## MONGODB ATLAS SETUP (15 minutes)

- [ ] Created FREE M0 cluster
  - Provider: AWS
  - Region: (closest to you)
  - Name: pantrypal

- [ ] Created database user
  - Username: `pantrypal_user`
  - Password: _____________ (WRITE IT DOWN!)

- [ ] Set network access
  - [ ] Added current IP
  - [ ] Added `0.0.0.0/0` (allow all)

- [ ] Got connection string
  - Copied it: `mongodb+srv://pantrypal_user:<password>@...`
  - Replaced `<password>` with actual password
  - Final string: _________________________________ (SAVE THIS!)

---

## RENDER.COM DEPLOYMENT (20 minutes)

- [ ] Created new Web Service on Render
- [ ] Connected GitHub repository (pantrypal)

- [ ] Configured settings:
  - [ ] Name: `pantrypal`
  - [ ] Region: (selected)
  - [ ] Branch: `main`
  - [ ] Runtime: `Python 3`
  
- [ ] Set Build Command:
  ```
  cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
  ```

- [ ] Set Start Command:
  ```
  cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

- [ ] Selected Instance Type: **Free**

- [ ] Added Environment Variables:
  - [ ] Key: `MONGO_URL` | Value: (MongoDB connection string)
  - [ ] Key: `OPENAI_API_KEY` | Value: `sk-placeholder`

- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment (5-10 minutes)
- [ ] Got URL: _______________________________ (SAVE THIS!)

---

## TESTING (10 minutes)

### On Computer:
- [ ] Opened Render URL in browser
- [ ] Dashboard loads successfully
- [ ] Clicked "Locations"
- [ ] Created test location successfully

### On Phone:
- [ ] Opened Render URL on phone browser
- [ ] App loads and works
- [ ] Added to home screen
- [ ] Opened from home screen icon
- [ ] Tested adding a location
- [ ] Tested taking a photo

---

## SUCCESS! 🎉

- [ ] PantryPal is live and accessible from anywhere!
- [ ] Shared URL with family members
- [ ] Bookmarked BEGINNER_GUIDE.md for reference

---

## OPTIONAL - ADD OPENAI (Later)

If you want AI recipe generation:

- [ ] Got OpenAI API key from platform.openai.com
- [ ] Updated environment variable on Render:
  - Changed `OPENAI_API_KEY` from `sk-placeholder` to real key
- [ ] Redeployed service
- [ ] Tested "Generate Recipes" feature

---

## TROUBLESHOOTING STEPS TAKEN

If you had problems, note what you did to fix them:

Problem 1: _________________________________________________

Solution: _________________________________________________

Problem 2: _________________________________________________

Solution: _________________________________________________

---

## IMPORTANT INFORMATION TO KEEP

**GitHub Repository:** https://github.com/___________/pantrypal

**Render URL:** https://_____________________.onrender.com

**MongoDB Connection String:** (keep secure!)
mongodb+srv://pantrypal_user:__________@cluster0.______.mongodb.net/...

**MongoDB Password:** _______________________

**OpenAI API Key:** (if added) _______________________

---

## MAINTENANCE SCHEDULE

Monthly Tasks:
- [ ] Check if app is still running
- [ ] Test on different devices
- [ ] Backup important data (export grocery lists, etc.)

Every 3 Months:
- [ ] Review MongoDB Atlas (still on free tier?)
- [ ] Review Render usage (still on free tier?)
- [ ] Update dependencies if needed (ask for help!)

---

Keep this checklist! You might need it if you:
- Want to deploy another app
- Need to troubleshoot issues
- Want to help a friend set up their own PantryPal

---

Date Completed: __________________

Your Name: __________________

🎊 YOU'RE NOW A CLOUD DEVELOPER! 🎊
