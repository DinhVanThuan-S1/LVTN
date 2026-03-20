/**
 * Company Profile — Hồ sơ công ty (Recruiter)
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Form, Input, Button, Row, Col, Divider, message, Skeleton, Space, Avatar } from 'antd';
import { BankOutlined, GlobalOutlined, EnvironmentOutlined, PhoneOutlined, TeamOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { companyService } from '../../services';

const { Title, Text, Paragraph } = Typography;

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    companyService.getMe()
      .then((res) => {
        setCompany(res.data);
        form.setFieldsValue(res.data);
      })
      .catch(() => { setEditing(true); }) // Auto edit nếu chưa có
      .finally(() => setLoading(false));
  }, [form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await companyService.update(values);
      setCompany(res.data);
      message.success('Cập nhật hồ sơ công ty thành công!');
      setEditing(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setSaving(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>🏢 Hồ sơ Công ty</Title>
        {!editing ? (
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Chỉnh sửa</Button>
        ) : (
          <Button onClick={() => { setEditing(false); if (company) form.setFieldsValue(company); }}>Hủy</Button>
        )}
      </div>

      <Card style={{ borderRadius: 16 }}>
        {/* Preview Header */}
        {!editing && company && (
          <div style={{ textAlign: 'center', paddingBottom: 24 }}>
            <Avatar size={80} icon={<BankOutlined />}
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', marginBottom: 12 }} />
            <Title level={4}>{company.companyName}</Title>
            <Space split="·" wrap>
              {company.industry && <Text type="secondary">{company.industry}</Text>}
              {company.companySize && <Text type="secondary"><TeamOutlined /> {company.companySize} nhân viên</Text>}
              {company.address && <Text type="secondary"><EnvironmentOutlined /> {company.address}</Text>}
            </Space>
            <Divider />
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSave} disabled={!editing}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true }]}>
                <Input prefix={<BankOutlined />} placeholder="Tên công ty" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="industry" label="Lĩnh vực">
                <Input placeholder="VD: Công nghệ thông tin" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined />} placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="companySize" label="Quy mô">
                <Input prefix={<TeamOutlined />} placeholder="VD: 50-200" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input prefix={<EnvironmentOutlined />} placeholder="Địa chỉ công ty" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Giới thiệu công ty">
                <Input.TextArea rows={4} placeholder="Mô tả về công ty..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="benefits" label="Phúc lợi">
                <Input.TextArea rows={3} placeholder="Các phúc lợi nổi bật..." />
              </Form.Item>
            </Col>
          </Row>

          {editing && (
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}
              style={{ borderRadius: 8 }}>
              Lưu hồ sơ
            </Button>
          )}
        </Form>
      </Card>
    </div>
  );
}
