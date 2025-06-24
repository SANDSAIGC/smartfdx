import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test the connection by trying to get the current user
    const { data, error } = await supabase.auth.getUser();

    // Check if it's just a missing session (which is normal for unauthenticated users)
    const isAuthSessionMissing = error?.message?.includes("Auth session missing");

    if (error && !isAuthSessionMissing) {
      console.error("Supabase connection error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: "Failed to connect to Supabase"
      }, { status: 500 });
    }

    // Test basic Supabase client initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      user: data?.user ? "User authenticated" : "No user authenticated (normal for public access)",
      authStatus: isAuthSessionMissing ? "No session (expected for unauthenticated)" : "Session available",
      config: {
        url: supabaseUrl ? "✓ URL configured" : "✗ URL missing",
        key: supabaseKey ? "✓ Anon key configured" : "✗ Anon key missing"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Connection test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Failed to test Supabase connection"
    }, { status: 500 });
  }
}
