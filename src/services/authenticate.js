const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();

// Setup JWKS client
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`
});

function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    if(err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];  // Authorization: Bearer <token>
    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (decodedToken.payload.iss && decodedToken.payload.iss.includes('microsoftonline.com')) {
      // Token is from Microsoft
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          if(res && res.status) {
            return res.status(401).json({ message: 'Invalid token' });
          }
        }
        req.user = decoded;
        return decoded
      });
    } else {
      // Token is custom
      try {
        const secret = process.env.JWT_SECRET;
        const verifiedToken = jwt.verify(token, secret);
        req.user = verifiedToken;
        return verifiedToken;
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

module.exports = authenticate;
