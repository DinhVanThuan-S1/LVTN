/**
 * App Root Component
 * Redux Provider + Ant Design ConfigProvider + Router
 */
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import store from './store';
import { fetchCurrentUser } from './store/authSlice';
import theme from './styles/theme';
import AppRouter from './routes/AppRouter';
import './styles/index.css';

// Auto-fetch user nếu có token
const token = localStorage.getItem('accessToken');
if (token) {
  store.dispatch(fetchCurrentUser());
} else {
  // Set isLoading = false nếu không có token
  store.dispatch({ type: 'auth/fetchCurrentUser/rejected' });
}

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme} locale={viVN}>
        <AntApp>
          <AppRouter />
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
