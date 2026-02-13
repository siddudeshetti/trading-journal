// app/api/analytics/route.ts
// API endpoint for analytics calculations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateAnalytics } from '@/lib/utils';

/**
 * GET /api/analytics
 * Calculate and return analytics for authenticated user's trades
 * Supports date filtering via query parameters
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

    // Build query with joined data
    let query = supabase
      .from('trades')
      .select(`
        *,
        setup:setups(*),
        session:sessions(*)
      `)
      .eq('user_id', user.id);

    // Apply date filters
    if (startDate) {
      query = query.gte('trade_date', startDate);
    }
    if (endDate) {
      query = query.lte('trade_date', endDate);
    }

    const { data: trades, error } = await query;

    if (error) throw error;

    // Calculate analytics using utility function
    const analytics = calculateAnalytics(trades || []);

    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
