import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <FleetProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1b2230',
                color: '#f8fafc',
                border: '1px solid #2b394f',
              },
            }} 
          />
        </BrowserRouter>
      </FleetProvider>
    </AuthProvider>
  );
}

export default App;