
import { z } from 'zod';

export const tradeFormSchema = z.object({
  tradeId: z.string().optional(),
  instrument: z.string().min(1, "Instrument is required"),
  entryPrice: z.string().min(1, "Entry price is required"),
  exitPrice: z.string().min(1, "Exit price is required"),
  slPrice: z.string().min(1, "Stop loss price is required"),
  tp1Price: z.string().optional(),
  tp2Price: z.string().optional(),
  tp3Price: z.string().optional(),
  entryDate: z.date({
    required_error: "Entry date is required",
  }),
  exitDate: z.date().optional(),
  entryTime: z.string().min(1, "Entry time is required"),
  exitTime: z.string().min(1, "Exit time is required"),
  entryTimezone: z.string().default('UTC'),
  exitTimezone: z.string().default('UTC'),
  direction: z.enum(["Long", "Short"]),
  entryTimeframe: z.string().min(1, "Entry timeframe is required"),
  htfTimeframe: z.string().min(1, "HTF timeframe is required"),
  slPips: z.string().default("0"),
  confidenceRating: z.number().min(1).max(10).default(5),
  tags: z.array(z.string()).default([]),
  didHitBE: z.boolean().default(false),
  tpHitAfterBE: z.boolean().default(false),
  reversedAfterBE: z.boolean().default(false),
  tpHit: z.enum(["none", "tp1", "tp2", "tp3"]).default("none"),
  strategyId: z.string().optional(), // Optional - can be None/empty
  accountId: z.string().optional(), // Add accountId field for account assignment
  // Add session explicitly 
  session: z.string().optional(),
  // Other properties
  entryType: z.string().optional(),
  obType: z.string().optional(),
  marketStructure: z.string().optional(),
  liquidityContext: z.string().optional(),
  exitReason: z.string().optional(),
  slLogic: z.string().optional(),
  tpLogic: z.string().optional(),
  notes: z.string().optional(), // Add notes field to the schema
  // New fields for drawdown analysis
  maxDrawdown: z.number().optional(),
  recoveryTime: z.number().optional(),
  drawdownDuration: z.number().optional(),
  // New field for risk amount
  riskAmount: z.string().optional(),
  // Behavioral tags for tracking trading mistakes
  behavioralTags: z.array(z.string()).default([]),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;
