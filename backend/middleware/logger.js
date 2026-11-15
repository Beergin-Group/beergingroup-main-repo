/**
 * Request Logger & Activity Tracker
 * Formats incoming API requests and execution time
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${elapsed}ms)`);
  });
  next();
};

module.exports = { requestLogger };
