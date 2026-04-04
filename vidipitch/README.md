# VidiPitch - Smart Stack Upgrade Landing Page

A professional landing page for VidiPitch's Smart Stack Upgrade v2.0 - a Federal Contracting Intelligence Platform with PayPal integration.

## Features

- **Modern Landing Page** - Professional design with hero section, features, testimonials, and order form
- **PayPal Integration** - Secure payment processing with PayPal Smart Buttons
- **Form Validation** - Client-side validation with real-time feedback
- **Loading States** - Visual feedback during payment processing
- **Success/Error Messages** - Clear user feedback after transactions
- **SEO Optimized** - Meta tags, Open Graph, and Twitter Card support
- **Analytics Ready** - Google Analytics and Facebook Pixel integration
- **Mobile Responsive** - Optimized for all device sizes
- **Docker Support** - Easy deployment with Docker and Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PayPal Developer Account (for payment processing)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd vidipitch
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   - `PAYPAL_CLIENT_ID` - Your PayPal Client ID (use 'test' for sandbox)
   - `PAYPAL_SECRET` - Your PayPal Secret
   - `GA_MEASUREMENT_ID` - Your Google Analytics ID (optional)
   - `FACEBOOK_PIXEL_ID` - Your Facebook Pixel ID (optional)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3001/index.html
   ```

## Production Deployment

### Option 1: Traditional Server

1. **Set environment to production:**
   ```bash
   NODE_ENV=production
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

### Option 2: Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t vidipitch .
   docker run -p 3001:3001 --env-file .env vidipitch
   ```

### Option 3: Cloud Platforms

The application is ready to deploy on:
- **Heroku** - Add a `Procfile` with `web: node server/server.js`
- **Railway** - Automatic deployment from Git
- **Render** - Automatic deployment from Git
- **DigitalOcean App Platform** - Automatic deployment from Git
- **AWS ECS/EKS** - Use the provided Dockerfile
- **Google Cloud Run** - Use the provided Dockerfile

## Configuration

### PayPal Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create a new app or use an existing one
3. Copy your Client ID and Secret to `.env`
4. For testing, use `PAYPAL_CLIENT_ID=test`
5. For production, use your live credentials

### Google Analytics Setup

1. Create a Google Analytics account at [analytics.google.com](https://analytics.google.com/)
2. Create a new property and get your Measurement ID (format: G-XXXXXXXXXX)
3. Add the ID to your `.env` file
4. The tracking code is already included in the HTML

### Facebook Pixel Setup

1. Create a Facebook Pixel at [business.facebook.com](https://business.facebook.com/)
2. Get your Pixel ID
3. Add the ID to your `.env` file
4. The tracking code is already included in the HTML

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### PayPal Configuration
```
GET /api/paypal-config
```
Returns PayPal client ID and environment.

### Create Order
```
POST /api/create-order
Body: { "amount": 3000.00 }
```
Creates a PayPal order.

### Capture Payment
```
POST /api/capture-payment
Body: {
  "orderId": "string",
  "payerEmail": "string",
  "payerName": "string",
  "fullName": "string",
  "email": "string",
  "company": "string",
  "phone": "string"
}
```
Captures a PayPal payment and logs order details.

### Submit Order
```
POST /api/orders
Body: {
  "fullName": "string",
  "email": "string",
  "company": "string",
  "phone": "string"
}
```
Submits an order (for non-PayPal orders or additional processing).

## Project Structure

```
vidipitch/
├── index.html              # Main landing page
├── server/
│   └── server.js          # Express server with API endpoints
├── package.json           # Node.js dependencies
├── .env.example          # Environment variable template
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── .dockerignore         # Docker ignore file
└── README.md            # This file
```

## Customization

### Changing the Price

Edit the price in multiple locations:
1. `index.html` - Line 531 (price badge)
2. `index.html` - Line 761 (order summary)
3. `index.html` - Line 834 (PayPal order amount)
4. `server/server.js` - Line 30 (default amount)

### Changing Colors

Edit the CSS variables in `index.html`:
```css
:root {
    --primary: #1e3a8a;      /* Main blue color */
    --primary-dark: #1e40af; /* Darker blue */
    --primary-light: #3b82f6; /* Lighter blue */
    --accent: #dc2626;       /* Red accent */
    --success: #16a34a;      /* Green for success */
}
```

### Adding New Sections

Add new sections in `index.html` following the existing pattern:
```html
<section class="your-section" id="your-section">
    <div class="section-title">
        <h2>Your Title</h2>
        <p>Your description</p>
    </div>
    <!-- Your content -->
</section>
```

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use HTTPS in production** - Essential for PayPal and security
3. **Validate all inputs** - Server-side validation is implemented
4. **Rate limiting** - Consider adding rate limiting for production
5. **CORS** - Configure CORS properly for your domain
6. **Session secret** - Use a strong, random session secret

## Troubleshooting

### PayPal buttons not showing
- Check that `PAYPAL_CLIENT_ID` is set correctly
- Ensure the PayPal SDK script is loading
- Check browser console for errors

### Server won't start
- Verify all dependencies are installed: `npm install`
- Check that port 3001 is not in use
- Ensure `.env` file exists and is configured

### Payments not processing
- Verify PayPal credentials are correct
- Check server logs for error messages
- Ensure you're using the correct PayPal environment (sandbox vs production)

## Support

- **Email:** VidiBuzz@gmail.com
- **Support:** support@vidipitch.com
- **Hours:** Mon-Fri, 9AM-5PM EST

## License

ISC License

## Copyright

© 2026 VidiPitch. All rights reserved.
