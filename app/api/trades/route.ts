// app/api/trades/route.ts
// API endpoints for listing and creating trades

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/trades
 * Fetch all trades for the authenticated user
 * Supports filtering via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const symbol = searchParams.get('symbol');
    const setupId = searchParams.get('setupId');
    const sessionId = searchParams.get('sessionId');
    const result = searchParams.get('result');

    // Build query with joined data
    let query = supabase
      .from('trades')
      .select(`
        *,
        setup:setups(*),
        session:sessions(*)
      `)
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })
      .order('trade_time', { ascending: false });

    // Apply filters if provided
    if (startDate) {
      query = query.gte('trade_date', startDate);
    }
    if (endDate) {
      query = query.lte('trade_date', endDate);
    }
    if (symbol) {
      query = query.ilike('symbol', `%${symbol}%`);
    }
    if (setupId) {
      query = query.eq('setup_id', setupId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (result) {
      query = query.eq('result', result);
    }

    const { data: trades, error } = await query;

    if (error) throw error;

    return NextResponse.json({ trades }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trades
 * Create a new trade
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'symbol',
      'asset_type',
      'trade_date',
      'trade_time',
      'htf_timeframe',
      'ltf_timeframe',
      'entry_price',
      'stop_loss',
      'take_profit',
      'position_size',
      'risk_reward',
      'result',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate R-multiple if result is not open
    let rMultiple = null;
    if (body.result !== 'open' && body.exit_price) {
      const entryPrice = parseFloat(body.entry_price);
      const exitPrice = parseFloat(body.exit_price);
      const stopLoss = parseFloat(body.stop_loss);
      
      const riskPerShare = Math.abs(entryPrice - stopLoss);
      const profitPerShare = exitPrice - entryPrice;
      
      if (riskPerShare > 0) {
        rMultiple = profitPerShare / riskPerShare;
      }
    }

    // Insert trade
    const { data: trade, error } = await supabase
      .from('trades')
      .insert([
        {
          user_id: user.id,
          symbol: body.symbol,
          asset_type: body.asset_type,
          trade_date: body.trade_date,
          trade_time: body.trade_time,
          session_id: body.session_id || null,
          htf_timeframe: body.htf_timeframe,
          ltf_timeframe: body.ltf_timeframe,
          setup_id: body.setup_id || null,
          entry_price: body.entry_price,
          stop_loss: body.stop_loss,
          take_profit: body.take_profit,
          position_size: body.position_size,
          risk_reward: body.risk_reward,
          risk_amount: body.risk_amount || null,
          result: body.result,
          exit_price: body.exit_price || null,
          r_multiple: rMultiple,
          pnl: body.pnl || null,
          emotion: body.emotion || null,
          notes: body.notes || null,
          screenshot_before: body.screenshot_before || null,
          screenshot_after: body.screenshot_after || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create trade' },
      { status: 500 }
    );
  }
}
