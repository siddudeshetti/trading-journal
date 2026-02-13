// app/api/trades/[id]/route.ts
// API endpoints for updating and deleting individual trades

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/trades/[id]
 * Update an existing trade
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const tradeId = params.id;

    // Calculate R-multiple if updating exit details
    let rMultiple = body.r_multiple;
    if (body.result !== 'open' && body.exit_price && body.entry_price && body.stop_loss) {
      const entryPrice = parseFloat(body.entry_price);
      const exitPrice = parseFloat(body.exit_price);
      const stopLoss = parseFloat(body.stop_loss);
      
      const riskPerShare = Math.abs(entryPrice - stopLoss);
      const profitPerShare = exitPrice - entryPrice;
      
      if (riskPerShare > 0) {
        rMultiple = profitPerShare / riskPerShare;
      }
    }

    // Update trade
    const { data: trade, error } = await supabase
      .from('trades')
      .update({
        ...body,
        r_multiple: rMultiple,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json({ trade }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update trade' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id]
 * Delete a trade
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeId = params.id;

    // Delete trade (RLS ensures user can only delete own trades)
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Trade deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete trade' },
      { status: 500 }
    );
  }
}
