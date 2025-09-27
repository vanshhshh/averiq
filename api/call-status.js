// api/call-status.js
export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { CallSid, CallStatus, From, To } = req.body || {};

      console.log("📞 Call Status Update:", { CallSid, CallStatus, From, To });

      return res.status(200).json({
        success: true,
        message: "Status received",
        data: { CallSid, CallStatus, From, To },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
