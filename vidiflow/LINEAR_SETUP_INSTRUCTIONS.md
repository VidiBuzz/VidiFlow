# Linear Setup Instructions

## Step 1: Create Your Linear Account

1. Go to https://linear.app
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with Google or email
4. Create a new workspace called **"VidiSmart"**

## Step 2: Create Projects

Once in your workspace, create these **5 projects**:

| Project Name | Color | Icon |
|-------------|-------|------|
| **SmartGen** | Blue | 🔧 |
| **Smart Book** | Green | 📚 |
| **Smart Deck** | Purple | 🎴 |
| **VidiPitch** | Orange | 🎬 |
| **Infrastructure** | Gray | ⚙️ |

**How to create a project:**
1. Click **"Projects"** in the left sidebar
2. Click **"+ New Project"**
3. Enter the name, pick a color and icon
4. Repeat for all 5 projects

## Step 3: Import the CSV

1. Go to **Settings** (click your avatar → Settings)
2. Click **"Import"** in the left sidebar
3. Select **"CSV"**
4. Download the file: [`LINEAR_IMPORT.csv`](./LINEAR_IMPORT.csv)
5. Upload the CSV file
6. Map the columns:
   - `Title` → Title
   - `Description` → Description
   - `Project` → Project
   - `Status` → Status
   - `Priority` → Priority
   - `Label` → Label
   - `Estimate` → Estimate
7. Click **"Import"**

## Step 4: Verify Your Dashboard

After import, you should see:

- **30 total issues** across 5 projects
- **12 completed** tasks (marked as "Done")
- **18 backlog** tasks (marked as "Backlog")
- **2 blocked** tasks (labeled "blocked")
- **2 critical** priority tasks

## Step 5: Use the Dashboard

### View All Projects at Once
1. Click **"Issues"** in the left sidebar
2. Click the **filter icon**
3. Set filter to: `Project is any of SmartGen, Smart Book, Smart Deck, VidiPitch, Infrastructure`
4. You now see ALL tasks across ALL projects

### View by Project
1. Click any project name in the left sidebar
2. See all tasks for that project only

### View by Status
1. Click **"Board"** view (top right, switch from List to Board)
2. See tasks organized by status: Backlog → Todo → In Progress → Done

### View by Priority
1. Click the **filter icon**
2. Set filter to: `Priority is Urgent` or `Priority is High`
3. See only the most critical tasks

## Quick Reference: What's Blocked Right Now

| Task | Project | Blocker |
|------|---------|---------|
| Create book_chapters collection in Directus | Smart Book | Need Directus API access |
| Execute actual migration to Directus | Smart Book | Need `DIRECTUS_ACCESS_TOKEN` |

## Quick Reference: Critical Priority Tasks

| Task | Project |
|------|---------|
| Execute actual migration to Directus | Smart Book |
| Set up VidiPitch manufacturer portal | VidiPitch |
| Deploy SmartChannel CX platform | SmartChannel |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `C` | Create new issue |
| `Q` | Open quick search |
| `B` | Switch to Board view |
| `L` | Switch to List view |
| `Cmd/Ctrl + K` | Command palette |

## Your Dashboard URL

Once set up, your dashboard will be at:
```
https://linear.app/vidismart
```

Bookmark this. This is your **single source of truth** for all 5 projects.
