import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convexApi";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token directly from cookies
    const authToken = request.cookies.get('convex-auth-token')?.value;

    if (!authToken) {
      return Response.json({
        success: false,
        error: "Not authenticated"
      }, { status: 401 });
    }

    // Just pass the token directly to the extension
    return Response.json({
      success: true,
      token: authToken
    });

  } catch (error) {
    console.error("Token sharing error:", error);
    return Response.json({
      success: false,
      error: "Token sharing failed"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, googleToken } = body;

    // Handle Google token exchange from Chrome extension
    if (googleToken) {
      console.log("🔐 Processing Google token from Chrome extension...");

      // Validate Google token
      const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleToken}`);
      if (!googleResponse.ok) {
        return Response.json({
          success: false,
          error: "Invalid Google token"
        }, { status: 401 });
      }

      const googleUser = await googleResponse.json();
      if (!googleUser.email || !googleUser.verified_email) {
        return Response.json({
          success: false,
          error: "Google account email not verified"
        }, { status: 401 });
      }

      // Create Convex client and try to authenticate
      const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

      try {
        // Use Convex Auth to sign in with Google
        const authResult = await client.action(api.auth.signIn, {
          provider: "google",
          params: {
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            picture: googleUser.picture,
            id: googleUser.id,
          },
        });

        if (authResult?.tokens?.token) {
          console.log('✅ Google auth successful for extension user:', googleUser.email);

          return Response.json({
            success: true,
            token: authResult.tokens.token,
            user: {
              email: googleUser.email,
              name: googleUser.name,
              picture: googleUser.picture,
            }
          });
        }
      } catch (convexError) {
        console.log('Convex Google auth failed, trying manual approach:', convexError);
      }

      // If Convex Auth fails, return error directing to web app
      return Response.json({
        success: false,
        error: "Please sign in at the web app first, then the extension will sync automatically.",
        requiresWebApp: true,
        webAppUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://applyingmyself.com"
      }, { status: 400 });
    }

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