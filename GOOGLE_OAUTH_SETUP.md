# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your trading dashboard application.

## Firebase Console Setup

### 1. Enable Google Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Find **Google** in the list of providers and click on it
6. Click the **Enable** toggle to turn on Google authentication
7. Add your **Project support email** (this will be shown to users during sign-in)

### 2. Configure OAuth Consent Screen (if needed)

If you haven't set up OAuth consent screen yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (unless you have a Google Workspace organization)
5. Fill in the required information:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **App logo**: Upload your logo (128x128px recommended)
   - **Application home page**: Your domain URL
   - **Application privacy policy link**: Your privacy policy URL (REQUIRED for 100+ users)
   - **Application terms of service link**: Your terms of service URL (recommended)
6. Add scopes (email and profile are usually sufficient)
7. Add test users if needed
8. Save and continue

**Important**: For apps with more than 100 users, you MUST provide:
- A publicly accessible privacy policy
- A terms of service page
- App verification through Google's review process

### 3. Add Authorized Domains

1. In Firebase Console → Authentication → Settings
2. Scroll down to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)
   - Any subdomains you'll use

### 4. Get OAuth Client ID

1. In Firebase Console → Authentication → Sign-in method → Google
2. Copy the **Web client ID** (you'll see it in the configuration)
3. This is automatically generated and configured for you

## Environment Variables

Make sure your `.env` file contains all the necessary Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Frontend Implementation

The frontend implementation is already complete with the following features:

### Components Added:
- `GoogleButton.tsx` - Reusable Google sign-in button
- `Divider.tsx` - Visual separator for authentication methods
- `PrivacyPolicy.tsx` - Comprehensive privacy policy page
- `TermsOfService.tsx` - Comprehensive terms of service page

### Updated Components:
- `Login.tsx` - Added Google sign-in functionality
- `Register.tsx` - Added Google registration functionality
- `AuthContext.tsx` - Added Google authentication methods
- `firebase.ts` - Added Google Auth provider configuration

### Features:
- ✅ Google OAuth popup authentication
- ✅ Automatic user document creation in Firestore
- ✅ Error handling for various OAuth scenarios
- ✅ Loading states and user feedback
- ✅ Consistent UI with existing design
- ✅ Account linking (if user exists with different credentials)

## Testing

### Development Testing:
1. Start your development server
2. Navigate to `/login` or `/register`
3. Click the "Sign in/up with Google" button
4. Complete the Google OAuth flow
5. Verify user is created in Firebase Authentication
6. Verify user document is created in Firestore

### Common Issues:

1. **Pop-up blocked**: Users need to allow pop-ups for your domain
2. **Unauthorized domain**: Make sure your domain is in the authorized domains list
3. **OAuth consent screen not configured**: Complete the OAuth consent screen setup
4. **CORS issues**: Firebase handles this automatically, but ensure your domain is authorized

## Security Considerations

1. **Domain Verification**: Only authorized domains can use OAuth
2. **HTTPS Required**: OAuth requires HTTPS in production
3. **Token Validation**: Firebase automatically validates tokens
4. **User Data**: Only request necessary scopes (email, profile)

## Production Deployment

1. **Update Authorized Domains**: Add your production domain to Firebase
2. **OAuth Consent Screen**: Publish your OAuth consent screen if needed
3. **Environment Variables**: Ensure all Firebase config is set in production
4. **HTTPS**: Ensure your production site uses HTTPS

## Additional Features (Optional)

You can extend the Google OAuth implementation with:

1. **Profile Picture**: Access user's Google profile picture
2. **Additional Scopes**: Request calendar, contacts, etc. (if needed)
3. **Account Linking**: Link multiple OAuth providers to one account
4. **Custom Claims**: Add custom user roles/permissions

## Troubleshooting

### Error Codes:
- `auth/popup-closed-by-user`: User cancelled the sign-in
- `auth/popup-blocked`: Browser blocked the popup
- `auth/account-exists-with-different-credential`: User exists with different auth method
- `auth/unauthorized-domain`: Domain not authorized in Firebase

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check authorized domains in Firebase Console
4. Ensure OAuth consent screen is properly configured
5. Test with different browsers/devices

## Privacy Policy & Terms of Service Pages

### Ready-to-Use Pages

We've created comprehensive privacy policy and terms of service pages specifically tailored for your trading dashboard:

#### Privacy Policy (`src/pages/PrivacyPolicy.tsx`)
- ✅ Covers all Google OAuth requirements
- ✅ Trading-specific data collection and usage
- ✅ Firebase data handling
- ✅ User rights and data control
- ✅ Security measures
- ✅ Contact information

#### Terms of Service (`src/pages/TermsOfService.tsx`)
- ✅ Service description and features
- ✅ User account responsibilities
- ✅ Acceptable use policies
- ✅ Trading-specific disclaimers
- ✅ Limitation of liability
- ✅ Legal protections

### Hosting Your Pages

#### Option 1: Add to Your App Routes
1. Add routes to your React Router configuration:
```tsx
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

// In your router configuration
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
```

2. Your URLs will be:
- Privacy Policy: `https://yourdomain.com/privacy`
- Terms of Service: `https://yourdomain.com/terms`

#### Option 2: Static Hosting (Alternative)
1. Build the pages as static HTML
2. Host on GitHub Pages, Netlify, or similar
3. Use URLs like:
- `https://yourdomain.com/privacy-policy.html`
- `https://yourdomain.com/terms-of-service.html`

### Customization

Before using these pages, customize:
1. **Contact emails**: Update the email addresses
2. **Company name**: Replace with your company name
3. **Jurisdiction**: Update the governing law section
4. **Domain**: Replace placeholder URLs with your actual domain
5. **Logo**: Add your company logo to the pages

### Google OAuth Verification

For apps with 100+ users, these pages will help you:
- ✅ Meet Google's privacy policy requirements
- ✅ Provide comprehensive terms of service
- ✅ Pass Google's app verification process
- ✅ Build user trust and compliance

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Review browser console errors
3. Verify all configuration steps are completed
4. Test with a fresh browser session
5. Ensure privacy policy and terms pages are accessible
