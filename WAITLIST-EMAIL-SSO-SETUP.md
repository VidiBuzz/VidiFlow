# Waitlist: Email Autoresponders & SSO Setup Guide

## Current State

### What's Working
- **waitlist_leads table** exists in PostgreSQL (vidismart_community database)
- **Directus collection** `waitlist_leads` is registered with 12 fields
- **waitlist.html** is configured to POST to Directus API
- **Directus admin** is accessible at https://vidicrm.com/admin

### What Needs Setup
- Email autoresponders (confirmation emails after signup)
- SSO/2FA for admin access
- Production CORS configuration for cross-domain communication

---

## 1. Email Autoresponders with Resend

Directus has a built-in **Flows** system that can trigger email sends when new items are created. Here's how to set it up:

### Option A: Directus Flow (Recommended)

1. **Go to Directus Admin** → Settings → Flows
2. **Create New Flow**:
   - Name: `Waitlist Confirmation Email`
   - Trigger: `Event Hook`
   - Event: `items.create`
   - Collection: `waitlist_leads`

3. **Add Operations**:
   - **Operation 1**: `Mail` (built-in email operation)
     - To: `{{ $trigger.payload.email }}`
     - Subject: `Welcome to VidiSmart Waitlist!`
     - HTML Body: Your confirmation email template

4. **Configure SMTP** in Directus environment variables:
   ```env
   EMAIL_TRANSPORT=smtp
   EMAIL_SMTP_HOST=smtp.resend.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=resend
   EMAIL_SMTP_PASSWORD=your_resend_api_key
   EMAIL_FROM=noreply@vidismart.com
   ```

### Option B: External Webhook + Resend API

If you prefer using Resend's API directly:

1. **Create Flow** with `Webhook` operation
2. **POST to Resend API**:
   ```json
   {
     "url": "https://api.resend.com/emails",
     "method": "POST",
     "headers": {
       "Authorization": "Bearer YOUR_RESEND_API_KEY",
       "Content-Type": "application/json"
     },
     "body": {
       "from": "VidiSmart <noreply@vidismart.com>",
       "to": ["{{ $trigger.payload.email }}"],
       "subject": "Welcome to VidiSmart Waitlist!",
       "html": "<h1>Thanks for joining!</h1><p>We'll notify you when we launch.</p>"
     }
   }
   ```

### Option C: Custom Node.js Service

Create a lightweight service that listens for Directus webhooks and sends via Resend:

```javascript
// waitlist-email-service.js
const express = require('express');
const { Resend } = require('resend');
const app = express();
app.use(express.json());

const resend = new Resend('re_your_api_key');

app.post('/webhook/waitlist', async (req, res) => {
  const { email, name } = req.body;
  
  await resend.emails.send({
    from: 'VidiSmart <noreply@vidismart.com>',
    to: email,
    subject: 'Welcome to VidiSmart Waitlist!',
    html: `<h1>Welcome ${name}!</h1><p>You're on the list.</p>`
  });
  
  res.json({ success: true });
});

app.listen(3001, () => console.log('Email service running on :3001'));
```

---

## 2. SSO / 2FA for Directus Admin

### Current Directus Auth Setup
Your Directus instance uses **email/password authentication** with:
- Admin email: `admin@vidismart.com`
- Password: (set via `ADMIN_PASSWORD` env var)

### SSO Options

Directus supports several SSO providers out of the box:

#### Google SSO
```env
AUTH_PROVIDERS=google
AUTH_GOOGLE_DRIVER=google
AUTH_GOOGLE_CLIENT_ID=your_google_client_id
AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION=false
```

#### GitHub SSO
```env
AUTH_PROVIDERS=github
AUTH_GITHUB_DRIVER=github
AUTH_GITHUB_CLIENT_ID=your_github_client_id
AUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### SAML SSO (Enterprise)
```env
AUTH_PROVIDERS=saml
AUTH_SAML_DRIVER=saml
AUTH_SAML_STRATEGY=openid
AUTH_SAML_ENTRY_POINT=https://your-idp.com/saml
AUTH_SAML_ISSUER=vidismart-directus
AUTH_SAML_CERT=your_cert.pem
AUTH_SAML_CLIENT_ID=your_client_id
AUTH_SAML_CLIENT_SECRET=your_client_secret
```

### 2FA Setup

Directus has **built-in TOTP (Time-based One-Time Password)** support:

1. Go to **Directus Admin** → User Settings → Security
2. Enable **Two-Factor Authentication**
3. Scan QR code with authenticator app (Google Authenticator, Authy)
4. Enter verification code to complete setup

### Recommended Setup for Production

For your use case (vidicrm.com admin for vidismart.com content):

1. **Enable Google SSO** - easiest for team members with Google accounts
2. **Require 2FA** for all admin users
3. **Create separate roles**:
   - `content_editor` - can manage pages, posts, waitlist
   - `admin` - full access to settings, users, permissions

---

## 3. Database Location

### Where is the waitlist data stored?

The `waitlist_leads` table is in your **PostgreSQL database**:

- **Database**: `vidismart_community`
- **Table**: `waitlist_leads`
- **User**: `directus`
- **Host**: `vidismart-postgres` Docker container

### Table Schema
```sql
CREATE TABLE waitlist_leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  business_type VARCHAR(100),
  interests TEXT,
  source VARCHAR(100),
  referrer_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  date_created TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  sort INTEGER
);
```

### Viewing Data in Directus

1. Go to https://vidicrm.com/admin
2. Login with admin credentials
3. Navigate to **Waitlist Leads** in the sidebar
4. View, filter, and export all submissions

---

## 4. Production CORS Configuration

For vidismart.com to communicate with vidicrm.com (Directus), you need to configure CORS:

### In Directus Environment Variables
```env
CORS_ENABLED=true
CORS_ORIGIN=https://vidismart.com,https://www.vidismart.com,http://localhost
CORS_METHODS=GET,POST,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
```

### In Docker Compose
```yaml
services:
  directus:
    environment:
      - CORS_ENABLED=true
      - CORS_ORIGIN=https://vidismart.com
```

---

## 5. Next Steps Checklist

- [ ] Add Resend SMTP credentials to Directus environment variables
- [ ] Create Directus Flow for waitlist confirmation emails
- [ ] Configure CORS for cross-domain communication
- [ ] Enable SSO (Google/GitHub) for admin access
- [ ] Enable 2FA for all admin users
- [ ] Test waitlist form submission end-to-end
- [ ] Deploy updated waitlist.html to production server

---

## Quick Reference

| Resource | URL/Location |
|----------|--------------|
| Directus Admin | https://vidicrm.com/admin |
| Waitlist Page | https://vidismart.com/waitlist.html |
| Local Waitlist | http://localhost:8888/waitlist.html |
| Directus API | https://vidicrm.com/items/waitlist_leads |
| PostgreSQL DB | vidismart_community (vidismart-postgres container) |
| Resend Dashboard | https://resend.com/dashboard |

---

**Last Updated:** 2026-04-13
**Status:** Database ready, email/SSO pending configuration
