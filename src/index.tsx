/**
 * Bootstraps the React application.
 *
 * This file attaches the {@link App} component to the DOM.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerEventListeners } from '@/services/eventListeners';
import App from './App';
import './global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

registerEventListeners();

