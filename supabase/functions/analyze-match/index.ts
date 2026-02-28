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
    const { frames, chunkIndex, totalChunks, startTime, endTime } = await req.json();

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
    const imageParts = frames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame },
    }));

    const chunkContext = totalChunks > 1
      ? `\n\nIMPORTANT: This is segment ${chunkIndex + 1} of ${totalChunks} (time ${Math.round(startTime)}s – ${Math.round(endTime)}s). Only report what happens in THIS segment. The results will be summed across all segments automatically. For "score", report ONLY the points scored in this segment (not cumulative). Be thorough — count EVERY rally and point in these frames.`
      : "";

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
              content: `You are a professional table tennis match analyst. You are given frames extracted from a table tennis match video.

Player 1 = left/near side of the table at the START of the video. Player 2 = right/far side at the START.

PLAYER IDENTIFICATION: Look at the t-shirt/clothing color of each player. Report the dominant clothing color for each player (e.g. "red", "yellow", "blue", "white", "black"). This helps label them throughout the match.

PLAYER POSITION: Determine each player's position relative to the camera. If the camera is filming from the side, report "left" or "right". If the camera is filming from behind one end, report "near" (closer to camera) or "far" (further from camera). This is the STARTING position at the beginning of the video.

IMPORTANT TABLE TENNIS RULES:
- A game (set) is played to 11 points, and must be won by a 2-point margin.
- After each game ends, players SWITCH SIDES. So if Player 1 was on the left, after the first game Player 1 moves to the right side and Player 2 to the left.
- When you detect players changing sides, treat it as the end of a game. The score at that point should reflect an 11-point game (e.g. 11-9, 11-7, 11-5, etc.).
- After a side change, continue tracking points for the NEW game but keep accumulating the total score.
- Track which player is which based on their appearance (clothing, build, etc.), NOT their position, since positions swap after each game.

Analyze the frames carefully and provide match analysis. You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:

{
  "totalPoints": <number, total points played in this segment>,
  "totalRallies": <number, total rallies in this segment>,
  "avgRallyLength": <number, average rally length in seconds>,
  "longestRally": <number, longest rally in seconds>,
  "serveSpeed": "<string, estimated serve speed like '~40 km/h'>",
  "player1Color": "<string, dominant t-shirt/clothing color of player 1, e.g. 'red', 'yellow', 'blue'>",
  "player2Color": "<string, dominant t-shirt/clothing color of player 2>",
  "player1Position": "<string, starting position: 'left', 'right', 'near', or 'far'>",
  "player2Position": "<string, starting position: 'left', 'right', 'near', or 'far'>",
  "player1": {
    "score": <number, points WON by player 1 in this segment>,
    "pointsWonOnServe": <number>,
    "pointsWonOnReturn": <number>,
    "forehandWinners": <number>,
    "backhandWinners": <number>,
    "topspinShots": <number>,
    "netPoints": <number>,
    "unforcedErrors": <number>,
    "forcedErrors": <number>,
    "underPressureErrors": <number>,
    "tacticalErrors": <number>,
    "fhForcedErrorsCreated": <number, forced errors created via forehand>,
    "fhOpeningAttacks": <number>,
    "fhOpeningAttackSuccess": <number, percentage>,
    "bhOpeningAttacks": <number>,
    "bhOpeningAttackSuccess": <number, percentage>
  },
  "player2": {
    "score": <number, points WON by player 2 in this segment>,
    "pointsWonOnServe": <number>,
    "pointsWonOnReturn": <number>,
    "forehandWinners": <number>,
    "backhandWinners": <number>,
    "topspinShots": <number>,
    "netPoints": <number>,
    "unforcedErrors": <number>,
    "forcedErrors": <number>,
    "underPressureErrors": <number>,
    "tacticalErrors": <number>,
    "fhForcedErrorsCreated": <number>,
    "fhOpeningAttacks": <number>,
    "fhOpeningAttackSuccess": <number, percentage>,
    "bhOpeningAttacks": <number>,
    "bhOpeningAttackSuccess": <number, percentage>
  },
  "summary": "<string, 1-2 sentence summary of what happened in this segment>",
  "player1Insight": {
    "strength": "<string, one key strength of player 1 based on this segment>",
    "weakness": "<string, one key weakness of player 1 based on this segment>"
  },
  "player2Insight": {
    "strength": "<string, one key strength of player 2 based on this segment>",
    "weakness": "<string, one key weakness of player 2 based on this segment>"
  }
}

Count EVERY point carefully. Each rally that ends with a point scored must be counted. Be thorough and precise. If you can see a scoreboard, use it to verify your counts.${chunkContext}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze these ${frames.length} frames from a table tennis match video. Count every single point and rally carefully.`,
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
