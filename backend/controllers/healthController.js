export function health(req, res) {
  res.json({ success: true, message: "LGS backend is healthy" });
}
