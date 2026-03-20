/**
 * Settings Page — Cài đặt tài khoản
 */
import { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Divider, Switch, Space } from 'antd';
import { LockOutlined, SaveOutlined, BellOutlined, EyeOutlined } from '@ant-design/icons';
import authService from '../../services/authService';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [passwordForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (values) => {
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>⚙️ Cài đặt</Title>

      {/* Change Password */}
      <Card title={<><LockOutlined /> Đổi mật khẩu</>} style={{ borderRadius: 16, marginBottom: 16, maxWidth: 600 }}>
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới"
            rules={[{ required: true }, { min: 8, message: 'Ít nhất 8 ký tự' }]}>
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmNewPassword" label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp'));
                },
              }),
            ]}>
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} style={{ borderRadius: 8 }}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>

      {/* Notification Settings */}
      <Card title={<><BellOutlined /> Thông báo</>} style={{ borderRadius: 16, marginBottom: 16, maxWidth: 600 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><Text strong>Thông báo qua email</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Nhận thông báo qua email</Text></div>
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><Text strong>Thông báo việc làm mới</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Thông báo khi có việc phù hợp</Text></div>
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><Text strong>Thông báo tin nhắn</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Thông báo khi nhận tin nhắn mới</Text></div>
            <Switch defaultChecked />
          </div>
        </Space>
      </Card>

      {/* Privacy */}
      <Card title={<><EyeOutlined /> Quyền riêng tư</>} style={{ borderRadius: 16, maxWidth: 600 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><Text strong>Hiển thị profile công khai</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Cho phép nhà tuyển dụng xem hồ sơ</Text></div>
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><Text strong>Hiển thị email</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Hiện email trên hồ sơ công khai</Text></div>
            <Switch />
          </div>
        </Space>
      </Card>
    </div>
  );
}
