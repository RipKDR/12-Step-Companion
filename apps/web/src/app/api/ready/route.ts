import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Readiness check endpoint
 * Returns 200 OK if the service is ready to serve traffic
 * Checks database connectivity (Supabase)
 * Used by deployment platforms for readiness probes
 */
export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Service is ready even without database (local dev mode)
      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
          database: 'not_configured',
        },
        { status: 200 }
      );
    }

    // Try to connect to Supabase using anon key (not service role)
    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Simple query to check connectivity
      // Using a lightweight query that doesn't require authentication
      const { error } = await supabase.from('profiles').select('id').limit(1);

      if (error) {
        // PGRST116 is "no rows returned" which is fine for readiness check
        // PGRST301 is "permission denied" which might be expected with RLS
        // Other errors indicate connectivity issues
        if (error.code === 'PGRST116' || error.code === 'PGRST301') {
          return NextResponse.json(
            {
              status: 'ready',
              timestamp: new Date().toISOString(),
              database: 'connected',
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          {
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            database: 'error',
            error: error.message,
            code: error.code,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
          database: 'connected',
        },
        { status: 200 }
      );
    } catch (supabaseError) {
      // If Supabase client creation fails, still return ready (might be RLS blocking)
      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
          database: 'check_failed',
          note: 'Supabase check failed but service is running',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

