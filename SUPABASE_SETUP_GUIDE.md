# Supabase Setup Guide for VidiFlow Project

## Problem
Supabase CLI was not installed in the WSL environment, preventing direct use of `supabase` commands for database operations.

## Installation Attempts Made
Several methods were attempted to install Supabase CLI:

1. **APT Package Manager** (`wsl sudo apt update && wsl sudo apt install -y supabase`)
   - Installation appeared to hang or take excessive time
   - Process was still running when checked

2. **NPM Global Install** (`wsl npm install -g supabase`)
   - Failed due to Node.js version incompatibility (required Node.js 20.17.0+ or >=22.9.0, system had v18.19.1)
   - Permission errors when trying to install to `/usr/local/lib/node_modules/`

3. **Snap Package** (`wsl sudo snap install supabase --classic`)
   - Command was interrupted before completion

4. **Manual Download** (curl/download script approach)
   - Failed due to path/command recognition issues in WSL

## Solution Implemented
Since CLI installation proved problematic, a direct SQL execution approach was implemented using Node.js and the `pg` PostgreSQL client.

### Files Created
- `run-supabase-sql.js` - Node.js script to execute SQL files against Supabase database

### How to Use the Solution
1. **Install required dependency**:
   ```bash
   npm install pg
   ```

2. **Run SQL file**:
   ```bash
   node run-supabase-sql.js [path/to/sql/file.sql]
   ```
   If no path is provided, defaults to `vidiflow/supabase-masterlist-complete-seed.sql`

3. **Specify different SQL file**:
   ```bash
   node run-supabase-sql.js vidiflow/supabase-ALL-IN-ONE.sql
   ```

### Available SQL Files in vidiflow/
- `supabase-ALL-IN-ONE.sql` (377,132 chars) - Complete schema
- `supabase-masterlist-complete-seed.sql` (363,020 chars) - Master list seed data
- `supabase-consultants-seed.sql` (161,403 chars) - Consultants seed data
- `supabase-smart-stack-seed.sql` (134,145 chars) - Smart stack seed data
- `supabase-schema.sql` (7,734 chars) - Base schema
- `supabase-schema-real.sql` (20,247 chars) - Extended schema
- And several others for specific modules

### Connection Details Used
The script connects to Supabase using:
- Host: `db.jeasmwbberfgztkxfjwr.supabase.co`
- Port: 5432
- Database: `postgres`
- User: `postgres`
- Password: [Supabase service role key from existing execute-supabase-sql.js]

### Notes
- The Node.js approach splits SQL by semicolon and executes statements individually
- Progress is reported every 50 statements for large files
- Errors are logged but execution continues (useful for seed data where duplicates may occur)
- For production use, consider installing Supabase CLI properly for better integration

## Alternative: Supabase Dashboard
SQL can also be executed via the Supabase web interface:
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor
4. Paste and run SQL commands

## Troubleshooting
- **Authentication failed**: Verify the Supabase service role key is correct
- **Connection refused**: Ensure network access to Supabase database is allowed
- **Permission denied**: Check that the Supabase user has appropriate privileges