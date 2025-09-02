import { Confluence } from '@/hooks/slices/types';

// Trade confluence checking interface
export interface TradeConfluenceCheck {
  confluenceId: string;
  isPresent: boolean;
}

/**
 * Calculates setup quality based on checked confluences and their weights
 * @param confluences Array of confluences with their weights
 * @param checks Array of confluence checks indicating which are present
 * @returns Quality percentage (0-100)
 */
export const calculateSetupQuality = (
  confluences: Confluence[],
  checks: TradeConfluenceCheck[]
): number => {
  if (!confluences?.length || !checks?.length) {
    return 0;
  }

  const totalQuality = confluences
    .filter(confluence => 
      checks.find(check => 
        check.confluenceId === confluence.id && check.isPresent
      )
    )
    .reduce((total, confluence) => total + confluence.weight, 0);

  return Math.min(Math.max(totalQuality, 0), 100);
};

/**
 * Validates that confluence weights sum to 100
 * @param confluences Array of confluences to validate
 * @returns true if weights sum to exactly 100
 */
export const validateConfluenceWeights = (confluences: Confluence[]): boolean => {
  if (!confluences?.length) return false;
  
  const totalWeight = confluences.reduce((sum, confluence) => sum + confluence.weight, 0);
  return totalWeight === 100;
};

/**
 * Creates a default confluence for new strategies
 * @returns Default confluence with 100% weight
 */
export const createDefaultConfluence = (): Confluence => ({
  id: crypto.randomUUID(),
  name: 'Setup Confluence',
  weight: 100,
});

/**
 * Rebalances confluence weights to sum to 100
 * @param confluences Array of confluences to rebalance
 * @returns Rebalanced confluences
 */
export const rebalanceConfluenceWeights = (confluences: Confluence[]): Confluence[] => {
  if (!confluences?.length) return [];
  
  const totalWeight = confluences.reduce((sum, c) => sum + c.weight, 0);
  
  if (totalWeight === 100) return confluences;
  
  // Distribute weights evenly
  const baseWeight = Math.floor(100 / confluences.length);
  const remainder = 100 - (baseWeight * confluences.length);
  
  return confluences.map((confluence, index) => ({
    ...confluence,
    weight: baseWeight + (index < remainder ? 1 : 0)
  }));
};

/**
 * Validates confluence data
 * @param confluence Confluence to validate
 * @returns Validation result with error message if invalid
 */
export const validateConfluence = (confluence: Confluence): { isValid: boolean; error?: string } => {
  if (!confluence.name?.trim()) {
    return { isValid: false, error: 'Confluence name is required' };
  }
  
  if (confluence.weight < 1 || confluence.weight > 100) {
    return { isValid: false, error: 'Weight must be between 1 and 100' };
  }
  
  if (!Number.isInteger(confluence.weight)) {
    return { isValid: false, error: 'Weight must be a whole number' };
  }
  
  return { isValid: true };
};

/**
 * Checks for duplicate confluence names within a strategy
 * @param confluences Array of confluences to check
 * @returns true if there are duplicates
 */
export const hasDuplicateConfluenceNames = (confluences: Confluence[]): boolean => {
  const names = confluences.map(c => c.name.trim().toLowerCase());
  return new Set(names).size !== names.length;
};