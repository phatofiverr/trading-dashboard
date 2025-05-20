
import { useParams } from 'react-router-dom';
import { useTradeStore } from './useTradeStore';

/**
 * Hook to get the current active strategy ID from either URL params or store filters
 */
export const useCurrentStrategy = (): string => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { filters } = useTradeStore();
  
  // Return strategy ID from URL params if available, otherwise from filters, or default
  return strategyId || filters.strategy || 'default';
};
