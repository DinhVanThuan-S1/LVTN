/**
 * Academic Profile — Hồ sơ học tập (Student)
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Button, Form, Input, InputNumber, Select, Row, Col, Tag, Space, Empty, Skeleton, Modal, message, Divider, Popconfirm, List, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { academicProfileService, publicService } from '../../services';

const { Title, Text } = Typography;

const gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].map((g) => ({ value: g, label: g }));

export default function AcademicProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    academicProfileService.getMyProfile()
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    publicService.getCourses({ limit: 200 })
      .then((res) => setCourseOptions((res.data || []).map((c) => ({ value: c._id, label: `${c.courseCode} - ${c.name}` }))))
      .catch(() => {});
  }, []);

  const handleSaveSemester = async (values) => {
    setSaving(true);
    try {
      const payload = {
        semesterName: values.semesterName,
        year: values.year,
        courses: values.courses || [],
      };
      if (editingSem) {
        await academicProfileService.updateSemester(editingSem._id, payload);
        message.success('Cập nhật thành công!');
      } else {
        await academicProfileService.addSemester(payload);
        message.success('Thêm học kỳ thành công!');
      }
      setModalOpen(false); form.resetFields(); setEditingSem(null);
      // Refresh
      const res = await academicProfileService.getMyProfile();
      setProfile(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDeleteSemester = async (semId) => {
    try {
      await academicProfileService.deleteSemester(semId);
      message.success('Đã xóa học kỳ!');
      const res = await academicProfileService.getMyProfile();
      setProfile(res.data);
    } catch (err) { message.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>📚 Hồ sơ học tập</Title>
        <Button type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditingSem(null); form.resetFields(); setModalOpen(true); }}>
          Thêm học kỳ
        </Button>
      </div>

      {/* GPA Overview */}
      {profile && (
        <Card style={{ borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
          <Row gutter={24} align="middle">
            <Col>
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: 32, color: '#4F46E5', marginBottom: 8 }} />
                <div style={{ fontSize: 36, fontWeight: 700, color: '#4F46E5' }}>
                  {profile.cumulativeGPA?.toFixed(2) || '—'}
                </div>
                <Text type="secondary">GPA Tích lũy</Text>
              </div>
            </Col>
            <Col>
              <Text type="secondary">Tổng tín chỉ: <strong>{profile.totalCredits || 0}</strong></Text>
              <br />
              <Text type="secondary">Số học kỳ: <strong>{profile.semesters?.length || 0}</strong></Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Semesters */}
      {!profile?.semesters?.length ? (
        <Card style={{ borderRadius: 16 }}>
          <Empty description="Chưa có dữ liệu. Hãy thêm học kỳ đầu tiên!" />
        </Card>
      ) : (
        profile.semesters.map((sem) => (
          <Card key={sem._id} style={{ borderRadius: 16, marginBottom: 12 }}
            title={<Space>
              <BookOutlined style={{ color: '#4F46E5' }} />
              <strong>{sem.semesterName} {sem.year}</strong>
              {sem.semesterGPA && <Tag color="blue">GPA: {sem.semesterGPA.toFixed(2)}</Tag>}
            </Space>}
            extra={<Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingSem(sem); form.setFieldsValue(sem); setModalOpen(true); }} />
              <Popconfirm title="Xóa học kỳ?" onConfirm={() => handleDeleteSemester(sem._id)}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>}>
            {sem.courses?.length > 0 ? (
              <List size="small" dataSource={sem.courses}
                renderItem={(c) => (
                  <List.Item>
                    <Text>{c.courseId?.name || c.courseId?.courseCode || 'Học phần'}</Text>
                    <Space>
                      <Tag color={c.grade?.startsWith('A') ? 'green' : c.grade?.startsWith('B') ? 'blue' : 'default'}>
                        {c.grade}
                      </Tag>
                    </Space>
                  </List.Item>
                )} />
            ) : <Text type="secondary">Chưa có môn học</Text>}
          </Card>
        ))
      )}

      {/* Modal */}
      <Modal title={editingSem ? 'Sửa học kỳ' : 'Thêm học kỳ'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()} confirmLoading={saving}
        okText={editingSem ? 'Cập nhật' : 'Thêm'} cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" onFinish={handleSaveSemester} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="semesterName" label="Học kỳ" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'HK1', label: 'Học kỳ 1' },
                  { value: 'HK2', label: 'Học kỳ 2' },
                  { value: 'HK3', label: 'Học kỳ hè' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={2020} max={2030} placeholder="2025" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Môn học</Divider>
          <Form.List name="courses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row gutter={8} key={key} align="middle" style={{ marginBottom: 8 }}>
                    <Col flex="auto">
                      <Form.Item {...rest} name={[name, 'courseId']} style={{ marginBottom: 0 }}>
                        <Select options={courseOptions} placeholder="Chọn môn" showSearch
                          filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
                      </Form.Item>
                    </Col>
                    <Col style={{ width: 90 }}>
                      <Form.Item {...rest} name={[name, 'grade']} style={{ marginBottom: 0 }}>
                        <Select options={gradeOptions} placeholder="Điểm" />
                      </Form.Item>
                    </Col>
                    <Col><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} /></Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm môn học
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
