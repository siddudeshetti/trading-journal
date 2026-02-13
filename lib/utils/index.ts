// lib/utils/index.ts
// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format R-multiple values
 */
export function formatR(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(`2000-01-01T${time}`));
}

/**
 * Calculate comprehensive analytics from trades
 */
export function calculateAnalytics(trades: any[]): any {
  // Import types inline to avoid circular dependencies
  const closedTrades = trades.filter(t => t.result !== 'open' && t.r_multiple !== null);
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgWinR: 0,
      avgLossR: 0,
      expectancy: 0,
      totalR: 0,
      largestWin: 0,
      largestLoss: 0,
      bySetup: [],
      bySession: [],
      byEmotion: [],
      equityCurve: [],
    };
  }

  const wins = closedTrades.filter(t => t.result === 'win');
  const losses = closedTrades.filter(t => t.result === 'loss');
  
  const totalR = closedTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
  const winRate = (wins.length / closedTrades.length) * 100;
  
  const avgWinR = wins.length > 0
    ? wins.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / wins.length
    : 0;
  
  const avgLossR = losses.length > 0
    ? losses.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / losses.length
    : 0;
  
  const expectancy = (winRate / 100) * avgWinR + ((100 - winRate) / 100) * avgLossR;
  
  const largestWin = wins.length > 0
    ? Math.max(...wins.map(t => t.r_multiple || 0))
    : 0;
  
  const largestLoss = losses.length > 0
    ? Math.min(...losses.map(t => t.r_multiple || 0))
    : 0;

  // Calculate equity curve
  const sortedTrades = [...closedTrades].sort((a, b) => 
    new Date(a.trade_date + ' ' + a.trade_time).getTime() - 
    new Date(b.trade_date + ' ' + b.trade_time).getTime()
  );

  let cumulativeR = 0;
  const equityCurve = sortedTrades.map(trade => {
    cumulativeR += trade.r_multiple || 0;
    return {
      date: trade.trade_date,
      cumulativeR,
      trade,
    };
  });

  // Performance by setup
  const setupMap = new Map();
  closedTrades.forEach(trade => {
    if (trade.setup_id && trade.setup) {
      const key = trade.setup_id;
      if (!setupMap.has(key)) {
        setupMap.set(key, []);
      }
      setupMap.get(key).push(trade);
    }
  });

  const bySetup = Array.from(setupMap.entries()).map(([_, setupTrades]) => {
    const setupWins = setupTrades.filter((t: any) => t.result === 'win');
    const setupTotalR = setupTrades.reduce((sum: number, t: any) => sum + (t.r_multiple || 0), 0);
    
    return {
      setup: setupTrades[0].setup,
      trades: setupTrades.length,
      winRate: (setupWins.length / setupTrades.length) * 100,
      avgR: setupTotalR / setupTrades.length,
      totalR: setupTotalR,
    };
  }).sort((a, b) => b.totalR - a.totalR);

  // Performance by session
  const sessionMap = new Map();
  closedTrades.forEach(trade => {
    if (trade.session_id && trade.session) {
      const key = trade.session_id;
      if (!sessionMap.has(key)) {
        sessionMap.set(key, []);
      }
      sessionMap.get(key).push(trade);
    }
  });

  const bySession = Array.from(sessionMap.entries()).map(([_, sessionTrades]) => {
    const sessionWins = sessionTrades.filter((t: any) => t.result === 'win');
    const sessionTotalR = sessionTrades.reduce((sum: number, t: any) => sum + (t.r_multiple || 0), 0);
    
    return {
      session: sessionTrades[0].session,
      trades: sessionTrades.length,
      winRate: (sessionWins.length / sessionTrades.length) * 100,
      avgR: sessionTotalR / sessionTrades.length,
      totalR: sessionTotalR,
    };
  }).sort((a, b) => b.totalR - a.totalR);

  // Performance by emotion
  const emotionMap = new Map();
  closedTrades.forEach(trade => {
    if (trade.emotion) {
      const key = trade.emotion;
      if (!emotionMap.has(key)) {
        emotionMap.set(key, []);
      }
      emotionMap.get(key).push(trade);
    }
  });

  const byEmotion = Array.from(emotionMap.entries()).map(([emotion, emotionTrades]) => {
    const emotionWins = emotionTrades.filter((t: any) => t.result === 'win');
    const emotionTotalR = emotionTrades.reduce((sum: number, t: any) => sum + (t.r_multiple || 0), 0);
    
    return {
      emotion: emotion,
      trades: emotionTrades.length,
      winRate: (emotionWins.length / emotionTrades.length) * 100,
      avgR: emotionTotalR / emotionTrades.length,
    };
  }).sort((a, b) => b.avgR - a.avgR);

  return {
    totalTrades: closedTrades.length,
    winRate,
    avgWinR,
    avgLossR,
    expectancy,
    totalR,
    largestWin,
    largestLoss,
    bySetup,
    bySession,
    byEmotion,
    equityCurve,
  };
}
