/**
 * Login Page — EduPath
 */
import { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Space } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      message.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
          <Title level={2} style={{ marginBottom: 4, color: '#1E293B' }}>
            Chào mừng trở lại
          </Title>
          <Text type="secondary">
            Đăng nhập vào EduPath để tiếp tục hành trình
          </Text>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <Text type="danger">{error}</Text>
          </div>
        )}

        {/* Login Form */}
        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Email"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: '#94A3B8', fontSize: 13 }}>hoặc</Divider>

        {/* Google Login */}
        <Button
          block
          icon={<GoogleOutlined />}
          size="large"
          style={{
            height: 48,
            borderRadius: 12,
            fontWeight: 500,
            marginBottom: 24,
          }}
        >
          Đăng nhập với Google
        </Button>

        {/* Register link */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Chưa có tài khoản? </Text>
          <Link to="/register" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
