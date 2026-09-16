import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode is disabled to prevent GIS (Google Identity Services) from
// being initialised twice in development mode, which causes console warnings
// and double API calls. Re-enable it once GIS supports StrictMode.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
