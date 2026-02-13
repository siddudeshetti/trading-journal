// app/(dashboard)/analytics/page.tsx
// Complete analytics dashboard with charts and metrics

'use client';

import { useState, useEffect } from 'react';
import { formatR, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Analytics {
  totalTrades: number;
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  expectancy: number;
  totalR: number;
  largestWin: number;
  largestLoss: number;
  bySetup: any[];
  bySession: any[];
  byEmotion: any[];
  equityCurve: any[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, 30d, 7d

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      let url = '/api/analytics';
      
      // Add date filters based on timeframe
      if (timeframe === '30d') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        url += `?startDate=${date.toISOString().split('T')[0]}`;
      } else if (timeframe === '7d') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        url += `?startDate=${date.toISOString().split('T')[0]}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Trades',
      value: analytics.totalTrades.toString(),
      icon: BarChart3,
      color: 'primary',
    },
    {
      title: 'Win Rate',
      value: formatPercentage(analytics.winRate),
      icon: Target,
      color: 'success',
    },
    {
      title: 'Expectancy',
      value: formatR(analytics.expectancy),
      icon: Activity,
      color: analytics.expectancy > 0 ? 'success' : 'danger',
    },
    {
      title: 'Total R',
      value: formatR(analytics.totalR),
      icon: analytics.totalR > 0 ? TrendingUp : TrendingDown,
      color: analytics.totalR > 0 ? 'success' : 'danger',
    },
    {
      title: 'Avg Win',
      value: formatR(analytics.avgWinR),
      icon: TrendingUp,
      color: 'success',
    },
    {
      title: 'Avg Loss',
      value: formatR(analytics.avgLossR),
      icon: TrendingDown,
      color: 'danger',
    },
  ];

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
          <p className="text-text-secondary mt-1">
            Analyze your trading performance
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="glass-card p-1 flex gap-1">
          {['7d', '30d', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-primary text-white shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tf === 'all' ? 'All Time' : tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Check if we have data */}
      {analytics.totalTrades === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
          <p className="text-text-secondary">
            Add some closed trades (not open) to see your performance metrics
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="stat-card animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-text-secondary text-sm font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold text-${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}/20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Equity curve */}
          {analytics.equityCurve.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">Equity Curve</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 36, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeR"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance by setup and session */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Setup */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">Performance by Setup</h2>
              {analytics.bySetup.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No setup data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.bySetup}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="setup.name"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.5)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.5)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 26, 36, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="totalR" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By Session */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">Performance by Session</h2>
              {analytics.bySession.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No session data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.bySession}
                      dataKey="totalR"
                      nameKey="session.name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.session.name}: ${formatR(entry.totalR)}`}
                    >
                      {analytics.bySession.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 26, 36, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Setup performance details */}
          {analytics.bySetup.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">Setup Details</h2>
              <div className="space-y-3">
                {analytics.bySetup.map((setup, index) => (
                  <div
                    key={index}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: setup.setup.color }}
                      />
                      <div>
                        <p className="font-medium text-text-primary">{setup.setup.name}</p>
                        <p className="text-sm text-text-tertiary">
                          {setup.trades} trades • {formatPercentage(setup.winRate)} win rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${setup.totalR > 0 ? 'text-success' : 'text-danger'}`}>
                        {formatR(setup.totalR)}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        Avg: {formatR(setup.avgR)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotion analysis */}
          {analytics.byEmotion.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">Performance by Emotion</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.byEmotion.map((emotion, index) => (
                  <div key={index} className="bg-surface-hover p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-secondary capitalize">
                        {emotion.emotion}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {emotion.trades} trades
                      </span>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${emotion.avgR > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatR(emotion.avgR)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {formatPercentage(emotion.winRate)} win rate
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
