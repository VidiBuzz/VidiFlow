# 🚀 DEPLOY TO RAILWAY - DO THIS NOW

## Step 1: Create Railway Account & Project (5 minutes)

1. Go to **https://railway.app**
2. Click "Login" → Sign up with GitHub (fastest)
3. Click "New Project"
4. Select "Empty Project"

## Step 2: Add PostgreSQL Database (2 minutes)

1. In your project, click "**+ New**"
2. Select "**Database**" → "**PostgreSQL**"
3. Railway creates the database automatically
4. Click on the PostgreSQL service
5. Go to "**Variables**" tab
6. **COPY** the `DATABASE_URL` value (looks like: `postgresql://postgres:password@...`)

## Step 3: Deploy Backend API (3 minutes)

### Option A: Deploy from GitHub (Recommended)
1. Push the `/api` folder to GitHub:
   ```bash
   cd /mnt/m/code/vidismart
   git add api/
   git commit -m "Add backend API"
   git push
   ```

2. In Railway:
   - Click "**+ New**" → "**GitHub Repo**"
   - Select your `vidismart` repository
   - Railway will detect Node.js and deploy automatically

3. Go to "**Settings**" tab
   - Root Directory: `/api`
   - Start Command: `npm start`

4. Go to "**Variables**" tab and add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste the value from PostgreSQL service)

### Option B: Deploy with CLI
```bash
cd /mnt/m/code/vidismart/api
railway init
railway up
railway variables set NODE_ENV=production
railway link
```

## Step 4: Get Your API URL (1 minute)

1. Click on your backend service
2. Go to "**Settings**" tab
3. Click "**Generate Domain**" under "Public Networking"
4. **COPY** the URL (looks like: `https://your-app.up.railway.app`)

## Step 5: Update HTML Files (2 minutes)

Update the API_URL in both HTML files:

```bash
# Update the API URL
sed -i 's|http://localhost:3000/api|https://YOUR-RAILWAY-URL.up.railway.app/api|g' /mnt/m/code/vidismart/vidismart-visual-vector-knowledge-graph.html

sed -i 's|http://localhost:3000/api|https://YOUR-RAILWAY-URL.up.railway.app/api|g' /mnt/m/code/vidismart/VidiSmart.VisualVectorKnowledgeGraph.html
```

**Or manually edit line 1118 in both files:**
```javascript
const API_URL = 'https://YOUR-RAILWAY-URL.up.railway.app/api';
```

## Step 6: Upload to VidiSmart Server (2 minutes)

```bash
# Option 1: Copy to public_html (if you have local access)
cp /mnt/m/code/vidismart/vidismart-visual-vector-knowledge-graph.html /mnt/m/code/vidismart/public_html/

# Option 2: Upload via SSH
scp /mnt/m/code/vidismart/vidismart-visual-vector-knowledge-graph.html user@vidismart.com:/home/customer/www/vidismart.com/public_html/

# Option 3: Use Git (if public_html is a git repo)
cd /mnt/m/code/vidismart/public_html
cp ../vidismart-visual-vector-knowledge-graph.html .
git add vidismart-visual-vector-knowledge-graph.html
git commit -m "Add landing page with backend integration"
git push
```

## Step 7: Test Everything (2 minutes)

1. **Visit your page:**
   - https://vidismart.com/vidismart-visual-vector-knowledge-graph.html

2. **Test the signup form:**
   - Fill out the form
   - Click "Submit - Get Started"
   - Should see: "Thank you! We'll contact you within 24 hours"

3. **Check database:**
   - Go to Railway → PostgreSQL → "Data" tab
   - Should see your signup in the `signups` table

4. **Test checkboxes:**
   - Click any checkbox in the 90-Day Action Plan
   - Should toggle on/off and save state

## 🎉 YOU'RE LIVE!

**Your landing page is now:**
- ✅ Live on vidismart.com
- ✅ Collecting signups in PostgreSQL
- ✅ Interactive checkboxes working
- ✅ Professional, conversion-optimized design

## Next Steps:

1. **Add real videos:**
   - Replace `VIDEO_ID_HERE` with YouTube IDs
   - Line 413 in the HTML file

2. **Update phone number:**
   - Replace `(555) 123-4567` with real number
   - Line 1038 in the HTML file

3. **Add Stripe payment:**
   - Integrate Stripe checkout for $2,500 setup fee
   - Add to the "Get Started" button

4. **Email notifications:**
   - Add SendGrid/Mailgun to send emails when someone signs up
   - Notify sales team automatically

## Troubleshooting:

**If form doesn't work:**
- Check Railway logs: Click service → "Deployments" → Click latest → "View Logs"
- Verify API_URL is correct in HTML (should be Railway URL)
- Check browser console for errors (F12 → Console)

**If database connection fails:**
- Verify DATABASE_URL is set in Railway Variables
- Check PostgreSQL service is running (green dot)

**Need help?**
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
