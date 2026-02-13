'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trade } from '@/lib/types';
import { formatDate, formatTime, formatR, cn } from '@/lib/utils';
import { Plus, Filter, Search, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      const data = await response.json();
      setTrades(data.trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) return;

    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrades((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Failed to delete trade');
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade');
    }
  };

  const filteredTrades = trades.filter((trade) =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResultIcon = (result: string) => {
    if (result === 'win') return <TrendingUp className="w-4 h-4" />;
    if (result === 'loss') return <TrendingDown className="w-4 h-4" />;
    if (result === 'breakeven') return <Minus className="w-4 h-4" />;
    return null;
  };

  const getResultBadgeClass = (result: string) => {
    if (result === 'win') return 'badge-success';
    if (result === 'loss') return 'badge-danger';
    if (result === 'breakeven') return 'badge-warning';
    return 'badge-primary';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Trades</h1>
          <p className="text-text-secondary mt-1">
            Track and manage your trading history
          </p>
        </div>
        <Link href="/trades/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Trade
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading trades...</div>
        ) : (
          <table className="w-full">
            <tbody>
              {filteredTrades.map((trade) => {
                const r = trade.r_multiple ?? null;

                return (
                  <tr key={trade.id} className="hover:bg-surface-hover">
                    <td>{formatDate(trade.trade_date)}</td>
                    <td>{trade.symbol}</td>
                    <td>{trade.result}</td>

                    <td>
                      {r !== null && (
                        <span
                          className={cn(
                            'font-bold',
                            r > 0 ? 'text-success' : r < 0 ? 'text-danger' : 'text-text-secondary'
                          )}
                        >
                          {formatR(r)}
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        className="btn-ghost p-2 text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
