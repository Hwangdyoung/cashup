import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// 본문 글꼴 Pretendard (감자 키우기와 같이 빌드에 묶음). 나혼렙 서체는 styles.css의 @font-face
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
