export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriSense BD Backend is running",
    status: "OK",
    timestamp: new Date().toISOString()
  });
};