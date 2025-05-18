/**
 * Bootstraps the React application and wires up cross-cutting event listeners.
 *
 * This file attaches the {@link App} component to the DOM and invokes
 * {@link registerGlobalEventListeners} which binds global events from the
 * application event bus to Zustand state slices. These listeners have
 * application-wide side effects: they update global state in response to worker
 * messages and UI events. Callers should only invoke this module once to avoid
 * duplicate listener registration.
 *
 * The render flow:
 * 1. Create a React root attached to the element with id `root`.
 * 2. Render the component tree under {@link React.StrictMode} and
 *    {@link BrowserRouter}.
 * 3. Register global event listeners so state reacts to incoming events.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { registerGlobalEventListeners } from '@/services/eventListeners';
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

registerGlobalEventListeners();

