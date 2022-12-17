const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require('../config/environment');
const { User } = require('../models/user');

const issueToken = (payload, secret, expiresIn) => {
  try {
    const token = expiresIn
      ? jwt.sign(payload, secret, { expiresIn })
      : jwt.sign(payload, secret);
    const fullToken = { token, expiresIn };
    return fullToken;
  } catch (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }
};

const issueAccessToken = (payload) =>
  issueToken(payload, ACCESS_TOKEN_SECRET, '20m');
const issueRefreshToken = (payload) =>
  issueToken(payload, REFRESH_TOKEN_SECRET);

const generateAccessToken = (refreshToken, user) => {
  try {
    let newAccessToken = null;
    if (Boolean(refreshToken)) {
      const payload = {
        id: refreshToken?.id,
        roles: refreshToken?.roles ?? [],
      };
      newAccessToken = issueAccessToken(payload);
    } else if (Boolean(user)) {
      const payload = { id: user?._id };
      newAccessToken = issueAccessToken(payload);
    } else {
      const err = new Error('No user or refreshToken provided for JWT issue!');
      err.status = 403;
      throw err;
    }

    if (!newAccessToken) {
      const err = new Error('Could not issue a new token!');
      err.status = 401;
      throw err;
    }

    return newAccessToken;
  } catch (error) {
    return {
      status: 401,
      responseData: {
        error: true,
        message: error.message,
      },
    };
  }
};

const generateTokens = (user) => {
  if (!Boolean(user)) {
    throw new Error('No user provided for JWT issue!');
  }

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = (refreshToken) => {
  const payload = jwt.decode(refreshToken);
  return generateAccessToken(refreshToken, payload.user);
};

const login = async (usernameOrEmail, password) => {
  try {
    const user = await User.findOne(
      {
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
      { username: true, email: true, password: true, fullName: true }
    );

    if (!user) {
      const err = new Error('User not found!');
      err.status = 401;
      throw err;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      const err = new Error('Validation error');
      err.status = 401;
      throw err;
    }

    const loggedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const tokens = generateTokens({ user: loggedUser });

    return {
      tokens,
      user,
    };
  } catch (error) {
    const err = new Error(error.message);
    err.status = error.status || 400;
    throw err;
  }
};

const verifyToken = async (token, secret) => {
  return jwt.verify(token, secret);
};

const verifyAccessToken = (payload) =>
  verifyToken(payload, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (payload) =>
  verifyToken(payload, REFRESH_TOKEN_SECRET);

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

const signup = async (user) => {
  const hashedPassword = hashPassword(user.password);
  return await User.create({
    ...user,
    password: hashedPassword,
  });
};

const getUserInfo = async (userId) => {
  return await User.findById(userId, {
    _id: true,
    email: true,
    fullName: true,
  });
};

module.exports = {
  login,
  verifyAccessToken,
  signup,
  refreshAccessToken,
  getUserInfo,
};
