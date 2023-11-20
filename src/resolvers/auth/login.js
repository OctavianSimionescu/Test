const User = require("../../models/User"); // Import the User model
const crypto = require('crypto');
const { HttpStatusCodes, LOGIN_ORIGIN } = require("../../utils/utils");
const jwt = require("jsonwebtoken");

const hashPassword = (password, salt) => {
    // First, compute SHA1 for the password
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    // Then, concatenate it with the salt and compute SHA1 again
    const hashedPasswordWithSalt = crypto.createHash('sha1').update(salt + hashedPassword).digest('hex');
    return hashedPasswordWithSalt;
};

const isPasswordMatch = (password, storedHashedPassword, salt) => {
    const hashedPassword = hashPassword(password, salt);
    return hashedPassword === storedHashedPassword;
};

module.exports = async (_, { email }, context) => {
    try {
      const origin = LOGIN_ORIGIN.MICROSOFT;
      // Find the user by the login (username)
      let user;
      if(origin === LOGIN_ORIGIN.REDMINE) {
        user = await User.findOne({ where: { login } });
      } else if(origin === LOGIN_ORIGIN.MICROSOFT) {
        const username = email.split('@')[0];
        user = await User.findOne({ where: { username: username } });
        if(user) {
          return {
            status: HttpStatusCodes.OK,
            message: "Authentication successful",
            user: user,
            token: '',
          };
        }
      }

      if (!user) {
        const returnMessage = {
          status: HttpStatusCodes.UNAUTHORIZED,
          message: "Incorrect username/password",
          user: null,
          token: "",
        };
        return returnMessage;
      }

      // Check if the provided password matches the hashed_password in the database
      const passwordMatch = isPasswordMatch(
        password,
        user.hashed_password,
        user.salt
      );

      if (passwordMatch) {
        // Authentication successful
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(
          {
          userId: user.id,
          iss: 'your-custom-domain.com',  // Your issuer domain
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 days in seconds
          sub: user.id.toString()
        }, secret);
        const returnMessage = {
          status: HttpStatusCodes.OK,
          message: "Authentication successful",
          user: user,
          token,
        };
        return returnMessage;
      } else {
        // Incorrect password
        const returnMessage = {
          status: HttpStatusCodes.UNAUTHORIZED,
          message: "Incorrect username/password",
          user: null,
          token: "",
        };
        return returnMessage;
      }
    } catch (error) {
      console.error("Error during login:", error);
      throw new Error("Failed to authenticate user.");
    }
  };