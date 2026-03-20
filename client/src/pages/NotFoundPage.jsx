/**
 * 404 Not Found Page
 */
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn tìm kiếm không tồn tại"
        extra={
          <Button type="primary" size="large" onClick={() => navigate('/dashboard')}>
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
}
