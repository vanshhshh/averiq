import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { CallSid, CallStatus, From, To, Duration } = req.body;

      const { error } = await supabase.from("calls").insert([
        {
          sid: CallSid,
          status: CallStatus,
          phone: From,
          to_number: To,
          duration: Duration || 0,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Database insert failed" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
