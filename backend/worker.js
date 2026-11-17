
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // HOME ROUTE
    if (request.method === "GET" && path === "/") {
      return jsonResponse({
        name: "SENTINEL AI",
        status: "online",
        version: "1.0",
        message: "Sentinel AI backend is running."
      });
    }

    // HEALTH ROUTES
    if (
      request.method === "GET" &&
      (path === "/health" || path === "/api/health")
    ) {
      return jsonResponse({
        status: "online",
        service: "Sentinel AI",
        message: "Health check successful."
      });
    }

    // AI CHAT ROUTES
    if (
      request.method === "POST" &&
      (path === "/api/chat" || path === "/chat")
    ) {
      try {
        const body = await request.json();

        const messages = Array.isArray(body.messages)
          ? body.messages
          : [
              {
                role: "user",
                content: body.message || body.prompt || ""
              }
            ];

        if (!messages.length) {
          return jsonResponse({
            error: "Please provide a message."
          }, 400);
        }

        if (!env.AI) {
          return jsonResponse({
            error: "AI binding is not configured."
          }, 500);
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages
          }
        );

        return jsonResponse({
          success: true,
          response: result.response || "",
          result
        });

      } catch (error) {
        return jsonResponse({
          success: false,
          error: error.message || "AI processing failed."
        }, 500);
      }
    }

    // UNKNOWN ROUTES
    return jsonResponse({
      error: "Route not found",
      path
    }, 404);
  }
};
