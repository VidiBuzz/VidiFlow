# SmartGen Media - API Keys Setup Guide

## Overview
This guide explains how to obtain API keys for all SmartGen Media providers. Some providers are free and require no API keys, while others require paid subscriptions.

## Free Providers (No API Key Required)

### 1. Picsum Photos
- **Cost:** Free
- **API Key:** Not required
- **Setup:** None needed - works immediately
- **Usage:** Stock photos for presentations
- **Reliability:** ✅ Always works

### 2. Pollinations.ai
- **Cost:** Free
- **API Key:** Not required
- **Setup:** None needed - works immediately
- **Usage:** AI-generated images
- **Reliability:** ⚠️ May have occasional downtime

### 3. Craiyon
- **Cost:** Free
- **API Key:** Not required
- **Setup:** Requires backend proxy (currently falls back to Picsum)
- **Usage:** AI-generated images
- **Reliability:** ⚠️ Needs backend implementation

## Paid Providers (API Key Required)

### 4. Google Gemini Flash
- **Cost:** $0.04 per image
- **API Key:** Required
- **Setup Steps:**
  1. Go to [Google AI Studio](https://aistudio.google.com/)
  2. Sign in with your Google account
  3. Click "Get API Key" in the left sidebar
  4. Create a new API key or use existing one
  5. Copy the API key (starts with `AIza...`)
  6. Paste into the "Gemini / Google AI Key" field in SmartGen Media settings

- **Documentation:** [Google AI Studio Docs](https://ai.google.dev/docs)
- **Billing:** Pay-per-use, no upfront costs
- **Rate Limits:** Varies by plan

### 5. Stability AI
- **Cost:** $0.06 per image
- **API Key:** Required
- **Setup Steps:**
  1. Go to [Stability AI Platform](https://platform.stability.ai/)
  2. Create an account or sign in
  3. Navigate to "API Keys" section
  4. Generate a new API key
  5. Copy the API key (starts with `sk-...`)
  6. Paste into the "Stability AI Key" field in SmartGen Media settings

- **Documentation:** [Stability AI API Docs](https://platform.stability.ai/docs)
- **Billing:** Credit-based system
- **Rate Limits:** Based on subscription tier

### 6. Seedance
- **Cost:** $0.08 per image
- **API Key:** Required
- **Setup Steps:**
  1. Go to [Seedance.ai](https://seedance.ai/)
  2. Create an account
  3. Navigate to API section in dashboard
  4. Generate or copy your API key
  5. Paste into the "Seedance API Key" field in SmartGen Media settings

- **Documentation:** [Seedance API Documentation](https://seedance.ai/docs)
- **Billing:** Pay-per-use
- **Special Features:** AI video generation capabilities

### 7. Nano Banana 2
- **Cost:** $0.02 per image
- **API Key:** Requires custom proxy URL
- **Setup Steps:**
  1. Contact Nano Banana provider for proxy access
  2. Obtain proxy URL endpoint
  3. Paste into the "Nano Banana 2 Proxy URL" field in SmartGen Media settings

- **Note:** This requires a custom backend implementation
- **Alternative:** Currently falls back to Picsum

## Local Models (No API Key Required)

### 8. Qwen Image (Local)
- **Cost:** Free (local processing)
- **API Key:** Not required
- **Setup Steps:**
  1. Install [LM Studio](https://lmstudio.ai/)
  2. Download Qwen Image model
  3. Start LM Studio server on port 1234
  4. Configure API URL: `http://localhost:1234/v1`
  5. Select "Qwen Image (Local)" in SmartGen Media

- **Requirements:** Powerful computer with GPU
- **Privacy:** All processing local

### 9. LTX 2.3 (Local)
- **Cost:** Free (local processing)
- **API Key:** Not required
- **Setup Steps:**
  1. Install [LM Studio](https://lmstudio.ai/)
  2. Download LTX 2.3 model
  3. Start LM Studio server on port 1234
  4. Configure API URL: `http://localhost:1234/v1`
  5. Select "LTX 2.3 (Local)" in SmartGen Media

- **Requirements:** Powerful computer with GPU
- **Privacy:** All processing local

## Quick Setup Recommendations

### For Testing/Demos (Free)
1. **Picsum** - Always works, no setup
2. **Pollinations** - Free AI images, may have downtime

### For Production Use (Paid)
1. **Gemini Flash** - Best value at $0.04/image
2. **Stability AI** - High quality at $0.06/image
3. **Seedance** - Video capabilities at $0.08/image

### For Privacy/Offline Use
1. **Qwen Image (Local)** - Free, private
2. **LTX 2.3 (Local)** - Free, private

## API Key Security Best Practices

### Do's:
- ✅ Store API keys in SmartGen Media settings (localStorage)
- ✅ Use environment variables for backend services
- ✅ Rotate keys periodically
- ✅ Monitor usage and costs
- ✅ Set up billing alerts

### Don'ts:
- ❌ Never commit API keys to git repositories
- ❌ Don't share API keys publicly
- ❌ Don't hardcode keys in HTML/JS files
- ❌ Don't expose keys in client-side code (except for demo)

## Cost Estimation

### Monthly Usage Examples:

**Light Usage (100 images/month):**
- Picsum: Free
- Pollinations: Free
- Gemini Flash: $4.00
- Stability AI: $6.00
- Seedance: $8.00

**Medium Usage (500 images/month):**
- Gemini Flash: $20.00
- Stability AI: $30.00
- Seedance: $40.00

**Heavy Usage (1000+ images/month):**
- Contact providers for volume discounts
- Consider local models for cost savings

## Troubleshooting

### Common Issues:

**"API key missing" error:**
- Verify key is entered correctly
- Check for extra spaces
- Ensure key is active (not expired)

**"Connection failed" error:**
- Check internet connection
- Verify API endpoint is correct
- Check provider status pages

**"Rate limit exceeded" error:**
- Wait and try again
- Upgrade to higher tier
- Implement request queuing

## Support Resources

### Provider Documentation:
- **Google AI:** https://ai.google.dev/docs
- **Stability AI:** https://platform.stability.ai/docs
- **Seedance:** https://seedance.ai/docs

### SmartGen Media Support:
- Check console for error messages
- Use "Test Connection" button in settings
- Verify all required fields are filled

## Free Tier Limitations

Most paid providers offer free credits for new users:
- **Google AI:** $300 free credit for new accounts
- **Stability AI:** Free credits on signup
- **Seedance:** Check for trial credits

Use free credits to test before committing to paid usage.

---

**Last Updated:** March 20, 2026  
**Version:** 1.0.0  
**Platform:** SmartGen Media for SmartChannel CX