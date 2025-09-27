// api/incoming-call.js
export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Example: simple TwiML response to say something
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Hello! Averiq AI Voice Agent is answering your call.</Say>
        </Response>`;

      res.setHeader("Content-Type", "text/xml");
      return res.status(200).send(twiml);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
