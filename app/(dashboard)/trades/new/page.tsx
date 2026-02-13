// app/(dashboard)/trades/new/page.tsx
// Complete form for creating a new trade

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Setup, Session } from '@/lib/types';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function NewTradePage() {
  const router = useRouter();
  const [setups, setSetups] = useState<Setup[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const [formData, setFormData] = useState({
    symbol: '',
    asset_type: 'crypto',
    trade_date: new Date().toISOString().split('T')[0],
    trade_time: new Date().toTimeString().slice(0, 5),
    session_id: '',
    htf_timeframe: '4H',
    ltf_timeframe: '15M',
    setup_id: '',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    position_size: '',
    risk_reward: '',
    result: 'open',
    exit_price: '',
    emotion: 'calm',
    notes: '',
    screenshot_before: '',
    screenshot_after: '',
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  // Auto-calculate risk:reward when prices change
  useEffect(() => {
    calculateRR();
  }, [formData.entry_price, formData.stop_loss, formData.take_profit]);

  const fetchOptions = async () => {
    const supabase = createClient();
    const [setupsRes, sessionsRes] = await Promise.all([
      supabase.from('setups').select('*').order('name'),
      supabase.from('sessions').select('*').order('start_time'),
    ]);

    if (setupsRes.data) setSetups(setupsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
  };

  const calculateRR = () => {
    const entry = parseFloat(formData.entry_price);
    const sl = parseFloat(formData.stop_loss);
    const tp = parseFloat(formData.take_profit);

    if (entry && sl && tp) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      const rr = reward / risk;
      setFormData(prev => ({ ...prev, risk_reward: rr.toFixed(2) }));
    }
  };

  const handleFileUpload = async (file: File, type: 'before' | 'after') => {
    const setUploading = type === 'before' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          [`screenshot_${type}`]: data.url,
        }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/trades');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create trade');
      }
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Failed to create trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/trades" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">New Trade</h1>
          <p className="text-text-secondary mt-1">
            Log a new trade with all details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="input w-full"
                placeholder="BTC/USD"
                required
              />
            </div>
            <div>
              <label className="label">Asset Type</label>
              <select
                value={formData.asset_type}
                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                className="input w-full"
                required
              >
                <option value="crypto">Crypto</option>
                <option value="stock">Stock</option>
                <option value="forex">Forex</option>
                <option value="futures">Futures</option>
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.trade_date}
                onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                value={formData.trade_time}
                onChange={(e) => setFormData({ ...formData, trade_time: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Timeframes & Setup */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Timeframes & Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">HTF Timeframe</label>
              <select
                value={formData.htf_timeframe}
                onChange={(e) => setFormData({ ...formData, htf_timeframe: e.target.value })}
                className="input w-full"
                required
              >
                <option value="1D">1 Day</option>
                <option value="4H">4 Hour</option>
                <option value="1H">1 Hour</option>
                <option value="15M">15 Min</option>
              </select>
            </div>
            <div>
              <label className="label">LTF Timeframe</label>
              <select
                value={formData.ltf_timeframe}
                onChange={(e) => setFormData({ ...formData, ltf_timeframe: e.target.value })}
                className="input w-full"
                required
              >
                <option value="1H">1 Hour</option>
                <option value="15M">15 Min</option>
                <option value="5M">5 Min</option>
                <option value="1M">1 Min</option>
              </select>
            </div>
            <div>
              <label className="label">Setup</label>
              <select
                value={formData.setup_id}
                onChange={(e) => setFormData({ ...formData, setup_id: e.target.value })}
                className="input w-full"
              >
                <option value="">Select setup...</option>
                {setups.map((setup) => (
                  <option key={setup.id} value={setup.id}>
                    {setup.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Session</label>
              <select
                value={formData.session_id}
                onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                className="input w-full"
              >
                <option value="">Select session...</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Trade Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Entry Price</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.entry_price}
                onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="label">Position Size</label>
              <input
                type="number"
                step="0.01"
                value={formData.position_size}
                onChange={(e) => setFormData({ ...formData, position_size: e.target.value })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="label">Stop Loss</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.stop_loss}
                onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="label">Take Profit</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.take_profit}
                onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="label">Risk:Reward (Auto-calculated)</label>
              <input
                type="text"
                value={formData.risk_reward ? `1:${formData.risk_reward}` : ''}
                className="input w-full bg-surface-hover"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Result & Psychology */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Result & Psychology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Result</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                className="input w-full"
                required
              >
                <option value="open">Open</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="breakeven">Breakeven</option>
              </select>
            </div>
            {formData.result !== 'open' && (
              <div>
                <label className="label">Exit Price</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.exit_price}
                  onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
                  className="input w-full"
                  placeholder="0.00"
                />
              </div>
            )}
            <div>
              <label className="label">Emotion</label>
              <select
                value={formData.emotion}
                onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                className="input w-full"
              >
                <option value="calm">Calm</option>
                <option value="confident">Confident</option>
                <option value="fearful">Fearful</option>
                <option value="greedy">Greedy</option>
                <option value="fomo">FOMO</option>
                <option value="revenge">Revenge</option>
                <option value="uncertain">Uncertain</option>
                <option value="disciplined">Disciplined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input w-full"
            rows={3}
            placeholder="Trade notes, observations, what you learned..."
          />
        </div>

        {/* Screenshots */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before screenshot */}
            <div>
              <label className="label">Before</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {formData.screenshot_before ? (
                  <div className="relative">
                    <img
                      src={formData.screenshot_before}
                      alt="Before"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenshot_before: '' })}
                      className="absolute top-2 right-2 btn-danger p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                    <p className="text-sm text-text-secondary">
                      {uploadingBefore ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'before')}
                      disabled={uploadingBefore}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* After screenshot */}
            <div>
              <label className="label">After</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {formData.screenshot_after ? (
                  <div className="relative">
                    <img
                      src={formData.screenshot_after}
                      alt="After"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenshot_after: '' })}
                      className="absolute top-2 right-2 btn-danger p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                    <p className="text-sm text-text-secondary">
                      {uploadingAfter ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'after')}
                      disabled={uploadingAfter}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Trade'}
          </button>
          <Link href="/trades" className="btn-secondary px-6">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
