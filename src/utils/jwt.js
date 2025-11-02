const jwt = require('jsonwebtoken');

const generateToken = (walletAddress, userId) => {
  return jwt.sign(
    { 
      walletAddress: walletAddress.toLowerCase(),
      userId: userId,
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};