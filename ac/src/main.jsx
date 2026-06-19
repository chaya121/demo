/* src/main.jsx - จุดเริ่มต้นของแอปพลิเคชัน React ทำหน้าที่ Render App component เข้าสู่ DOM */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
