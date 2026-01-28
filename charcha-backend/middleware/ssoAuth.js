/**
 * SSO Authentication Middleware
 * Validates X-SSO-Secret header for cross-platform authentication
 */

const ssoAuth = (req, res, next) => {
  const ssoSecret = req.headers['x-sso-secret'];

  if (!process.env.SSO_SECRET) {
    console.error('SSO_SECRET not configured in environment');
    return res.status(500).json({
      success: false,
      message: 'SSO not configured on server',
    });
  }

  if (!ssoSecret) {
    return res.status(401).json({
      success: false,
      message: 'X-SSO-Secret header is required',
    });
  }

  if (ssoSecret !== process.env.SSO_SECRET) {
    return res.status(403).json({
      success: false,
      message: 'Invalid SSO secret',
    });
  }

  next();
};

module.exports = { ssoAuth };
