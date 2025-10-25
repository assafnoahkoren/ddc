import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TrpcProvider } from './providers/TrpcProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrpcProvider>
      <App />
    </TrpcProvider>
  </StrictMode>
);
