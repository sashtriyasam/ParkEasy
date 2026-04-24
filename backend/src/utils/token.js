const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (userId, role) => {
    const accessJti = crypto.randomBytes(16).toString('hex');
    const refreshJti = crypto.randomBytes(16).toString('hex');
    
    const accessToken = jwt.sign(
        { sub: userId, role, jti: accessJti },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { sub: userId, jti: refreshJti, accessJti },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken, accessJti, refreshJti };
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
    generateTokens,
    hashToken,
    verifyAccessToken,
    verifyRefreshToken
};
