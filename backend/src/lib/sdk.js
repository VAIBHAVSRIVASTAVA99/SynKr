const express = require('express');
const { AccessToken } = require('twilio').jwt;
const { VideoGrant } = AccessToken;

const router = express.Router();

router.post('/video-token', (req, res) => {
  const { identity, roomName } = req.body;
  
  // Create a video grant for this specific room
  const videoGrant = new VideoGrant({ room: roomName });
  
  // Create an access token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );
  
  // Add the video grant to the token
  token.addGrant(videoGrant);
  
  // Send token to the client
  res.json({ token: token.toJwt() });
});

module.exports = router;