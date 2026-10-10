import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Filter out upstream library deprecation noise (such as Recharts defaultProps in React 18)
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('defaultProps will be removed') ||
    args[0].includes('Support for defaultProps') ||
    args[0].includes('The width(0) and height(0)')
  )) {
    return;
  }
  originalWarn(...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
