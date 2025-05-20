const express = require('express');
const bodyParser = require('body-parser');
const { handleCall } = require('./twilioHandler');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // JSON 처리도 필요할 수 있어서 추가

// 통화 시작 시 Twilio가 POST
app.post('/voice', handleCall);

// ✅ 이 부분이 새로 추가된 엔드포인트!
const { generateResponse } = require('./gptLogic');
const { synthesizeSpeech } = require('./tts');
app.post('/process-speech', async (req, res) => {
  const speechResult = req.body.SpeechResult || '';
  console.log('📞 사용자 말:', speechResult);

  const gptReply = await generateResponse(speechResult);
  console.log('🤖 GPT 응답:', gptReply);

  // TwiML 음성 응답
  const twiml = new (require('twilio').twiml.VoiceResponse)();
  twiml.say({ language: 'ko-KR', voice: 'Polly.Seoyeon' }, gptReply);
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Korean AI Call Server running on http://localhost:${PORT}`);
});
