/**
 * Profile Page — Thông tin cá nhân
 */
import { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Select, Button, Avatar, Upload, message, Row, Col, Divider, Descriptions, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, SaveOutlined, EditOutlined, CameraOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import userService from '../../services/userService';
import { setUser } from '../../store/authSlice';

const { Title, Text } = Typography;

const roleTags = {
  student: { color: 'blue', label: '🎓 Sinh viên' },
  recruiter: { color: 'green', label: '🏢 Nhà tuyển dụng' },
  admin: { color: 'red', label: '⚙️ Quản trị viên' },
};

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.profile?.fullName,
        phone: user.profile?.phone,
        dateOfBirth: user.profile?.dateOfBirth,
        gender: user.profile?.gender,
        university: user.profile?.university,
        major: user.profile?.major,
        yearOfStudy: user.profile?.yearOfStudy,
        bio: user.profile?.bio,
      });
    }
  }, [user, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const res = await userService.updateMe({ profile: values });
      dispatch(setUser(res.data));
      message.success('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await userService.uploadAvatar(formData);
      dispatch(setUser(res.data));
      message.success('Upload avatar thành công!');
    } catch {
      message.error('Upload avatar thất bại');
    }
    return false; // Prevent default upload
  };

  const roleTag = roleTags[user?.role] || roleTags.student;

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>👤 Thông tin cá nhân</Title>

      <Row gutter={24}>
        {/* Avatar Card */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar
                size={120}
                src={user?.profile?.avatar}
                icon={<UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              />
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <Button
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: '#4F46E5',
                    color: '#fff',
                    border: 'none',
                  }}
                />
              </Upload>
            </div>

            <Title level={4} style={{ marginBottom: 4 }}>{user?.profile?.fullName || 'Chưa cập nhật'}</Title>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={roleTag.color}>{roleTag.label}</Tag>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">Hoạt động</Tag>
              </Descriptions.Item>
              {user?.profile?.university && (
                <Descriptions.Item label="Trường">{user.profile.university}</Descriptions.Item>
              )}
              {user?.profile?.major && (
                <Descriptions.Item label="Ngành">{user.profile.major}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Info Form */}
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 16 }}
            title="Thông tin chi tiết"
            extra={
              !editing ? (
                <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Chỉnh sửa</Button>
              ) : (
                <Button onClick={() => setEditing(false)}>Hủy</Button>
              )
            }
          >
            <Form form={form} layout="vertical" onFinish={handleSave} disabled={!editing}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Giới tính">
                    <Select options={[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' },
                      { value: 'other', label: 'Khác' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="yearOfStudy" label="Năm học">
                    <Select options={[1,2,3,4,5].map((y) => ({ value: y, label: `Năm ${y}` }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="university" label="Trường đại học">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="major" label="Ngành học">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="bio" label="Giới thiệu bản thân">
                    <Input.TextArea rows={3} placeholder="Viết vài dòng về bản thân..." />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}
                  style={{ borderRadius: 8 }}>
                  Lưu thay đổi
                </Button>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
