const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

exports.transcribeAudio = async (audioFilePath) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', 'whisper-1'); // Whisper 모델명 고정
    formData.append('language', 'ko'); // 한국어 지정

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('❌ Whisper 오류:', error.response?.data || error.message);
    return '음성 인식에 실패했습니다.';
  }
};
