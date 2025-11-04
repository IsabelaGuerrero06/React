import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { UILibraryProvider } from './contexts/UILibraryContext';
import App from './App';
import './index.css';
import './satoshi.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <UILibraryProvider>
          <App />
        </UILibraryProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);