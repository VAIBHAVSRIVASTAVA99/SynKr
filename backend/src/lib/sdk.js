const express = require('express');
const { AccessToken } = require('twilio').jwt;
const { VideoGrant } = AccessToken;

const router = express.Router();

router.post('/video-token', (req, res) => {
  const { identity, roomName } = req.body;
  
  const videoGrant = new VideoGrant({ room: roomName });
  
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );
  
  token.addGrant(videoGrant);
  
  res.json({ token: token.toJwt() });
});

module.exports = router;