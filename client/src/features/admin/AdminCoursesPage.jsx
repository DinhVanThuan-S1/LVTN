/**
 * Admin Courses Management — Quản lý học phần
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { adminService, publicService } from '../../services';

const { Title } = Typography;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [skillOptions, setSkillOptions] = useState([]);
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCourses({ search, limit: 100 });
      setCourses(res.data || []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCourses();
    publicService.getSkills({ limit: 200 })
      .then((res) => setSkillOptions((res.data || []).map((s) => ({ value: s._id, label: s.name }))))
      .catch(() => {});
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editingItem) {
        await adminService.updateCourse(editingItem._id, values);
        message.success('Cập nhật học phần thành công!');
      } else {
        await adminService.createCourse(values);
        message.success('Tạo học phần thành công!');
      }
      setModalOpen(false); form.resetFields(); setEditingItem(null);
      fetchCourses();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await adminService.deleteCourse(id); message.success('Đã xóa!'); fetchCourses(); }
    catch (err) { message.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  const openEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      relatedSkills: record.relatedSkills?.map((s) => s._id || s),
    });
    setModalOpen(true);
  };

  const columns = [
    { title: 'Mã', dataIndex: 'courseCode', key: 'courseCode', width: 100, render: (c) => <Tag>{c}</Tag> },
    {
      title: 'Học phần', dataIndex: 'name', key: 'name',
      render: (name) => <Space><BookOutlined style={{ color: '#4F46E5' }} /><strong>{name}</strong></Space>,
    },
    { title: 'Tín chỉ', dataIndex: 'credits', key: 'credits', width: 80 },
    {
      title: 'Kỹ năng liên quan', key: 'skills', responsive: ['lg'],
      render: (_, r) => r.relatedSkills?.slice(0, 3).map((s) => <Tag key={s._id} color="blue">{s.name}</Tag>),
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(r._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>📖 Quản lý Học phần</Title>
        <Space>
          <Input.Search placeholder="Tìm kiếm..." style={{ width: 240 }} value={search}
            onChange={(e) => setSearch(e.target.value)} onSearch={fetchCourses} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setModalOpen(true); }}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table dataSource={courses} columns={columns} rowKey="_id" loading={loading}
          pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t}` }} />
      </Card>

      <Modal title={editingItem ? 'Sửa học phần' : 'Thêm học phần'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()} confirmLoading={saving}
        okText={editingItem ? 'Cập nhật' : 'Tạo'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="courseCode" label="Mã học phần" rules={[{ required: true }]}>
            <Input placeholder="VD: IT001" />
          </Form.Item>
          <Form.Item name="name" label="Tên học phần" rules={[{ required: true }]}>
            <Input placeholder="VD: Lập trình Web" />
          </Form.Item>
          <Form.Item name="credits" label="Số tín chỉ" rules={[{ required: true }]}>
            <Input type="number" placeholder="3" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="relatedSkills" label="Kỹ năng liên quan">
            <Select mode="multiple" options={skillOptions} placeholder="Chọn kỹ năng" showSearch
              filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
