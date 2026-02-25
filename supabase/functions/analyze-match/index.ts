import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frames } = await req.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(JSON.stringify({ error: "No frames provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build image content parts from base64 frames
    const imageParts = frames.slice(0, 8).map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame },
    }));

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a professional table tennis match analyst. You are given frames extracted from a short table tennis match video clip (1-2 minutes).

Analyze the frames carefully and provide match analysis. You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:

{
  "totalRallies": <number, estimated total rallies>,
  "avgRallyLength": <number, estimated average rally length in seconds>,
  "longestRally": <number, estimated longest rally in seconds>,
  "player1Score": <number, estimated score for player on left/near side>,
  "player2Score": <number, estimated score for player on right/far side>,
  "serveSpeed": "<string, estimated serve speed like '~40 km/h'>",
  "topspinShots": <number, estimated topspin shots>,
  "backhandWinners": <number, estimated backhand winners>,
  "forehandWinners": <number, estimated forehand winners>,
  "netPoints": <number, estimated net/short game points>,
  "unforcedErrors": <number, errors made without pressure from opponent>,
  "forcedErrors": <number, errors caused by opponent's good shot>,
  "underPressureErrors": <number, errors made while under heavy pressure>,
  "tacticalErrors": <number, wrong shot selection decisions>,
  "pointsWon": <number, total points won by player 1>,
  "pointsLost": <number, total points lost by player 1>,
  "pointsWonOnServe": <number, points won when player 1 served>,
  "pointsWonOnReturn": <number, points won when opponent served>,
  "fhForcedErrorsCreated": <number, forced errors created via forehand>,
  "fhOpeningAttacks": <number, forehand opening attacks attempted>,
  "fhOpeningAttackSuccess": <number, percentage of successful FH opening attacks>,
  "bhOpeningAttacks": <number, backhand opening attacks attempted>,
  "bhOpeningAttackSuccess": <number, percentage of successful BH opening attacks>,
  "summary": "<string, 2-3 sentence summary of the match dynamics, playing styles, and key observations>"
}

Base your estimates on what you can observe: player positions, ball trajectory, stroke types, body mechanics, table setup, scoreboard if visible. Be reasonable with estimates. If you cannot determine something precisely, provide your best estimate based on the visual evidence.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze these frames from a table tennis match video. Provide detailed match statistics.",
                },
                ...imageParts,
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from AI response
    let analysis;
    try {
      // Strip markdown code blocks if present
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
