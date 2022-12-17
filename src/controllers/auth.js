const {
  login: signin,
  signup: register,
  verifyToken,
  refreshAccessToken,
  getUserInfo,
} = require('../auth/auth');

const login = async (req, res) => {
  try {
    const usernameOrEmail = req.body?.usernameOrEmail;
    const password = req.body?.password;
    if (!usernameOrEmail || !password) {
      return res.status(422).json({
        error: true,
        message: 'Invalid body',
      });
    }

    const response = await signin(usernameOrEmail, password);

    return res.json({
      data: response,
      error: false,
      message: 'Logged in!',
    });
  } catch (error) {
    return res.status(error.status || 401).json({
      error: true,
      message: error.message,
    });
  }
};

const validate = async (req, res) => {
  try {
    const { token } = req.body;
    verifyToken(token);
    return {
      error: false,
      data: {
        isValid: true,
      },
      message: 'Valid token!',
    };
  } catch (error) {
    console.error('Validate error: ', error);
    return res.status(403).json({
      error: true,
      message: error.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    const username = req.body?.username;
    const email = req.body?.email;
    const password = req.body?.password;
    const fullName = req.body?.fullName;

    if (!username || !email || !password || !fullName) {
      const err = new Error('Wrong body!');
      err.status = 422;
      throw err;
    }

    const newUser = register({
      username,
      email,
      password,
      fullName,
    });

    return res.status(201).json({
      data: newUser,
      error: false,
      message: 'User signed up!',
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      error: true,
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      const err = new Error('Refresh token not provided!');
      err.status = 422;
      throw err;
    }
    const newAccessToken = refreshAccessToken(refreshToken);

    return res.json({
      error: false,
      message: 'Access token refreshed!',
      data: newAccessToken
    })
  } catch (error) {
    return res.status(error.status || 400).json({
      error: true,
      message: error.message,
    });
  }
};

const getMyUserInfo = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      const err = new Error('User not authenticated!');
      err.status = 401;
      throw err;
    }
    const me = await getUserInfo(user.id)

    return res.json({
      error: false,
      data: me,
      message: 'User authenticated!'
    })
  } catch (error) {
    return res.status(error.status || 400).json({
      error: true,
      message: error.message
    })
  }
}

module.exports = {
  login,
  signup,
  refreshToken,
  getMyUserInfo
};
