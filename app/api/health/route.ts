import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test basic connection by trying to access Supabase
    const startTime = Date.now();
    
    // Try to access the auth service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    const authTime = Date.now() - startTime;
    
    // Try to make a simple query to test database connectivity
    // This will test if we can reach the database through the API
    const dbStartTime = Date.now();
    let dbData = null;
    let dbError = null;

    try {
      // Try a simple ping to the REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      });
      dbData = { status: response.status, ok: response.ok };
    } catch (error) {
      dbError = error instanceof Error ? error : new Error('Unknown error');
    }

    const dbTime = Date.now() - dbStartTime;

    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tests: {
        auth_service: {
          status: authError ? "error" : "success",
          response_time_ms: authTime,
          error: authError?.message || null,
          session_available: !!authData?.session
        },
        database_connection: {
          status: dbError ? "error" : "success", 
          response_time_ms: dbTime,
          error: dbError?.message || null,
          result: dbData || null
        }
      },
      environment: {
        url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        jwt_secret_configured: !!process.env.SUPABASE_JWT_SECRET
      }
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
    }, { status: 500 });
  }
}
