const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET_PHRASE;

module.exports = {
  generateToken: (id) => {
    const payload = {
      userID: id,
    };
    const options = {
      expiresIn: '1yr',
      jwtid: '12345',
    };
    return jwt.sign(payload, secret, options);
  },

  protected: (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
      jwt.verify(token, secret, (err, decodedToken) => {
        if (err) {
          res.status(401).json({ message: 'Invalid token' });
        } else {
          req.userID = decodedToken.userID;
          next();
        }
      });
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  },

  getUserID: (token) => {
    if (token) {
      let userID = 0;
      jwt.verify(token, secret, (err, decodedToken) => {
        if (!err) {
          userID = decodedToken.userID;
        }
      });
      return userID;
    } else {
      return 0;
    }
  },
};
