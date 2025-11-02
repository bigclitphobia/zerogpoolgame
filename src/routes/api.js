const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');
const { validateWalletAddress, validateUserData } = require('../middleware/validation');
const logger = require('../utils/logger');

// GET /api/user - Get or create user data
router.get('/user', validateWalletAddress, async (req, res, next) => {
  try {
    const { walletAddress } = req.query;
    const normalizedAddress = walletAddress.toLowerCase();

    let userData = await UserData.findOne({ walletAddress: normalizedAddress });

    // Create new user if doesn't exist
    if (!userData) {
      userData = new UserData({ walletAddress: normalizedAddress });
      await userData.save();
      logger.info(`New user created: ${normalizedAddress}`);
    }

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/user - Save user data
router.post('/user', validateWalletAddress, validateUserData, async (req, res, next) => {
  try {
    const { walletAddress, ...userData } = req.body;
    const normalizedAddress = walletAddress.toLowerCase();

    // Find and update, or create new
    const updatedUser = await UserData.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      {
        $set: {
          ...userData,
          walletAddress: normalizedAddress,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    logger.info(`User data saved: ${normalizedAddress}`);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/leaderboard - Get top 100 players by total balls pocketed
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await UserData
      .find()
      .select('walletAddress playerData.playerNames0 stats.totalBallsPocketed stats.totalGamesWonVsCPU stats.totalGamesWonVsHuman')
      .sort({ 'stats.totalBallsPocketed': -1 })
      .limit(100)
      .lean();

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      playerName: user.playerData?.playerNames0 || 'Anonymous',
      totalBallsPocketed: user.stats?.totalBallsPocketed || 0,
      totalGamesWon: (user.stats?.totalGamesWonVsCPU || 0) + (user.stats?.totalGamesWonVsHuman || 0),
    }));

    res.json({
      success: true,
      data: formattedLeaderboard,
      count: formattedLeaderboard.length,
    });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;