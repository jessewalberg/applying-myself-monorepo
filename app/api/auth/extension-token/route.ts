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
      const { token } = await request.json();
      
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
      console.error("Set extension token error:", error);
      return Response.json({ 
        success: false, 
        error: "Failed to set token" 
      }, { status: 500 });
    }
  }