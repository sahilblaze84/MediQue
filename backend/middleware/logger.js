/**
 * Logging middleware
 */

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path, ip } = req;
    const { statusCode } = res;
    
    console.log(`[${new Date().toISOString()}] ${method} ${path} ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
};

module.exports = { requestLogger };
