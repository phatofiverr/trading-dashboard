# Trading Dashboard

## Firebase Setup

### Setting up Firestore Database

To use the data sync features in this application, you need to set up Firebase Firestore. Here's how:

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable Google Analytics if desired

2. **Create a Firestore Database**
   - In your project, navigate to "Firestore Database" in the left sidebar
   - Click "Create Database"
   - Start in production mode or test mode (you can change this later)
   - Choose a location close to your users

3. **Set up Authentication**
   - In your project, navigate to "Authentication" in the left sidebar
   - Click "Get Started"
   - Enable the Email/Password provider
   - Configure any other desired authentication methods

4. **Configure Firestore Security Rules**
   - Go to the "Rules" tab in Firestore
   - Update the rules to allow authenticated users to access their own data:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow users to read and write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         // Subcollections for user data
         match /tradingAccounts/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         
         match /strategies/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         
         match /trades/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

5. **Get Firebase Configuration**
   - Go to Project Settings (gear icon in the top left)
   - Scroll down to "Your apps" and add a Web app if you haven't already
   - Copy the Firebase configuration object

6. **Update Firebase Configuration in Your Project**
   - In your project, locate or create `src/config/firebase.ts`
   - Replace the configuration with your Firebase config

   ```typescript
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID" // Optional
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

7. **Composite Indexes Setup**
   - For complex queries, you may need to set up composite indexes
   - When you run a query that requires a composite index, Firebase will show an error with a link to create the index
   - Click the link and follow the instructions

### Data Structure

The application stores the following data in Firestore:

1. **User Profiles**
   - Path: `/users/{userId}`
   - Contains basic user information and profile data

2. **Trading Accounts**
   - Path: `/users/{userId}/tradingAccounts/{accountId}`
   - Contains trading account details

3. **Strategies**
   - Path: `/users/{userId}/strategies/{strategyId}`
   - Contains trading strategy information
   - Types: 'live' or 'backtest'

4. **Trades**
   - Path: `/users/{userId}/trades/{tradeId}`
   - Contains individual trade records
   - Can be filtered by account or strategy

### Using Firestore Sync

1. Click the "Sync Data" button in the sidebar footer to:
   - Save all local data to Firestore
   - Load data from Firestore to replace local data

2. Data is automatically saved when:
   - Creating new accounts
   - Adding strategies
   - Recording trades

3. Data is automatically loaded when:
   - Logging in
   - Refreshing the application

### Troubleshooting

- If you encounter errors with Firestore permissions, check your security rules
- For query errors, you may need to create composite indexes
- Check the browser console for detailed error messages
