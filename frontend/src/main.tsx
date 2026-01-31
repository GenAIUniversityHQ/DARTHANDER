import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DisplayWindow from './components/DisplayWindow';
import './index.css';

// Check if we're in display mode (opened via display button)
const urlParams = new URLSearchParams(window.location.search);
const isDisplayMode = urlParams.get('display') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isDisplayMode ? <DisplayWindow /> : <App />}
  </React.StrictMode>,
);
