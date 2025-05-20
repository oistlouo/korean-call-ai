const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
require('dotenv').config();

// Google Cloud 인증 파일 경로 (.env에 지정)
const GOOGLE_TTS_KEY_PATH = process.env.GOOGLE_TTS_KEY;

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: GOOGLE_TTS_KEY_PATH,
});

exports.synthesizeSpeech = async (text, filename = 'output.mp3') => {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: 'ko-KR',
        name: 'ko-KR-Wavenet-B', // 자연스러운 남성 한국어 음성 (여성은 Wavenet-A)
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(`./audio/${filename}`, response.audioContent, 'binary');
    console.log('✅ 음성 파일 생성 완료');

    return `/audio/${filename}`; // 클라이언트에 전달할 파일 경로
  } catch (error) {
    console.error('❌ TTS 변환 실패:', error.message);
    return null;
  }
};
