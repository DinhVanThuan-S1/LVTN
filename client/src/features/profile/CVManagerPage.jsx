/**
 * CV Manager — Quản lý CV (Student)
 */
import { useEffect, useState } from 'react';
import { Card, Typography, List, Button, Modal, Form, Input, Space, Tag, message, Empty, Popconfirm, Tooltip, Row, Col, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled, FileTextOutlined } from '@ant-design/icons';
import { cvService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function CVManagerPage() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCV, setEditingCV] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const res = await cvService.getAll();
      setCvs(res.data || []);
    } catch { setCvs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCVs(); }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        summary: values.summary,
        education: values.education ? [{ school: values.education, degree: values.degree, fieldOfStudy: values.fieldOfStudy, startYear: values.startYear, endYear: values.endYear }] : undefined,
        skills: values.skillsText ? values.skillsText.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      };
      if (editingCV) {
        await cvService.update(editingCV._id, payload);
        message.success('Cập nhật CV thành công!');
      } else {
        await cvService.create(payload);
        message.success('Tạo CV thành công!');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingCV(null);
      fetchCVs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await cvService.delete(id);
      message.success('Xóa CV thành công!');
      fetchCVs();
    } catch (err) { message.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await cvService.setDefault(id);
      message.success('Đã đặt làm CV mặc định');
      fetchCVs();
    } catch (err) { message.error(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const openEdit = (cv) => {
    setEditingCV(cv);
    form.setFieldsValue({
      title: cv.title,
      summary: cv.summary,
      education: cv.education?.[0]?.school,
      degree: cv.education?.[0]?.degree,
      fieldOfStudy: cv.education?.[0]?.fieldOfStudy,
      skillsText: cv.skills?.join(', '),
    });
    setModalOpen(true);
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>📄 Quản lý CV</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCV(null); form.resetFields(); setModalOpen(true); }}>
          Tạo CV mới
        </Button>
      </div>

      {loading ? null : cvs.length === 0 ? (
        <Card style={{ borderRadius: 16 }}>
          <Empty description="Chưa có CV nào">
            <Button type="primary" onClick={() => setModalOpen(true)}>Tạo CV đầu tiên</Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {cvs.map((cv) => (
            <Col xs={24} sm={12} lg={8} key={cv._id}>
              <Card hoverable className="hover-lift" style={{ borderRadius: 16, height: '100%',
                border: cv.isDefault ? '2px solid #4F46E5' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Space>
                    <FileTextOutlined style={{ fontSize: 20, color: '#4F46E5' }} />
                    <Title level={5} style={{ margin: 0 }}>{cv.title || 'CV không tên'}</Title>
                  </Space>
                  {cv.isDefault && <Tag color="blue" icon={<StarFilled />}>Mặc định</Tag>}
                </div>

                {cv.summary && <Text type="secondary" style={{ fontSize: 13 }}>{cv.summary.substring(0, 100)}...</Text>}

                {cv.skills?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {cv.skills.slice(0, 4).map((s, i) => <Tag key={i} style={{ marginBottom: 4 }}>{s}</Tag>)}
                    {cv.skills.length > 4 && <Tag>+{cv.skills.length - 4}</Tag>}
                  </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(cv.updatedAt).format('DD/MM/YYYY')}
                  </Text>
                  <Space>
                    {!cv.isDefault && (
                      <Tooltip title="Đặt mặc định">
                        <Button type="text" size="small" icon={<StarOutlined />} onClick={() => handleSetDefault(cv._id)} />
                      </Tooltip>
                    )}
                    <Tooltip title="Sửa">
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(cv)} />
                    </Tooltip>
                    <Popconfirm title="Xóa CV?" onConfirm={() => handleDelete(cv._id)}>
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal */}
      <Modal title={editingCV ? 'Sửa CV' : 'Tạo CV mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()} confirmLoading={saving}
        okText={editingCV ? 'Cập nhật' : 'Tạo'} cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề CV" rules={[{ required: true }]}>
            <Input placeholder="VD: CV Frontend Developer" />
          </Form.Item>
          <Form.Item name="summary" label="Giới thiệu">
            <Input.TextArea rows={3} placeholder="Tóm tắt về bản thân..." />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="education" label="Trường">
                <Input placeholder="Tên trường" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fieldOfStudy" label="Ngành">
                <Input placeholder="Ngành học" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="skillsText" label="Kỹ năng (phân cách bởi dấu phẩy)">
            <Input placeholder="React, Node.js, MongoDB, ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
