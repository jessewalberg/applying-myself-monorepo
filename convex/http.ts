import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add Convex Auth routes
auth.addHttpRoutes(http);

// Stripe webhook endpoint
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe signature", { status: 400 });
    }

    try {
      const body = await request.text();
      
      // In a real implementation, you'd verify the webhook signature
      // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      // For now, just parse the body as JSON
      const event = JSON.parse(body);
      
      switch (event.type) {
        case "checkout.session.completed":
          // Handle successful payment
          console.log("Payment completed:", event.data.object);
          break;
          
        case "customer.subscription.updated":
          // Handle subscription changes
          console.log("Subscription updated:", event.data.object);
          break;
          
        case "customer.subscription.deleted":
          // Handle subscription cancellation
          console.log("Subscription cancelled:", event.data.object);
          break;
          
        default:
          console.log("Unhandled event type:", event.type);
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook error", { status: 400 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }),
});

// CORS preflight handler
http.route({
  path: "/cors",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

export default http;
