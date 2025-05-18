# index.tsx – spec
*(Root entrypoint · sets up React app and global listeners)*

---

## 1. Purpose
Bootstraps the React application, attaches the `App` component to the DOM,
and wires up cross-cutting event listeners used by various slices/services.

---

## 2. Imports
```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { registerGlobalEventListeners } from '@/services/eventListeners';
import App from './App';
import './global.css';
```

---

## 3. Render Flow
```ts
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
```

The listeners hook the global event bus to state slices (e.g. `metricsSlice`)
so the UI reacts to incoming snapshot events.

---

## 4. Component Tree
```
index.tsx
 └─<React.StrictMode>
     └─<BrowserRouter>
         └─<App>
            ├─[Providers: global state, theme, etc.]
            └─[Routes / pages]
```
The exact provider stack lives inside `<App>`, keeping the entry file lean.
