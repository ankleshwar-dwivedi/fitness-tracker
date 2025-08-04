import { StrictMode } from 'react'//strict mode helps identify potential problems
import { createRoot } from 'react-dom/client'// connects to the html page
import './index.css'//imports ur global css styles which apply to whole app
import App from './App.jsx'// imports the root component <App /> that controls what the user sees

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
  // rendered app inside reacts strictmode for safer development and error checks
)
