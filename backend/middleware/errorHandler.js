export function notFound(_req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: (error.status && error.status < 500) || error.status === 503 || error.status === 502 ? error.message : "Unable to complete this request. Please try again.",
  });
}
