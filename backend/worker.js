
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    if (url.pathname === "/") {
      return respond({
        name: "SENTINEL AI",
        status: "online",
        version: "1.0"
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.message || typeof body.message !== "string") {
          return respond({ error: "A message is required." }, 400);
        }

        if (!env.AI) {
          return respond({
            error: "AI service is not connected yet."
          }, 503);
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content: "You are SENTINEL, a helpful and responsible AI assistant."
              },
              {
                role: "user",
                content: body.message
              }
            ]
          }
        );

        return respond({
          success: true,
          reply: result.response
        });

      } catch (error) {
        return respond({
          error: "Unable to process your request."
        }, 500);
      }
    }

    return respond({ error: "Endpoint not found." }, 404);
  }
};
          
