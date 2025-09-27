export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Backend is running 🚀",
    time: new Date().toISOString(),
  });
}
