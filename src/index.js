import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import authService from './services/auth';
import App from './app';
import axios from 'axios';
import './utils/axios-interceptor';
import { App as AntdApp } from 'antd';

// Initialize auth headers if token exists
const token = authService.getToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AntdApp>
          <App />
        </AntdApp>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
