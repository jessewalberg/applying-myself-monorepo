import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convexApi";

export async function GET() {
  try {
    console.log('🔍 Extension token sync request received');

    // Since Convex Auth doesn't use cookies, we need to check if there's a way
    // to access the current auth state from the server side.
    // For now, return an error explaining the limitation

    return Response.json({
      success: false,
      error: "Server-side token access not available",
      message: "Convex Auth stores tokens in browser localStorage, which Chrome extensions cannot access. Please use Google Sign-In in the extension instead.",
      suggestion: "Use the Google Sign-In button in the extension to authenticate directly."
    }, { status: 401 });

  } catch (error) {
    console.error("Extension token sync error:", error);
    return Response.json({
      success: false,
      error: "Failed to sync token"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Handle regular token validation (existing functionality)
    if (!token) {
      return Response.json({
        success: false,
        error: "No token provided"
      }, { status: 400 });
    }

    // Validate the token by testing it with Convex
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    client.setAuth(token);

    try {
      // Test if token is valid by getting user profile
      const userProfile = await client.query(api.userHelpers.getUserProfile);

      // Token is valid, set it in cookies for the web app
      const response = NextResponse.json({
        success: true,
        user: {
          email: userProfile.email,
          name: userProfile.name,
          plan: userProfile.plan
        }
      });

      // Set the auth cookie (same format as Convex Auth uses)
      response.cookies.set('convex-auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      console.log('✅ Set auth token from extension for user:', userProfile.email);
      return response;

    } catch (convexError) {
      console.error('Invalid token from extension:', convexError);
      return Response.json({
        success: false,
        error: "Invalid token"
      }, { status: 401 });
    }

  } catch (error) {
    console.error("Extension token processing error:", error);
    return Response.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}