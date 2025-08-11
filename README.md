e# Trading Dashboard

A comprehensive React-based trading journal and analytics platform with Firebase integration, built for traders to track performance, analyze strategies, and visualize trading data.

## 🚀 Features

### Core Trading Features
- **Trade Management**: Add, edit, and track individual trades with detailed metrics
- **Strategy Analysis**: Separate live and backtest strategy performance tracking
- **Account Management**: Multi-account support with individual performance metrics
- **R-Multiple Tracking**: Risk-based position sizing and performance analysis

### Analytics & Visualizations
- **Equity Curve Charts**: Visual representation of trading performance over time
- **Drawdown Analysis**: Maximum consecutive losses and recovery time metrics
- **Risk-Adjusted Metrics**: Sharpe, Sortino, MAR, and Calmar ratios
- **Trading Calendar**: Visual trade activity and performance by date
- **Activity Heatmaps**: Trade frequency and performance patterns
- **Volatility Modeling**: Stochastic volatility analysis for risk assessment

### Advanced Features
- **Theme Customization**: Strategy-specific and global theme management
- **Data Export**: CSV export functionality for external analysis
- **Filtering System**: Advanced filtering by strategy, account, date range, and more
- **Real-time Calculations**: Live updates of trading statistics and metrics
- **Responsive Design**: Mobile-friendly interface with dark theme

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + shadcn/ui + Tailwind CSS
- **State Management**: Zustand with persistence middleware
- **Authentication**: Firebase Auth
- **Database**: Firestore with real-time sync
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6 with lazy loading

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd trading-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   - Create a `.env` file in your project root
   - Add your Firebase configuration (see Firebase Setup section below)

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production  
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔥 Firebase Setup

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
         
         match /preferences/{document=**} {
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

6. **Set up Environment Variables**
   - Create a `.env` file in your project root
   - Add your Firebase configuration as environment variables:

   ```bash
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   **Important**: The `.env` file is already in `.gitignore` to keep your Firebase credentials secure. Never commit this file to version control.

7. **Firebase Configuration**
   - The Firebase configuration in `src/config/firebase.ts` is already set up to use environment variables
   - No additional changes needed to the configuration file

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

## 📊 Application Architecture

### State Management
The application uses **Zustand** with a sliced architecture for scalable state management:

- **useTradeStore**: Combined trades, import/export, and strategy management  
- **useAccountsStore**: Trading accounts management with Firebase sync
- **useThemeStore**: Strategy-specific and global theme management
- **AuthContext**: Firebase authentication and data synchronization

### Data Flow & Firebase Integration
- **Authentication**: Firebase Auth for user management
- **Database**: Hierarchical Firestore structure for user data isolation
- **Real-time Sync**: Automatic synchronization between local Zustand stores and Firestore
- **Data Persistence**: Local persistence with automatic cloud backup

### Component Organization
```
src/
├── components/
│   ├── trade/           # Trading-related components
│   ├── accounts/        # Account management components
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom hooks and state management
├── pages/              # Route components
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## 🎨 Theme System

The application features a comprehensive theme system:

- **Global Themes**: Applied across the entire application
- **Strategy-Specific Themes**: Custom themes for individual strategies
- **Preset Themes**: Built-in color schemes (Fintech, Turquoise/Red, Minimalist, etc.)
- **Custom Themes**: User-created themes with full color customization

## 📈 Key Metrics & Calculations

### Risk Management
- **R-Multiple**: Position sizing based on risk
- **Maximum Drawdown**: Peak-to-trough decline analysis
- **Consecutive Losses**: Streak analysis for risk assessment

### Performance Metrics
- **Sharpe Ratio**: Risk-adjusted returns calculation
- **Sortino Ratio**: Downside risk-focused performance
- **Calmar Ratio**: Return vs. maximum drawdown
- **Win Rate**: Percentage of profitable trades

### Advanced Analytics
- **Stochastic Volatility**: Market volatility modeling
- **Time-based Performance**: Session, daily, weekly analysis
- **Currency Conversion**: Multi-currency account support

## 🚀 Usage

### Getting Started
1. **Register/Login**: Create an account using Firebase Authentication
2. **Create Accounts**: Set up trading accounts with different brokers/currencies
3. **Add Strategies**: Create live or backtest strategies
4. **Record Trades**: Add trades with detailed entry/exit information
5. **Analyze Performance**: Use the comprehensive analytics dashboard

### Key Workflows
- **Strategy Analysis**: Navigate to strategy pages for detailed performance metrics
- **Account Management**: Track performance across multiple trading accounts
- **Data Export**: Export filtered trade data for external analysis
- **Theme Customization**: Personalize dashboard appearance per strategy

## 🔐 Security & Privacy

- **User Isolation**: Firestore security rules ensure users can only access their own data
- **Authentication**: Secure Firebase Auth integration
- **Data Validation**: Client and server-side validation for data integrity
- **Local Storage**: Sensitive data encrypted in browser local storage

## 🤝 Contributing

This is a personal trading dashboard project. For suggestions or issues:
1. Check existing issues
2. Create detailed bug reports or feature requests
3. Follow the existing code style and architecture

## 📝 License

[]

## 🙏 Acknowledgments

- Built with modern React ecosystem
- UI components from Radix UI and shadcn/ui
- Charts powered by Recharts
- Firebase for backend services
