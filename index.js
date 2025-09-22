const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Basic test route
app.get("/", (req, res) => {
  res.send("✅ Averiq AI Voice Agent running on Vercel");
});

// Incoming call webhook
app.post("/incoming-call", async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const fromNumber = req.body.From || "unknown";

  console.log(`📞 Incoming call from ${fromNumber}`);

  // log call to Supabase
  await supabase.from("calls").insert([
    { phone: fromNumber, status: "started", timestamp: new Date() },
  ]);

  const twiml = new VoiceResponse();
  twiml.connect().stream({
    url: `wss://api.elevenlabs.io/v1/realtime/agent/${process.env.ELEVENLABS_AGENT_ID}`,
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// Call status webhook
app.post("/call-status", async (req, res) => {
  const { CallSid, CallStatus, From } = req.body;

  console.log(`📟 Call ${CallSid} ended with status: ${CallStatus}`);

  await supabase
    .from("calls")
    .update({ status: CallStatus })
    .eq("phone", From);

  res.sendStatus(200);
});

module.exports = app;
