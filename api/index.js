// api/index.js
const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");
const serverless = require("serverless-http");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Validate required envs quickly (helpful for debugging)
const requiredEnvs = ["SUPABASE_URL", "SUPABASE_KEY", "ELEVENLABS_AGENT_ID"];
requiredEnvs.forEach((k) => {
  if (!process.env[k]) {
    console.warn(`⚠️ WARNING: ${k} is not set in env. Set it in Vercel dashboard.`);
  }
});

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Basic health route
app.get("/", (req, res) => {
  res.send("✅ Averiq AI Voice Agent running on Vercel");
});

// Incoming call webhook: Twilio -> this endpoint
app.post("/incoming-call", async (req, res) => {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const fromNumber = req.body.From || "unknown";
    const callSid = req.body.CallSid || null;

    console.log(`📞 Incoming call from ${fromNumber} (CallSid: ${callSid})`);

    // Log call to Supabase (non-blocking if fails)
    try {
      await supabase.from("calls").insert([
        {
          phone: fromNumber,
          sid: callSid,
          status: "started",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Supabase insert error:", err?.message || err);
    }

    // Create TwiML to connect to ElevenLabs realtime agent
    const twiml = new VoiceResponse();
    // When using Twilio <Connect><Stream url="wss://...">, Twilio streams audio frames to the WS.
    // Replace with your ElevenLabs agent ID in Vercel env ELEVENLABS_AGENT_ID
    const elevenUrl = `wss://api.elevenlabs.io/v1/realtime/agent/${process.env.ELEVENLABS_AGENT_ID}`;

    twiml.connect().stream({ url: elevenUrl });

    res.type("text/xml");
    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error("incoming-call handler error:", err);
    res.status(500).send("Internal error");
  }
});

// Call status webhook (Twilio statusCallback)
app.post("/call-status", async (req, res) => {
  try {
    const { CallSid, CallStatus, From, Duration } = req.body;

    console.log(`📟 Call ${CallSid} status: ${CallStatus} (From: ${From}, Duration: ${Duration})`);

    // Update record in Supabase (match by sid if present, else by phone)
    try {
      if (CallSid) {
        await supabase
          .from("calls")
          .update({ status: CallStatus, duration: Duration || null })
          .eq("sid", CallSid);
      } else {
        await supabase
          .from("calls")
          .update({ status: CallStatus, duration: Duration || null })
          .eq("phone", From);
      }
    } catch (err) {
      console.error("Supabase update error:", err?.message || err);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("call-status handler error:", err);
    res.sendStatus(500);
  }
});

// Export wrapped app for Vercel serverless function
module.exports = serverless(app);
