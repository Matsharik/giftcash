
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Ensure path matches your App file
import './index.css'

// --- IMPORTANT: DApp Manifest URL ---
// This URL points to your tonconnect-manifest.json file.
// For production, you MUST host this file on your server and provide its URL.
// For development, you can use the demo manifest or create a simple one.
const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';


const rootElement = document.getElementById('root');

// Type assertion for TypeScript: We guarantee 'root' element exists
if (!rootElement) {
  throw new Error('Root element with ID "root" not found in the DOM. Check your index.html.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
      <App /> {/* Your App component */}
  </React.StrictMode>,
);
