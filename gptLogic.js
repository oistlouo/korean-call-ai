const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
너는 병원 예약을 도와주는 AI 전화 상담사야.
사용자가 예약 시간이나 증상을 말하면,
1~2문장 정도의 자연스러운 말투로 응답해줘.
반말은 절대 사용하지 말고 존댓말로 대답해.
`;

exports.generateResponse = async (userText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ GPT 오류:', error.response?.data || error.message);
    return '죄송합니다. 다시 한 번 말씀해주시겠어요?';
  }
};
