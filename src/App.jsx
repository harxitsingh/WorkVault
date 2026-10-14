import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import router from './routes';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
