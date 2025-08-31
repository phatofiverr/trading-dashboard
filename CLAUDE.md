# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production  
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

Note: No test scripts are configured.

## Architecture Overview

This is a React 18 trading dashboard with Firebase integration, built using Vite + TypeScript.

### State Management
- **Zustand stores** with sliced architecture and persistence
- **useTradeStore**: Combined trades, import/export, and strategy management  
- **useAccountsStore**: Trading accounts management
- **AuthContext**: Firebase authentication and data sync

### Data Flow & Firebase Integration
- Firebase Auth for user authentication
- Firestore hierarchical data structure:
  - `/users/{userId}` - User profiles
  - `/users/{userId}/tradingAccounts/{accountId}` - Trading accounts  
  - `/users/{userId}/strategies/{strategyId}` - Trading strategies
  - `/users/{userId}/trades/{tradeId}` - Individual trades
- Data syncs between local Zustand stores and Firestore
- AuthContext handles user state and provides `syncData()` function

### Key Technologies
- **UI**: Origin UI (all components should be imported from Origin UI, no Radix/shadcn)
- **Styling**: Tailwind CSS with Origin UI's design tokens + custom trading theme overrides
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for trading visualizations
- **Routing**: React Router v6 with lazy loading
- **Dates**: date-fns library

### Component Organization
- Feature-based organization under `src/components/` (trade/, accounts/, auth/, profile/)
- Route components in `src/pages/`
- Reusable UI components in `src/components/ui/`
- Shared utilities in `src/lib/`

### Configuration Notes
- Path alias `@/*` maps to `src/*`
- TypeScript with relaxed settings (no strict null checks, unused vars allowed)
- ESLint with React-specific rules, unused vars rule disabled
- Vite config includes lovable-tagger component in development mode

### Firebase Setup Requirements
Firebase project needs:
- Authentication with Email/Password provider enabled
- Firestore database with security rules allowing users access to their own data only
- Configuration object in `src/config/firebase.ts`

## Database Schema & Data Types

### Core Data Types

#### Trade Interface (`src/types/Trade.ts`)
```typescript
interface Trade {
  id: string;
  userId: string;
  accountId?: string;
  strategyId?: string;
  
  // Basic trade info
  instrument: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  entryTime: Date;
  exitTime?: Date;
  timeframe: string;
  timezone: string;
  session: string;
  
  // Risk management
  stopLoss?: number;
  takeProfit?: number;
  riskAmount?: string;
  riskRewardRatio?: number; // Calculated ratio (e.g., 2.5 for 1:2.5)
  positionSize?: number;    // Calculated lot size
  
  // Outcomes
  outcome?: 'TP' | 'SL' | 'BE' | 'Manual' | 'Partial';
  profit?: number;
  rMultiple?: number;
  pips?: number;
  
  // Analysis
  behavioralTags?: string[];
  notes?: string;
  screenshot?: string;
  wouldTakeAgain?: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

#### Account Interface
```typescript
interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  // Current balance calculated dynamically from trades
  createdAt: Date;
  updatedAt: Date;
}
```

#### Strategy Interface
```typescript
interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'live' | 'backtest';
  createdAt: Date;
  updatedAt: Date;
}
```

### Adding New Data Types

When introducing a new data type to the application, follow this systematic approach:

#### 1. Define Type Interface (`src/types/`)
- Create or update interface in appropriate type file
- Include all required and optional fields
- Add proper TypeScript types and documentation
- Consider Firebase serialization (Dates, nested objects)

#### 2. Update Form Schema (`src/components/*/schemas/`)
- Add Zod validation schema for form data
- Include proper validation rules and error messages
- Ensure schema matches the TypeScript interface
- Add optional fields with `.optional()` or `.default()`

#### 3. Update Data Transformers (`src/components/*/utils/`)
- Modify `tradeDataTransformer.ts` or create new transformer
- Handle conversion between form data and database format
- Include proper type checking and validation
- Add calculated fields if needed

#### 4. Update Store Slices (`src/hooks/slices/`)
- Add new actions to appropriate Zustand slice
- Include CRUD operations (create, read, update, delete)
- Add proper TypeScript types for actions
- Consider persistence and sync with Firebase

#### 5. Update Firebase Service (`src/services/firebaseService.ts`)
- Add Firestore collection methods
- Include proper error handling and type safety
- Add security rules for new collections
- Consider data validation and sanitization

#### 6. Update UI Components
- Create or update form components
- Add display components for the new data type
- Include proper error handling and loading states
- Follow Origin UI design patterns

#### 7. Update Database Schema (Firestore)
- Add new collections or fields to Firestore
- Update security rules to allow access
- Consider data migration for existing users
- Add proper indexing for queries


## UI Style Guidelines (Origin UI)

**CRITICAL: All components and pages MUST follow Origin UI's design tokens, variants, and spacing system. No Radix/shadcn imports are allowed.**

### Page Layout Structure
All pages should follow this exact pattern:
```tsx
<SidebarProvider>
  <div className="min-h-screen bg-trading-bg flex w-full">
    <AppSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page content */}
        </div>
      </main>
    </div>
  </div>
</SidebarProvider>
```

### Card System
- **Primary cards**: `glass-effect bg-black/5 border-0`
- **Hover effects**: Add `transition-all hover:bg-black/10`
- **Overflow**: Use `overflow-hidden` when needed
- **Alert/Warning cards**: `glass-effect bg-red-500/10 border-red-500/20`

### Button Variants
- **Primary actions**: `variant="glass"`
- **Secondary actions**: `variant="minimal"`
- **Tertiary/Cancel**: `variant="outline"`
- **Sizes**: Prefer `size="sm"` for compact interfaces

### Color System
- **Background**: Always use `bg-trading-bg` for page backgrounds
- **Text colors**: 
  - Primary text: Default (no class needed)
  - Secondary text: `text-muted-foreground`
  - Success: `text-green-500`
  - Error: `text-red-500`
- **Custom trading colors**: Available as `trading.bg`, `trading.panel`, etc.

### Typography
- **Font**: Inter (already configured)
- **Weights**: Maximum font-weight is 500 (medium)
- **Headings**: 
  - Page titles: `text-2xl font-bold`
  - Section titles: `text-xl font-bold`
  - Card titles: `font-medium`

### Icons
- **Preferred**: Lucide React icons only
- **Size**: Usually `h-4 w-4` or `h-6 w-6`
- **Avoid**: Emojis in UI components (use icons instead)

### Input Styling
- **Background**: `bg-black/20`
- **Borders**: `border-white/10`
- **Dialog backgrounds**: `bg-black/80 backdrop-blur-md border-white/5`

## Data Calculations & Business Logic

### Trade Profit Calculations
**CRITICAL: Use consistent profit calculation across all components.**

#### Trading Logic & Data Flow
- **rMultiple** = Risk multiple ratio (e.g., 1.5R, -0.8R, 0R for break-even)
- **profit** = Actual dollar amount gained/lost 
- **Formula**: `profit = riskAmount × rMultiple`
- **Break-even logic**: `trade.rMultiple === 0`

#### Values Saved to Firestore (Static)
**Core Trade Data:**
- `entryPrice`, `exitPrice`, `slPrice` (numbers)
- `direction` ("long" | "short")
- `entryDate`, `exitDate` (ISO strings)
- `riskAmount` (string, user input like "100")
- `rMultiple` (number, calculated ratio like 1.5R, -0.8R)
- `profit` (number, calculated: riskAmount × rMultiple)
- `riskRewardRatio` (number, reward/risk ratio)

**Analysis & Meta Data:**
- `session`, `entryType`, `obType`, `marketStructure`
- `confidenceRating`, `demonTags`, `notes`, `chartAnalysis`
- All form inputs and behavioral tracking data

#### Values Calculated Dynamically (Never Stored)
**Account Balances:**
- `currentBalance = initialBalance + sum(all trade profits)`
- `totalProfit = sum(calculateTradeProfit(trade))` for account
- `profitPercentage = (totalProfit / initialBalance) × 100`

**Trade Statistics:**
- Win/loss counts, win rate, break-even rate
- Average rMultiple, expectancy, profit factor
- Max drawdown, Sharpe ratio, Sortino ratio
- Daily/monthly performance aggregations

#### calculateTradeProfit() Priority Order
1. **First priority:** Use stored `profit` if available
2. **Standard calculation:** `riskAmount × rMultiple` 
3. **Fallback:** Return 0 if insufficient data

**Account Balance Updates:**
- Account balances are calculated dynamically from trades, not stored statically
- Components must fetch trades and filter by `accountId` to show accurate balances
- Use `calculateTradeProfit()` consistently across all components

### Trade Tagging & Strategy Filtering
**IMPORTANT: Understanding trade categorization for strategy views**

- **Account trades**: Tagged with `"account"`, treated as `'live'` trades
- **Backtest trades**: Tagged with `"backtest"`, treated as `'backtest'` trades  
- **Strategy filtering**: `strategyType` filter determines which trades show in strategy pages
- **StrategyPage defaults**: Shows "Live Data" mode by default to include account trades

### Component Dependencies
- Account-related components should import both `useAccountsStore` and `useTradeStore`
- Always call `fetchTrades()` in useEffect when displaying account balances
- Filter trades by `accountId` before calculating account-specific metrics

## Trade Entry Form

### Multi-Step Form Structure
The trade entry form uses a 4-step wizard interface:
1. **Context** - Basic trade information and session detection
2. **Strategy** - Entry/exit prices, risk management, and strategy selection
3. **Outcome** - Trade result and performance metrics
4. **Review** - Final confirmation and additional notes

### Key Features
- **Auto-calculations**: Position size, risk-reward ratio, session detection
- **Session detection**: Automatic based on entry time and timezone
- **Form validation**: Step-by-step validation with React Hook Form + Zod
- **Data persistence**: Form data persists between steps

### Session Detection System
- **Real-time detection**: Updates automatically when time or timezone changes
- **Session mapping**:
  - **Asia Session**: 00:00-08:00 UTC
  - **London Session**: 08:00-12:00 UTC
  - **Overlap Session**: 12:00-16:00 UTC
  - **NY Session**: 16:00-20:00 UTC
  - **Late NY Session**: 20:00-24:00 UTC
- **Supported timezones**: 40+ timezones including major trading centers

### Technical Implementation
- **Form state**: React Hook Form with Zod validation
- **Step navigation**: Controlled progression with validation
- **Auto-save**: Form data persists between steps
- **Calculations**: Real-time position size and risk-reward ratio
- **Session detection**: Hardcoded timezone offsets for reliability

## Memories
- to memorize
- to memoriE
- to memorize