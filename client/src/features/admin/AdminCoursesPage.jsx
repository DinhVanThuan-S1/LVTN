/**
 * Admin Courses Management — Quản lý học phần
 * Mở rộng: Loại HP (Bắt buộc/Tự chọn), Tiên quyết, Song hành, LT, TH
 */
import { useEffect, useState } from 'react';
import {
  Card, Typography, Table, Button, Modal, Form, Input, Select, Tag, Space,
  message, Popconfirm, Tooltip, Row, Col, Switch, Divider, InputNumber,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { adminService, publicService } from '../../services';

const { Title, Text } = Typography;

// Loại học phần (courseType) — theo constants backend
const courseTypeOptions = [
  { value: 'general', label: 'Đại cương' },
  { value: 'foundational', label: 'Cơ sở ngành' },
  { value: 'specialized', label: 'Chuyên ngành' },
  { value: 'elective', label: 'Tự chọn' },
  { value: 'thesis', label: 'Đồ án / Luận văn' },
];

const courseTypeColors = {
  general: 'blue',
  foundational: 'cyan',
  specialized: 'purple',
  elective: 'orange',
  thesis: 'red',
};

const courseTypeLabels = {
  general: 'Đại cương',
  foundational: 'Cơ sở ngành',
  specialized: 'Chuyên ngành',
  elective: 'Tự chọn',
  thesis: 'Đồ án/LV',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [skillOptions, setSkillOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]); // For prerequisite & corequisite selectors
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCourses({ search, limit: 200 });
      const data = res.data || [];
      setCourses(data);
      // Cập nhật danh sách chọn HP tiên quyết/song hành
      setCourseOptions(data.map((c) => ({
        value: c._id,
        label: `${c.courseCode} — ${c.name}`,
      })));
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
      // Transform contributedSkills từ array of IDs → array of objects
      if (values.contributedSkills) {
        values.contributedSkills = values.contributedSkills.map((id) =>
          typeof id === 'string' ? { skillId: id, weight: 1 } : id
        );
      }

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
      contributedSkills: record.contributedSkills?.map((s) => s.skillId?._id || s.skillId || s),
      prerequisiteCourses: record.prerequisiteCourses?.map((c) => c._id || c),
      corequisiteCourses: record.corequisiteCourses?.map((c) => c._id || c),
    });
    setModalOpen(true);
  };

  // Lọc bỏ HP đang sửa ra khỏi danh sách chọn tiên quyết/song hành
  const filteredCourseOptions = courseOptions.filter(
    (opt) => opt.value !== editingItem?._id
  );

  const columns = [
    {
      title: 'Mã', dataIndex: 'courseCode', key: 'courseCode', width: 100, fixed: 'left',
      render: (c) => <Tag style={{ fontWeight: 600 }}>{c}</Tag>,
    },
    {
      title: 'Học phần', dataIndex: 'name', key: 'name', width: 200,
      render: (name) => <Space><BookOutlined style={{ color: '#4F46E5' }} /><strong>{name}</strong></Space>,
    },
    {
      title: 'Tín chỉ', dataIndex: 'credits', key: 'credits', width: 80,
      align: 'center',
    },
    {
      title: 'Nhóm', dataIndex: 'courseType', key: 'courseType', width: 120,
      render: (type) => <Tag color={courseTypeColors[type]}>{courseTypeLabels[type] || type}</Tag>,
    },
    {
      title: 'Loại HP', dataIndex: 'isRequired', key: 'isRequired', width: 100,
      render: (isReq) => isReq !== false
        ? <Tag icon={<CheckCircleOutlined />} color="green">Bắt buộc</Tag>
        : <Tag icon={<CloseCircleOutlined />} color="orange">Tự chọn</Tag>,
    },
    {
      title: 'Tiên quyết', key: 'prerequisites', width: 200, responsive: ['xl'],
      render: (_, r) => r.prerequisiteCourses?.length > 0
        ? r.prerequisiteCourses.map((c) => (
          <Tag key={c._id || c} color="volcano" style={{ marginBottom: 2 }}>
            {c.courseCode || c}
          </Tag>
        ))
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Song hành', key: 'corequisites', width: 180, responsive: ['xl'],
      render: (_, r) => r.corequisiteCourses?.length > 0
        ? r.corequisiteCourses.map((c) => (
          <Tag key={c._id || c} color="geekblue" style={{ marginBottom: 2 }}>
            {c.courseCode || c}
          </Tag>
        ))
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Kỹ năng', key: 'skills', width: 200, responsive: ['lg'],
      render: (_, r) => r.contributedSkills?.slice(0, 3).map((s) => (
        <Tag key={s.skillId?._id || s.skillId} color="blue" style={{ marginBottom: 2 }}>
          {s.skillId?.name || '...'}
        </Tag>
      )),
    },
    {
      title: '', key: 'actions', width: 100, fixed: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Popconfirm title="Xóa học phần này?" onConfirm={() => handleDelete(r._id)}>
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
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t} học phần` }} />
      </Card>

      {/* ===== MODAL THÊM / SỬA ===== */}
      <Modal
        title={editingItem ? '✏️ Sửa học phần' : '➕ Thêm học phần mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingItem ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={720}
        styles={{ body: { maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}
          initialValues={{ isRequired: true, courseType: 'specialized', credits: 3 }}>

          {/* --- Thông tin cơ bản --- */}
          <Divider orientation="left" style={{ fontSize: 14 }}>📋 Thông tin cơ bản</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="courseCode" label="Mã học phần" rules={[{ required: true, message: 'Nhập mã HP' }]}>
                <Input placeholder="VD: IT001" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Tên học phần" rules={[{ required: true, message: 'Nhập tên HP' }]}>
                <Input placeholder="VD: Lập trình Web" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="credits" label="Số tín chỉ" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="courseType" label="Nhóm học phần" rules={[{ required: true }]}>
                <Select options={courseTypeOptions} placeholder="Chọn nhóm" />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="isRequired" label="Loại học phần" valuePropName="checked">
                <Switch
                  checkedChildren="Bắt buộc"
                  unCheckedChildren="Tự chọn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả chung">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn về học phần..." />
          </Form.Item>

          {/* --- Điều kiện --- */}
          <Divider orientation="left" style={{ fontSize: 14 }}>🔗 Điều kiện học phần</Divider>

          <Form.Item name="prerequisiteCourses" label="Học phần tiên quyết"
            tooltip="Học phần mà sinh viên phải hoàn thành trước khi đăng ký HP này"
            extra="Chọn các HP mà sinh viên PHẢI hoàn thành trước">
            <Select
              mode="multiple"
              options={filteredCourseOptions}
              placeholder="Tìm và chọn HP tiên quyết..."
              showSearch
              filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
              allowClear
            />
          </Form.Item>

          <Form.Item name="corequisiteCourses" label="Học phần song hành"
            tooltip="Học phần có thể học đồng thời (cùng kỳ)"
            extra="Chọn các HP có thể đăng ký cùng lúc">
            <Select
              mode="multiple"
              options={filteredCourseOptions}
              placeholder="Tìm và chọn HP song hành..."
              showSearch
              filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
              allowClear
            />
          </Form.Item>

          {/* --- Kiến thức --- */}
          <Divider orientation="left" style={{ fontSize: 14 }}>📚 Nội dung kiến thức</Divider>

          <Form.Item name="theoryDescription" label="Kiến thức lý thuyết"
            extra="Mô tả phần lý thuyết: khái niệm, nguyên lý, thuật toán...">
            <Input.TextArea rows={3} placeholder="VD: Giới thiệu kiến trúc web, HTTP protocol, RESTful API design patterns, MVC architecture..." />
          </Form.Item>

          <Form.Item name="practiceDescription" label="Kiến thức thực hành (nếu có)"
            extra="Mô tả phần thực hành: bài lab, project, thực tập...">
            <Input.TextArea rows={3} placeholder="VD: Xây dựng ứng dụng CRUD với React + Node.js, triển khai Docker..." />
          </Form.Item>

          {/* --- Kỹ năng --- */}
          <Divider orientation="left" style={{ fontSize: 14 }}>💡 Kỹ năng đóng góp</Divider>

          <Form.Item name="contributedSkills" label="Kỹ năng liên quan"
            extra="Các kỹ năng mà sinh viên sẽ đạt được sau khi hoàn thành HP">
            <Select
              mode="multiple"
              options={skillOptions}
              placeholder="Chọn kỹ năng..."
              showSearch
              filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
