const { verifyAccessToken: verifyAccToken } = require('../auth/auth');

const ACCESS_TOKEN_NAME = 'Authorization';

const verifyAccessToken = async (req, res, next) => {
  try {
    if (!req.header(ACCESS_TOKEN_NAME)) {
      const err = new Error(`${ACCESS_TOKEN_NAME} not found!`);
      err.status = 401;
      throw err;
    }
    const header = req.header(ACCESS_TOKEN_NAME).split(' ');
  
    if (header.length !== 2 && !/^Bearer$/.test(header[0])) {
      const err = new Error(`Format for ${ACCESS_TOKEN_NAME}: Bearer [token]`);
      err.status = 401;
      throw err;
    }
  
    const tokenToVerify = header[1];
    const parsedToken = await verifyAccToken(tokenToVerify);
    req.user = parsedToken.user;
    console.log(req.user)
    return next();
  } catch (error) {
    return res.status(error.status || 400).json({
      error: true,
      message: error.message
    })
  }
};

module.exports = {
  verifyAccessToken,
};
