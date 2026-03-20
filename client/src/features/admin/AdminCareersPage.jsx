/**
 * Admin Career Directions — Quản lý hướng nghề nghiệp
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AimOutlined } from '@ant-design/icons';
import { adminService, publicService } from '../../services';

const { Title } = Typography;

export default function AdminCareersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [skillOptions, setSkillOptions] = useState([]);
  const [form] = Form.useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCareerDirections({ search, limit: 100 });
      setItems(res.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchItems();
    publicService.getSkills({ limit: 200 })
      .then((res) => setSkillOptions((res.data || []).map((s) => ({ value: s._id, label: s.name }))))
      .catch(() => {});
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editingItem) {
        await adminService.updateCareerDirection(editingItem._id, values);
        message.success('Cập nhật thành công!');
      } else {
        await adminService.createCareerDirection(values);
        message.success('Tạo thành công!');
      }
      setModalOpen(false); form.resetFields(); setEditingItem(null);
      fetchItems();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await adminService.deleteCareerDirection(id); message.success('Đã xóa!'); fetchItems(); }
    catch (err) { message.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  const openEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      requiredSkills: record.requiredSkills?.map((s) => s._id || s),
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Hướng nghề nghiệp', dataIndex: 'name', key: 'name',
      render: (name) => <Space><AimOutlined style={{ color: '#8B5CF6' }} /><strong>{name}</strong></Space>,
    },
    { title: 'Ngành', dataIndex: 'field', key: 'field', render: (f) => <Tag>{f || '—'}</Tag>, responsive: ['md'] },
    {
      title: 'Kỹ năng cần thiết', key: 'skills', responsive: ['lg'],
      render: (_, r) => r.requiredSkills?.slice(0, 3).map((s) => <Tag key={s._id} color="purple">{s.name}</Tag>),
    },
    { title: 'Mức lương TB', dataIndex: 'averageSalary', key: 'salary', responsive: ['lg'],
      render: (s) => s ? `${(s/1000000).toFixed(0)}tr VND` : '—' },
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
        <Title level={3} style={{ margin: 0 }}>🧭 Hướng nghề nghiệp</Title>
        <Space>
          <Input.Search placeholder="Tìm kiếm..." style={{ width: 240 }} value={search}
            onChange={(e) => setSearch(e.target.value)} onSearch={fetchItems} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setModalOpen(true); }}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table dataSource={items} columns={columns} rowKey="_id" loading={loading}
          pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title={editingItem ? 'Sửa hướng nghề' : 'Thêm hướng nghề'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()} confirmLoading={saving}
        okText={editingItem ? 'Cập nhật' : 'Tạo'} cancelText="Hủy" width={560}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên hướng nghề" rules={[{ required: true }]}>
            <Input placeholder="VD: Full-Stack Developer" />
          </Form.Item>
          <Form.Item name="field" label="Lĩnh vực">
            <Input placeholder="VD: Web Development" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết hướng nghề..." />
          </Form.Item>
          <Form.Item name="averageSalary" label="Mức lương trung bình (VND)">
            <Input type="number" placeholder="15000000" />
          </Form.Item>
          <Form.Item name="requiredSkills" label="Kỹ năng cần thiết">
            <Select mode="multiple" options={skillOptions} placeholder="Chọn kỹ năng" showSearch
              filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <Form.Item name="marketTrend" label="Xu hướng thị trường">
            <Select options={[
              { value: 'rising', label: '📈 Đang tăng' },
              { value: 'stable', label: '📊 Ổn định' },
              { value: 'declining', label: '📉 Giảm' },
            ]} placeholder="Chọn xu hướng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
