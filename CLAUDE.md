# CLAUDE.md

This file provides guidance for working with code in this React 18 trading dashboard repository, built with Vite + TypeScript and Firebase integration.

## Development Commands
- `npm run dev`: Start dev server (port 8080)
- `npm run build`: Build for production
- `npm run build:dev`: Build for development
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

**Note**: No test scripts configured.

## Architecture Overview
- **Framework**: React 18 with Vite + TypeScript
- **State Management**: 
  - Zustand with sliced architecture and persistence
  - Stores: `useTradeStore` (trades, strategies), `useAccountsStore` (accounts)
  - `AuthContext` for Firebase auth and data sync
- **Data Flow**: Syncs between Zustand stores and Firestore
- **Key Technologies**:
  - UI: shadcn/ui (Radix UI primitives)
  - Styling: Tailwind CSS with custom trading theme
  - Forms: React Hook Form + Zod
  - Charts: Recharts
  - Routing: React Router v6 (lazy loading)
  - Dates: date-fns
- **Structure**:
  - `src/components/`: Feature-based (trade/, accounts/, auth/, profile/)
  - `src/pages/`: Route components
  - `src/components/ui/`: Reusable UI components
  - `src/lib/`: Shared utilities
- **Config**:
  - Path alias: `@/*` → `src/*`
  - TypeScript: Relaxed settings (no strict null checks)
  - ESLint: React rules, unused vars disabled
  - Vite: Includes lovable-tagger in dev mode

## Firebase Setup
- **Requirements**:
  - Firebase Auth (Email/Password enabled)
  - Firestore with user-specific security rules
  - Config in `src/config/firebase.ts`
- **Data Structure**:
  - `/users/{userId}`: Profiles
  - `/users/{userId}/tradingAccounts/{accountId}`: Accounts
  - `/users/{userId}/strategies/{strategyId}`: Strategies
  - `/users/{userId}/trades/{tradeId}`: Trades

## Database Schema
### Core Interfaces
#### Trade (`src/types/Trade.ts`)
```typescript
interface Trade {
  id: string;
  userId: string;
  accountId?: string;
  strategyId?: string;
  instrument: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  entryTime: Date;
  exitTime?: Date;
  timeframe: string;
  timezone: string;
  session: string;
  stopLoss?: number;
  takeProfit?: number;
  riskAmount?: string;
  riskRewardRatio?: number;
  positionSize?: number;
  outcome?: 'TP' | 'SL' | 'BE' | 'Manual' | 'Partial';
  profit?: number;
  rMultiple?: number;
  pips?: number;
  behavioralTags?: string[];
  notes?: string;
  screenshot?: string;
  wouldTakeAgain?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### TradingAccount
```typescript
interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Strategy
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
1. **Define Interface** (`src/types/`): Add TypeScript interface with proper types.
2. **Form Schema** (`src/components/*/schemas/`): Create Zod schema matching interface.
3. **Data Transformers** (`src/components/*/utils/`): Handle form-to-database conversion.
4. **Store Slices** (`src/hooks/slices/`): Add CRUD actions to Zustand store.
5. **Firebase Service** (`src/services/firebaseService.ts`): Add Firestore methods and rules.
6. **UI Components**: Create forms/displays using shadcn/ui patterns.
7. **Firestore**: Update schema, security rules, and indexes.

## UI Style Guidelines (shadcn/ui)
- **Components**: Use shadcn/ui (Radix UI primitives) exclusively.
- **Page Layout**:
  ```tsx
  <SidebarProvider>
    <div className="min-h-screen bg-trading-bg flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{/* Content */}</div>
        </main>
      </div>
    </div>
  </SidebarProvider>
  ```
- **Cards**: Use `glass-effect bg-black/5 border-0`, `hover:bg-black/10`.
- **Buttons**: `glass` (primary), `minimal` (secondary), `outline` (tertiary), `size="sm"`.
- **Colors**:
  - Background: `bg-trading-bg`
  - Text: Default, `text-muted-foreground`, `text-green-500` (success), `text-red-500` (error)
  - Custom: `trading.bg`, `trading.panel`
- **Typography**: Inter font, max weight 500, headings (`text-2xl`, `text-xl`, `font-medium`).
- **Icons**: Lucide React, `h-4 w-4` or `h-6 w-6`.
- **Inputs**: `bg-black/20`, `border-white/10`, dialogs use `bg-black/80 backdrop-blur-md`.

## Color System ✅
**CRITICAL**: Use centralized color system for all components.

- **Files**: `src/lib/colorPalette.ts`, `src/hooks/useColors.ts`, `src/lib/colorClasses.ts`
- **Usage**: 
  ```typescript
  import { useColors } from '@/hooks/useColors';
  const colors = useColors();
  style={{ color: colors.utils.getProfitColor(profit) }}
  ```
- **Rules**: ❌ Never use `text-green-500`, `bg-red-500`. ✅ Always use color system.

## Trade Calculations
- **Profit**: `profit = riskAmount × rMultiple`
- **Stored Values**:
  - Core: `entryPrice`, `exitPrice`, `slPrice`, `direction`, `entryDate`, `exitDate`, `riskAmount`, `rMultiple`, `profit`, `riskRewardRatio`
  - Analysis: `session`, `entryType`, `obType`, `marketStructure`, etc.
- **Dynamic Values** (not stored):
  - Account: `currentBalance = initialBalance + sum(trade profits)`, `profitPercentage`
  - Stats: Win/loss, win rate, expectancy, Sharpe/Sortino ratios
- **calculateTradeProfit**:
  1. Use stored `profit` if available
  2. Else: `riskAmount × rMultiple`
  3. Fallback: 0
- **Account Balances**: Calculate dynamically from trades, filter by `accountId`.

## Trade Entry Form
- **Structure**: 4-step wizard (Context, Strategy, Outcome, Review)
- **Features**:
  - Auto-calculations: Position size, risk-reward ratio, session detection
  - Validation: React Hook Form + Zod
  - Persistence: Form data saved between steps
- **Session Detection**:
  - Auto-updates based on time/timezone
  - Sessions: Asia (00:00-08:00 UTC), London (08:00-12:00 UTC), Overlap (12:00-16:00 UTC), NY (16:00-20:00 UTC), Late NY (20:00-24:00 UTC)

## Notes
- Use `useTradeStore` and `useAccountsStore` for account components.
- Call `fetchTrades()` in `useEffect` for balance calculations.
- Filter trades by `accountId` for metrics.
- Strategy pages default to "Live Data" mode for account trades.