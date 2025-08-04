export type BehavioralTag = 
  | "exited_too_soon"
  | "exited_too_late" 
  | "entered_too_soon"
  | "entered_too_late"
  | "not_in_trading_plan"
  | "incorrect_stop_placement"
  | "wrong_size_trade"
  | "didnt_take_planned_trade";

export interface BehavioralTagDefinition {
  id: BehavioralTag;
  label: string;
  description: string;
  category: 'entry' | 'exit' | 'planning' | 'risk';
  emoji: string;
}

export const BEHAVIORAL_TAGS: BehavioralTagDefinition[] = [
  {
    id: "entered_too_soon",
    label: "Entered too soon",
    description: "Entered the trade before proper confirmation or setup completion",
    category: "entry",
    emoji: "⏰"
  },
  {
    id: "entered_too_late", 
    label: "Entered too late",
    description: "Missed the optimal entry point and entered at worse price",
    category: "entry",
    emoji: "🐌"
  },
  {
    id: "exited_too_soon",
    label: "Exited too soon",
    description: "Closed the trade prematurely due to fear or impatience",
    category: "exit",
    emoji: "😰"
  },
  {
    id: "exited_too_late",
    label: "Exited too late", 
    description: "Held the trade too long, missing optimal exit point",
    category: "exit",
    emoji: "🕰️"
  },
  {
    id: "not_in_trading_plan",
    label: "Not in trading plan",
    description: "This trade was not part of the original trading plan",
    category: "planning",
    emoji: "📋"
  },
  {
    id: "incorrect_stop_placement",
    label: "Incorrect stop placement",
    description: "Stop loss was placed incorrectly (too tight/loose, wrong level)",
    category: "risk",
    emoji: "🛑"
  },
  {
    id: "wrong_size_trade",
    label: "Wrong size trade",
    description: "Position size was incorrect for the risk profile",
    category: "risk", 
    emoji: "📏"
  },
  {
    id: "didnt_take_planned_trade",
    label: "Didn't take planned trade",
    description: "Failed to execute a trade that was in the plan",
    category: "planning",
    emoji: "😔"
  }
];

export const getBehavioralTagById = (id: BehavioralTag): BehavioralTagDefinition | undefined => {
  return BEHAVIORAL_TAGS.find(tag => tag.id === id);
};

export const getBehavioralTagsByCategory = (category: BehavioralTagDefinition['category']): BehavioralTagDefinition[] => {
  return BEHAVIORAL_TAGS.filter(tag => tag.category === category);
};