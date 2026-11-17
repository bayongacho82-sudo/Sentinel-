
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return respond({
        status: "online",
        assistant: "SENTINEL"
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message || typeof message !== "string") {
          return respond({ error: "Message is required" }, 400);
        }

        if (!env.AI) {
          return respond({
            error: "AI binding is not configured"
          }, 503);
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content: "You are SENTINEL, a helpful and intelligent AI assistant. Be clear, useful and safety-conscious."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return respond({
          assistant: "SENTINEL",
          reply: result.response || "No response received."
        });

      } catch (error) {
        return respond({
          error: "Unable to process request."
        }, 500);
      }
    }

    return respond({
      assistant: "SENTINEL",
      message: "Sentinel backend is running."
    });
  }
};
