export default async function handler(req, res) {
  if (req.method === "POST") {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="wss://api.elevenlabs.io/v1/convai/stream"
                  name="ElevenLabsAgent"
                  />
        </Connect>
      </Response>`;

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(twiml);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
