/**
 * Register Page — EduPath
 */
import { Form, Input, Button, Typography, Select, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/authSlice';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const onFinish = async (values) => {
    const result = await dispatch(register(values));
    if (register.fulfilled.match(result)) {
      message.success('Đăng ký thành công!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
          <Title level={2} style={{ marginBottom: 4 }}>Tạo tài khoản</Title>
          <Text type="secondary">Bắt đầu hành trình phát triển sự nghiệp CNTT</Text>
        </div>

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

        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu ít nhất 8 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            initialValue="student"
          >
            <Select placeholder="Chọn vai trò">
              <Option value="student">🎓 Sinh viên</Option>
              <Option value="recruiter">🏢 Nhà tuyển dụng</Option>
            </Select>
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: '#94A3B8', fontSize: 13 }}>hoặc</Divider>

        <Button block icon={<GoogleOutlined />} size="large" style={{ height: 48, borderRadius: 12, fontWeight: 500, marginBottom: 24 }}>
          Đăng ký với Google
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Đã có tài khoản? </Text>
          <Link to="/login" style={{ fontWeight: 600 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
