/**
 * Admin Roadmap Management — Quản lý lộ trình mẫu
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Tooltip, Row, Col, Divider, Collapse, Badge } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined,
  RocketOutlined, BookOutlined, SearchOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { roadmapService, publicService } from '../../services';

const { Title, Text } = Typography;

const levelConfig = {
  beginner: { color: 'green', label: 'Cơ bản' },
  intermediate: { color: 'orange', label: 'Trung cấp' },
  advanced: { color: 'red', label: 'Nâng cao' },
};

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [skillOptions, setSkillOptions] = useState([]);
  const [careerOptions, setCareerOptions] = useState([]);
  const [form] = Form.useForm();

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await roadmapService.getAll({ search, limit: 100 });
      setRoadmaps(res.data || []);
    } catch { setRoadmaps([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRoadmaps();
    publicService.getSkills({ limit: 200 })
      .then((res) => setSkillOptions((res.data || []).map((s) => ({ value: s._id, label: s.name }))))
      .catch(() => {});
    publicService.getCareerDirections({ limit: 100 })
      .then((res) => setCareerOptions((res.data || []).map((c) => ({ value: c._id, label: c.name }))))
      .catch(() => {});
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        level: values.level,
        prerequisites: values.prerequisites,
        targetSkills: values.targetSkills,
        careerDirections: values.careerDirections,
        phases: values.phases?.map((phase, pIdx) => ({
          title: phase.title,
          description: phase.description,
          order: pIdx + 1,
          steps: phase.steps?.map((step, sIdx) => ({
            title: step.title,
            description: step.description,
            estimatedHours: step.estimatedHours,
            order: sIdx + 1,
            resourceLinks: step.resourceLinks ? step.resourceLinks.split('\n').filter(Boolean) : [],
          })),
        })),
      };

      if (editingItem) {
        await roadmapService.update(editingItem._id, payload);
        message.success('Cập nhật lộ trình thành công!');
      } else {
        await roadmapService.create(payload);
        message.success('Tạo lộ trình thành công!');
      }
      setModalOpen(false); form.resetFields(); setEditingItem(null);
      fetchRoadmaps();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await roadmapService.delete(id); message.success('Đã xóa!'); fetchRoadmaps(); }
    catch (err) { message.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  const handleTogglePublish = async (id) => {
    try {
      await roadmapService.togglePublish(id);
      message.success('Đã cập nhật trạng thái!');
      fetchRoadmaps();
    } catch (err) { message.error(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const openEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      targetSkills: record.targetSkills?.map((s) => s._id || s),
      careerDirections: record.careerDirections?.map((c) => c._id || c),
      phases: record.phases?.map((p) => ({
        ...p,
        steps: p.steps?.map((s) => ({
          ...s,
          resourceLinks: s.resourceLinks?.join('\n'),
        })),
      })),
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Lộ trình', dataIndex: 'title', key: 'title',
      render: (title) => <Space><RocketOutlined style={{ color: '#4F46E5' }} /><strong>{title}</strong></Space>,
    },
    {
      title: 'Cấp độ', dataIndex: 'level', key: 'level',
      render: (l) => <Tag color={levelConfig[l]?.color}>{levelConfig[l]?.label}</Tag>,
      filters: Object.entries(levelConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (v, r) => r.level === v,
    },
    {
      title: 'Giai đoạn', key: 'phases',
      render: (_, r) => <Badge count={r.phases?.length || 0} style={{ background: '#4F46E5' }} />,
    },
    {
      title: 'Bước', key: 'steps',
      render: (_, r) => r.totalSteps || r.phases?.reduce((sum, p) => sum + (p.steps?.length || 0), 0) || 0,
    },
    {
      title: 'Đăng ký', dataIndex: 'enrollmentCount', key: 'enroll',
      render: (c) => c || 0,
      sorter: (a, b) => (a.enrollmentCount || 0) - (b.enrollmentCount || 0),
    },
    {
      title: 'Xuất bản', dataIndex: 'isPublished', key: 'published',
      render: (pub) => pub ? <Tag color="success">Đã xuất bản</Tag> : <Tag>Nháp</Tag>,
    },
    {
      title: '', key: 'actions', width: 140,
      render: (_, r) => (
        <Space>
          <Tooltip title={r.isPublished ? 'Ẩn' : 'Xuất bản'}>
            <Button type="text" icon={r.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleTogglePublish(r._id)} style={{ color: r.isPublished ? '#F59E0B' : '#10B981' }} />
          </Tooltip>
          <Tooltip title="Sửa"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Xóa lộ trình?" onConfirm={() => handleDelete(r._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>🚀 Quản lý Lộ trình mẫu</Title>
        <Space>
          <Input.Search placeholder="Tìm kiếm..." style={{ width: 240 }} value={search}
            onChange={(e) => setSearch(e.target.value)} onSearch={fetchRoadmaps} allowClear />
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditingItem(null); form.resetFields(); setModalOpen(true); }}>
            Tạo lộ trình
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table dataSource={roadmaps} columns={columns} rowKey="_id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} lộ trình` }} />
      </Card>

      {/* Modal Create/Edit */}
      <Modal title={editingItem ? 'Sửa lộ trình' : 'Tạo lộ trình mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()} confirmLoading={saving}
        okText={editingItem ? 'Cập nhật' : 'Tạo'} cancelText="Hủy" width={800}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                <Input placeholder="VD: Lộ trình Frontend Developer" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="level" label="Cấp độ" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'beginner', label: '🟢 Cơ bản' },
                  { value: 'intermediate', label: '🟡 Trung cấp' },
                  { value: 'advanced', label: '🔴 Nâng cao' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Mô tả lộ trình..." />
          </Form.Item>
          <Form.Item name="prerequisites" label="Yêu cầu đầu vào">
            <Input.TextArea rows={2} placeholder="Kiến thức cần có trước..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetSkills" label="Kỹ năng đạt được">
                <Select mode="multiple" options={skillOptions} placeholder="Chọn kỹ năng" showSearch
                  filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="careerDirections" label="Hướng nghề nghiệp">
                <Select mode="multiple" options={careerOptions} placeholder="Chọn hướng" showSearch
                  filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>📖 Giai đoạn & Bước</Divider>

          <Form.List name="phases">
            {(phaseFields, { add: addPhase, remove: removePhase }) => (
              <>
                {phaseFields.map(({ key: pKey, name: pName, ...pRest }) => (
                  <Card key={pKey} size="small" style={{ marginBottom: 12, background: '#F8FAFC', borderRadius: 12 }}
                    title={<Space><BookOutlined /> Giai đoạn {pName + 1}</Space>}
                    extra={<Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removePhase(pName)} />}>
                    <Form.Item {...pRest} name={[pName, 'title']} label="Tên giai đoạn" rules={[{ required: true }]}
                      style={{ marginBottom: 8 }}>
                      <Input placeholder="VD: HTML & CSS Cơ bản" />
                    </Form.Item>

                    {/* Steps in phase */}
                    <Form.List name={[pName, 'steps']}>
                      {(stepFields, { add: addStep, remove: removeStep }) => (
                        <>
                          {stepFields.map(({ key: sKey, name: sName, ...sRest }) => (
                            <Row gutter={8} key={sKey} style={{ marginBottom: 4 }} align="middle">
                              <Col flex="auto">
                                <Form.Item {...sRest} name={[sName, 'title']} style={{ marginBottom: 0 }}>
                                  <Input placeholder={`Bước ${sName + 1}`} size="small" />
                                </Form.Item>
                              </Col>
                              <Col style={{ width: 70 }}>
                                <Form.Item {...sRest} name={[sName, 'estimatedHours']} style={{ marginBottom: 0 }}>
                                  <InputNumber placeholder="Giờ" size="small" min={0} style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                              <Col>
                                <Button type="text" danger size="small" icon={<MinusCircleOutlined />}
                                  onClick={() => removeStep(sName)} />
                              </Col>
                            </Row>
                          ))}
                          <Button type="dashed" size="small" onClick={() => addStep()} icon={<PlusOutlined />} block
                            style={{ marginTop: 4 }}>
                            Thêm bước
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => addPhase()} block icon={<PlusOutlined />}>
                  Thêm giai đoạn
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
