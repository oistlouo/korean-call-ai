const { google } = require('googleapis');
require('dotenv').config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL;
const PRIVATE_KEY = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_B64, 'base64').toString('utf-8');

const auth = new google.auth.JWT(
  SERVICE_EMAIL,
  null,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// 📌 예약된 시간 확인
exports.isTimeAvailable = async (date, time) => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: '예약!A2:B', // A: 날짜, B: 시간
    });

    const rows = res.data.values || [];

    const exists = rows.some(row => row[0] === date && row[1] === time);
    return !exists; // 예약이 없으면 true
  } catch (err) {
    console.error('❌ 시트 조회 실패:', err.message);
    return false;
  }
};

// 📌 예약 등록
exports.addReservation = async (date, time, name, phone) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: '예약!A2:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[date, time, name, phone]],
      },
    });
    console.log('✅ 예약 등록 성공:', response.statusText);
  } catch (err) {
    console.error('❌ 예약 등록 실패:', err.message);
  }
};
