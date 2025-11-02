const Joi = require('joi');

const walletAddressSchema = Joi.string()
  .pattern(/^0x[a-fA-F0-9]{40}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid wallet address format',
    'any.required': 'Wallet address is required',
  });

const userDataSchema = Joi.object({
  walletAddress: walletAddressSchema,
  playerData: Joi.object({
    playerNames0: Joi.string().max(50).allow(''),
    playerNames1: Joi.string().max(50).allow(''),
    chosenAvatar0: Joi.number().integer().min(0).max(10),
    chosenAvatar1: Joi.number().integer().min(0).max(10),
    selectedCue0: Joi.number().integer().min(0).max(5),
    selectedCue1: Joi.number().integer().min(0).max(5),
  }),
  controlSettings: Joi.object({
    controlMode0: Joi.number().integer().min(0).max(2),
    controlMode1: Joi.number().integer().min(0).max(2),
    handMode0: Joi.number().integer().min(0).max(1),
    handMode1: Joi.number().integer().min(0).max(1),
  }),
  gameSettings: Joi.object({
    soundEnabled: Joi.boolean(),
    musicVolVal: Joi.number().min(0).max(1),
    musicVolMultiplierInGame: Joi.number().min(0).max(1),
    sensitivityValue: Joi.number().min(0.1).max(3),
    guideType: Joi.number().integer().min(0).max(3),
    selectedTable: Joi.number().integer().min(0).max(9),
    selectedPattern: Joi.number().integer().min(0).max(10),
    roomEnabled: Joi.boolean(),
    diamondsEnabled: Joi.boolean(),
    redGuideEnabled: Joi.boolean(),
    pinchZoomEnabled: Joi.boolean(),
    dontGoToTopBallInHand: Joi.boolean(),
    tapToAimEnabled: Joi.boolean(),
    autoAimEnabled: Joi.boolean(),
  }),
  stats: Joi.object({
    totalTimePlayed: Joi.number().integer().min(0),
    totalGamesPlayedVsCPU: Joi.number().integer().min(0),
    totalGamesWonVsCPU: Joi.number().integer().min(0),
    totalGamesPlayedVsHuman: Joi.number().integer().min(0),
    totalGamesWonVsHuman: Joi.number().integer().min(0),
    totalBallsPocketed: Joi.number().integer().min(0),
    ttBestScore: Joi.number().integer().min(0),
    matrixBestScore: Joi.number().integer().min(0),
  }),
  misc: Joi.object({
    startupCounter: Joi.number().integer().min(0),
    userSelControlDone: Joi.boolean(),
    adsRemoved: Joi.boolean(),
    useAvatarSet2: Joi.boolean(),
  }),
});

const validateWalletAddress = (req, res, next) => {
  const { error } = walletAddressSchema.validate(req.query.walletAddress || req.body.walletAddress);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const validateUserData = (req, res, next) => {
  const { error } = userDataSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map(detail => detail.message).join(', '),
    });
  }
  
  next();
};

module.exports = {
  validateWalletAddress,
  validateUserData,
};