/* 숫자·금리 표기 */
export const fmt = (n) => Math.round(n).toLocaleString('ko-KR');
export const won = (n) => fmt(n) + '원';
export const pct = (n) => '연 ' + n.toFixed(1) + '%';
export const pp = (n) => '+' + n.toFixed(1) + '%p';
export const DAYS = '월화수목금토일';
export const amtLabel = (a) => (a >= 10000 ? a / 10000 + '만원' : a / 1000 + '천원');
