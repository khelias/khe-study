import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { registerServiceWorker } from './offline/register';
import { PRODUCT_ROOT } from './theme/productRoot';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={PRODUCT_ROOT}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

registerServiceWorker();
