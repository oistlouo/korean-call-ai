const VoiceResponse = require('twilio').twiml.VoiceResponse;
const fs = require('fs');
const axios = require('axios');
const { transcribeAudio } = require('./whisperSTT');
const { generateResponse } = require('./gptLogic');
const { synthesizeSpeech } = require('./tts');

exports.handleCall = async (req, res) => {
  const twiml = new VoiceResponse();

  // Twilio는 첫 번째 요청에 음성 안내나 녹음을 설정해줘야 함
  const gather = twiml.gather({
    input: 'speech',
    timeout: 5,
    speechTimeout: 'auto',
    action: '/process-speech', // 이 경로로 음성 인식 결과를 POST함
    method: 'POST'
  });

  gather.say(
    { language: 'ko-KR', voice: 'Polly.Seoyeon' }, // Twilio 내장 TTS, 테스트용
    '안녕하세요. 예약을 원하시면 말씀해주세요.'
  );

  res.type('text/xml');
  res.send(twiml.toString());
};
