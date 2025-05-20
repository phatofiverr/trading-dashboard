
import { TradingAccount } from "@/types/Trade";

export interface TradingCalendarProps {
  account?: TradingAccount;
  accountId?: string; 
  currency?: string;
  accountOnly?: boolean;
}
