// lib/types/index.ts
// Type definitions for the Trading Journal app

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  default_risk_per_trade: number;
  default_risk_reward: number;
  created_at: string;
  updated_at: string;
}

export interface Setup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
}

export type AssetType = 'crypto' | 'stock' | 'forex' | 'futures';
export type TradeResult = 'win' | 'loss' | 'breakeven' | 'open';
export type EmotionType = 'calm' | 'confident' | 'fearful' | 'greedy' | 'fomo' | 'revenge' | 'uncertain' | 'disciplined';

export interface Trade {
  id: string;
  user_id: string;
  
  // Trade Identification
  symbol: string;
  asset_type: AssetType;
  
  // Timing
  trade_date: string;
  trade_time: string;
  session_id?: string;
  
  // Timeframes
  htf_timeframe: string;
  ltf_timeframe: string;
  
  // Setup
  setup_id?: string;
  
  // Entry Details
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  
  // Risk Management
  risk_reward: number;
  risk_amount?: number;
  
  // Result
  result: TradeResult;
  exit_price?: number;
  r_multiple?: number;
  pnl?: number;
  
  // Psychology
  emotion?: EmotionType;
  notes?: string;
  
  // Screenshots
  screenshot_before?: string;
  screenshot_after?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined data (populated from queries)
  setup?: Setup;
  session?: Session;
}

export interface Analytics {
  totalTrades: number;
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  expectancy: number;
  totalR: number;
  largestWin: number;
  largestLoss: number;
  avgHoldTime?: number;
  
  // Performance breakdowns
  bySetup: SetupPerformance[];
  bySession: SessionPerformance[];
  byEmotion: EmotionPerformance[];
  
  // Equity curve data
  equityCurve: EquityCurvePoint[];
}

export interface SetupPerformance {
  setup: Setup;
  trades: number;
  winRate: number;
  avgR: number;
  totalR: number;
}

export interface SessionPerformance {
  session: Session;
  trades: number;
  winRate: number;
  avgR: number;
  totalR: number;
}

export interface EmotionPerformance {
  emotion: EmotionType;
  trades: number;
  winRate: number;
  avgR: number;
}

export interface EquityCurvePoint {
  date: string;
  cumulativeR: number;
  trade?: Trade;
}
