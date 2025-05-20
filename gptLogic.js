const { Configuration, OpenAIApi } = require('openai');
const { isTimeAvailable, addReservation } = require('./sheetsAPI');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 🧠 예약 추출용 프롬프트
const STRUCTURE_PROMPT = `
너는 병원 전화 예약을 도와주는 AI 상담사야.
사용자의 발화에서 다음 정보를 구조화해서 추출해야 해:

- 날짜: YYYY-MM-DD 형식
- 시간: HH:MM 형식 (24시간제, 예: 14:00)
- 이름: 이름이 명확히 있으면 추출하고, 없으면 null
- 전화번호: 언급되면 추출하고, 없으면 null

반드시 아래 JSON 형식으로 응답해:
{
  "date": "...",
  "time": "...",
  "name": "...",
  "phone": "..."
}
단답형만. 설명 없이 JSON만 출력해.
`;

exports.generateResponse = async (userText) => {
  try {
    // 1. GPT에게 날짜/시간/이름/전화 추출 요청
    const extraction = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: STRUCTURE_PROMPT },
        { role: 'user', content: userText }
      ],
    });

    const json = extraction.data.choices[0].message.content.trim();
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      console.error('❌ JSON 파싱 실패:', json);
      return '예약 정보를 이해하지 못했어요. 다시 말씀해주시겠어요?';
    }

    const { date, time, name, phone } = parsed;

    if (!date || !time) {
      return '예약 날짜나 시간이 명확하지 않아요. 다시 한번 말씀해주시겠어요?';
    }

    // 2. 시트에서 예약 가능 여부 확인
    const available = await isTimeAvailable(date, time);

    if (available) {
      // 3. 시트에 예약 기록 (이름/전화 없으면 비워둠)
      await addReservation(date, time, name || '', phone || '');
      return `${date} ${time} 예약 가능합니다. 예약 접수 완료되었습니다. 감사합니다!`;
    } else {
      return `${date} ${time} 시간은 이미 예약이 있어요. 다른 시간은 어떠세요?`;
    }
  } catch (error) {
    console.error('❌ GPT 예약 처리 오류:', error.response?.data || error.message);
    return '죄송합니다. 지금은 응답할 수 없습니다.';
  }
};
