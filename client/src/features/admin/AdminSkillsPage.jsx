/**
 * Admin Skills Management — CRUD kỹ năng
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BulbOutlined } from '@ant-design/icons';
import { adminService } from '../../services';

const { Title } = Typography;

const categoryOptions = [
  { value: 'programming', label: 'Lập trình' },
  { value: 'database', label: 'Cơ sở dữ liệu' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'testing', label: 'Kiểm thử' },
  { value: 'tools', label: 'Công cụ' },
  { value: 'soft_skills', label: 'Kỹ năng mềm' },
  { value: 'networking', label: 'Mạng' },
  { value: 'security', label: 'Bảo mật' },
  { value: 'mobile', label: 'Mobile' },
];
const categoryColors = {
  programming: 'blue', database: 'green', frontend: 'orange', backend: 'purple',
  devops: 'cyan', ai_ml: 'magenta', testing: 'lime', tools: 'geekblue',
  soft_skills: 'gold', networking: 'volcano', security: 'red', mobile: 'pink',
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSkills({ search, limit: 100 });
      setSkills(res.data || []);
    } catch { setSkills([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editingSkill) {
        await adminService.updateSkill(editingSkill._id, values);
        message.success('Cập nhật kỹ năng thành công!');
      } else {
        await adminService.createSkill(values);
        message.success('Tạo kỹ năng thành công!');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingSkill(null);
      fetchSkills();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteSkill(id);
      message.success('Xóa kỹ năng thành công!');
      fetchSkills();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const openEdit = (record) => {
    setEditingSkill(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingSkill(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Kỹ năng',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <BulbOutlined style={{ color: '#4F46E5' }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color={categoryColors[cat]}>{categoryOptions.find((c) => c.value === cat)?.label || cat}</Tag>,
      filters: categoryOptions.map((c) => ({ text: c.label, value: c.value })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      responsive: ['lg'],
      render: (slug) => <Tag>{slug}</Tag>,
    },
    {
      title: 'Tài nguyên',
      key: 'resources',
      responsive: ['md'],
      render: (_, record) => record.resources?.length || 0,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>💡 Quản lý Kỹ năng</Title>
        <Space>
          <Input.Search placeholder="Tìm kiếm..." style={{ width: 240 }} value={search}
            onChange={(e) => setSearch(e.target.value)} onSearch={fetchSkills} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm kỹ năng
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table
          dataSource={skills}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `Tổng ${t} kỹ năng` }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingSkill ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingSkill ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên kỹ năng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: React.js" />
          </Form.Item>
          <Form.Item name="category" label="Nhóm kỹ năng" rules={[{ required: true, message: 'Chọn nhóm' }]}>
            <Select options={categoryOptions} placeholder="Chọn nhóm" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả kỹ năng..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
