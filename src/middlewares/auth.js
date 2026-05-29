const jwt = require('jsonwebtoken')

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Informe o header de Authorization'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.AUTH_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'O token informado é inválido ou expirou',
      data: error.message
    });
  }
}

module.exports = {
  verifyJWT
}