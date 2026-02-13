// app/(dashboard)/settings/page.tsx
// Complete settings page for managing setups, sessions, and profile

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Setup, Session, Profile } from '@/lib/types';
import { Plus, Edit, Trash2, Save, X, User } from 'lucide-react';

export default function SettingsPage() {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSetup, setEditingSetup] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const [setupsRes, sessionsRes, profileRes] = await Promise.all([
        supabase.from('setups').select('*').order('created_at'),
        supabase.from('sessions').select('*').order('start_time'),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ]);

      if (setupsRes.data) setSetups(setupsRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    }
    
    setLoading(false);
  };

  // Setup management
  const addSetup = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('setups')
      .insert([{
        user_id: user.id,
        name: 'New Setup',
        description: '',
        color: '#0ea5e9',
      }])
      .select()
      .single();

    if (data && !error) {
      setSetups([...setups, data]);
      setEditingSetup(data.id);
    }
  };

  const updateSetup = async (id: string, updates: Partial<Setup>) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('setups')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setSetups(setups.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const deleteSetup = async (id: string) => {
    if (!confirm('Delete this setup? Trades using this setup will not be deleted.')) return;

    const supabase = createClient();
    const { error } = await supabase.from('setups').delete().eq('id', id);

    if (!error) {
      setSetups(setups.filter(s => s.id !== id));
    }
  };

  // Profile management
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your trading setups and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Profile Settings</h2>
          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setEditingProfile(false)}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>

        {profile && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => updateProfile({ full_name: e.target.value })}
                  className="input w-full"
                  disabled={!editingProfile}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  className="input w-full bg-surface-hover"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Default Risk per Trade (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.default_risk_per_trade}
                  onChange={(e) => updateProfile({ default_risk_per_trade: parseFloat(e.target.value) })}
                  className="input w-full"
                  disabled={!editingProfile}
                />
              </div>
              <div>
                <label className="label">Default Risk:Reward</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.default_risk_reward}
                  onChange={(e) => updateProfile({ default_risk_reward: parseFloat(e.target.value) })}
                  className="input w-full"
                  disabled={!editingProfile}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trading Setups */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Trading Setups</h2>
          <button onClick={addSetup} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Setup
          </button>
        </div>

        <div className="space-y-3">
          {setups.map((setup) => (
            <div key={setup.id} className="glass-card p-4">
              {editingSetup === setup.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={setup.name}
                      onChange={(e) => updateSetup(setup.id, { name: e.target.value })}
                      className="input"
                      placeholder="Setup name"
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={setup.color}
                        onChange={(e) => updateSetup(setup.id, { color: e.target.value })}
                        className="input h-full w-20"
                      />
                      <input
                        type="text"
                        value={setup.color}
                        onChange={(e) => updateSetup(setup.id, { color: e.target.value })}
                        className="input flex-1"
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  <textarea
                    value={setup.description || ''}
                    onChange={(e) => updateSetup(setup.id, { description: e.target.value })}
                    className="input w-full"
                    placeholder="Description (optional)"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSetup(null)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Done
                    </button>
                    <button
                      onClick={() => setEditingSetup(null)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: setup.color }}
                    />
                    <div>
                      <p className="font-medium">{setup.name}</p>
                      {setup.description && (
                        <p className="text-sm text-text-secondary">{setup.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSetup(setup.id)}
                      className="btn-ghost p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSetup(setup.id)}
                      className="btn-ghost p-2 text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trading Sessions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Trading Sessions</h2>
          <p className="text-sm text-text-secondary">
            Your trading session times
          </p>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: session.color }}
                  />
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm text-text-secondary">
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-surface-hover rounded-lg">
          <p className="text-sm text-text-secondary">
            <strong>Note:</strong> Session times are based on UTC. Default sessions are created automatically when you sign up. You can customize them to match your trading schedule.
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-text-secondary">Member since</span>
            <span className="font-medium">
              {profile && new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-text-secondary">Total Setups</span>
            <span className="font-medium">{setups.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-text-secondary">Total Sessions</span>
            <span className="font-medium">{sessions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
