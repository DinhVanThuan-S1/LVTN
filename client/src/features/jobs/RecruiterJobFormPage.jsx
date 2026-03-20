/**
 * Recruiter Job Form — Tạo / Sửa tin tuyển dụng
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Form, Input, Select, InputNumber, DatePicker, Switch, Button, Row, Col, Divider, message, Skeleton, Space, Tag } from 'antd';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { jobService } from '../../services';
import { publicService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const jobTypes = [
  { value: 'full_time', label: 'Toàn thời gian' },
  { value: 'part_time', label: 'Bán thời gian' },
  { value: 'internship', label: 'Thực tập' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'remote', label: 'Remote' },
];
const expLevels = [
  { value: 'intern', label: 'Thực tập sinh' },
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

export default function RecruiterJobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [skillOptions, setSkillOptions] = useState([]);
  const isEdit = !!id;

  useEffect(() => {
    publicService.getSkills({ limit: 200 })
      .then((res) => setSkillOptions((res.data || []).map((s) => ({ value: s._id, label: s.name }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      jobService.getRecruiterJobs()
        .then((res) => {
          const job = (res.data || []).find((j) => j._id === id);
          if (job) {
            form.setFieldsValue({
              ...job,
              deadline: job.deadline ? dayjs(job.deadline) : null,
              requiredSkills: job.requiredSkills?.map((rs) => rs.skillId?._id || rs.skillId),
              'salary.min': job.salary?.min,
              'salary.max': job.salary?.max,
              'salary.isNegotiable': job.salary?.isNegotiable,
              'location.city': job.location?.city,
              'location.address': job.location?.address,
              'location.isRemote': job.location?.isRemote,
            });
          }
        })
        .catch(() => message.error('Không tải được thông tin'))
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        requirements: values.requirements,
        benefits: values.benefits,
        jobType: values.jobType,
        experienceLevel: values.experienceLevel,
        deadline: values.deadline?.toISOString(),
        salary: {
          min: values['salary.min'],
          max: values['salary.max'],
          currency: 'VND',
          isNegotiable: values['salary.isNegotiable'] || false,
        },
        location: {
          city: values['location.city'],
          address: values['location.address'],
          isRemote: values['location.isRemote'] || false,
        },
        requiredSkills: values.requiredSkills?.map((skillId) => ({ skillId, level: 'intermediate' })),
      };

      if (isEdit) {
        await jobService.updateJob(id, payload);
        message.success('Cập nhật tin tuyển dụng thành công!');
      } else {
        await jobService.createJob(payload);
        message.success('Tạo tin tuyển dụng thành công!');
      }
      navigate('/my-jobs');
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <div className="animate-fade-in-up">
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/my-jobs')}>Quay lại</Button>
        <Title level={3} style={{ margin: 0 }}>{isEdit ? '✏️ Sửa tin tuyển dụng' : '📝 Đăng tin tuyển dụng'}</Title>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave} scrollToFirstError>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Thông tin cơ bản" style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                <Input placeholder="VD: Frontend Developer (React.js)" size="large" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả công việc" rules={[{ required: true }]}>
                <TextArea rows={6} placeholder="Mô tả chi tiết công việc..." />
              </Form.Item>
              <Form.Item name="requirements" label="Yêu cầu ứng viên">
                <TextArea rows={4} placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..." />
              </Form.Item>
              <Form.Item name="benefits" label="Quyền lợi">
                <TextArea rows={3} placeholder="Phúc lợi, chế độ đãi ngộ..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Chi tiết" style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="jobType" label="Loại công việc" rules={[{ required: true }]}>
                <Select options={jobTypes} placeholder="Chọn loại" />
              </Form.Item>
              <Form.Item name="experienceLevel" label="Kinh nghiệm" rules={[{ required: true }]}>
                <Select options={expLevels} placeholder="Chọn mức" />
              </Form.Item>
              <Form.Item name="deadline" label="Hạn nộp">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Card>

            <Card title="Mức lương" style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="salary.isNegotiable" label="Thỏa thuận" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="salary.min" label="Từ">
                    <InputNumber style={{ width: '100%' }} placeholder="Min" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="salary.max" label="Đến">
                    <InputNumber style={{ width: '100%' }} placeholder="Max" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Địa điểm" style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="location.city" label="Thành phố">
                <Input placeholder="VD: Hồ Chí Minh" />
              </Form.Item>
              <Form.Item name="location.address" label="Địa chỉ">
                <Input placeholder="Địa chỉ cụ thể" />
              </Form.Item>
              <Form.Item name="location.isRemote" label="Cho phép Remote" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Kỹ năng yêu cầu" style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="requiredSkills">
                <Select mode="multiple" options={skillOptions} placeholder="Chọn kỹ năng" showSearch
                  filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button size="large" onClick={() => navigate('/my-jobs')}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}
              style={{ borderRadius: 12 }}>
              {isEdit ? 'Cập nhật' : 'Lưu nháp'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
