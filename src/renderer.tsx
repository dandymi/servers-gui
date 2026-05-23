import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import ServerManager from './components/ServerManager';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ServerManager />
  </React.StrictMode>
);