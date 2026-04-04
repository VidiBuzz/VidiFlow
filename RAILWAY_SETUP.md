# Railway Deployment Guide

## Quick Setup

### 1. Create Railway Project
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo" (or "Empty Project")

### 2. Add PostgreSQL Database
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will create a PostgreSQL instance
3. Copy the `DATABASE_URL` from the PostgreSQL service

### 3. Deploy Backend API
1. Click "New" → "GitHub Repo" (select this repo)
2. Or click "Empty Service" and connect manually
3. Set environment variables:
   - `DATABASE_URL`: (copied from PostgreSQL service)
   - `NODE_ENV`: `production`
   - `PORT`: Railway will set this automatically

### 4. Update Frontend
1. Get your Railway API URL (e.g., `https://your-app.up.railway.app`)
2. Update the `API_URL` in the HTML file or set it as an environment variable

## Environment Variables

In Railway, set these variables for the backend service:

```
DATABASE_URL=postgresql://...  (from PostgreSQL service)
NODE_ENV=production
```

## Database Setup

The database table will be created automatically when the server starts. The schema:

```sql
CREATE TABLE checklist_items (
  id SERIAL PRIMARY KEY,
  section VARCHAR(255) NOT NULL,
  task_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Local Development

1. Install dependencies:
```bash
cd api
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

3. Run development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/checklist` - Get all checklist items
- `GET /api/checklist/:section` - Get items by section
- `POST /api/checklist` - Create new item
- `PATCH /api/checklist/:id` - Update item (toggle completion)
- `DELETE /api/checklist/:id` - Delete item
- `GET /health` - Health check

## Testing

Once deployed, test the API:

```bash
# Health check
curl https://your-app.up.railway.app/health

# Get all items
curl https://your-app.up.railway.app/api/checklist
```

## Frontend Integration

The HTML file will automatically connect to the API. Just update the `API_URL` constant in the script tag:

```javascript
const API_URL = 'https://your-app.up.railway.app/api';
```

Or set it via environment variable when serving the frontend.
