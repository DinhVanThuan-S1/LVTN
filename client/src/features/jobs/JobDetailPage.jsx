/**
 * Job Detail Page — Chi tiết tin tuyển dụng + Apply
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Space, Skeleton, Descriptions, Divider, message, Row, Col, List, Avatar, Modal, Form, Input, Select, Result } from 'antd';
import {
  BankOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined,
  TeamOutlined, HeartOutlined, HeartFilled, SendOutlined, CheckCircleOutlined,
  CalendarOutlined, SafetyCertificateOutlined, GlobalOutlined,
} from '@ant-design/icons';
import { jobService, cvService } from '../../services';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const jobTypeLabels = {
  full_time: 'Toàn thời gian', part_time: 'Bán thời gian',
  internship: 'Thực tập', freelance: 'Freelance', remote: 'Remote',
};

const formatSalary = (salary) => {
  if (!salary || salary.isNegotiable) return 'Thỏa thuận';
  const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(0)} triệu` : `${(n / 1000).toFixed(0)}k`;
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)} ${salary.currency || 'VND'}`;
  return 'Thỏa thuận';
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [applying, setApplying] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    jobService.getDetail(id)
      .then((res) => setJob(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const openApplyModal = async () => {
    try {
      const res = await cvService.getAll();
      setCvList(res.data || []);
    } catch {}
    setApplyModal(true);
  };

  const handleApply = async (values) => {
    setApplying(true);
    try {
      await jobService.apply(id, values);
      message.success('Ứng tuyển thành công! 🎉');
      setApplyModal(false);
      navigate('/my-applications');
    } catch (err) {
      message.error(err.response?.data?.message || 'Ứng tuyển thất bại');
    } finally { setApplying(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (!job) return <Result status="404" title="Không tìm thấy" extra={<Button onClick={() => navigate('/jobs')}>Quay lại</Button>} />;

  return (
    <div className="animate-fade-in-up">
      <Row gutter={24}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16, marginBottom: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <Avatar size={72} src={job.companyId?.logo} icon={<BankOutlined />}
                style={{ background: '#EEF2FF', color: '#4F46E5', flexShrink: 0 }} />
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>{job.title}</Title>
                <Text style={{ fontSize: 16 }}>{job.companyId?.companyName || 'Công ty'}</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    <Tag color="blue">{jobTypeLabels[job.jobType]}</Tag>
                    <Tag>{job.experienceLevel}</Tag>
                    {job.location?.city && <Tag icon={<EnvironmentOutlined />}>{job.location.city}</Tag>}
                    {job.location?.isRemote && <Tag color="orange" icon={<GlobalOutlined />}>Remote</Tag>}
                  </Space>
                </div>
              </div>
            </div>

            <Divider />

            {/* Description */}
            <Title level={5}>📋 Mô tả công việc</Title>
            <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {job.description}
            </Paragraph>

            {/* Requirements */}
            {job.requirements && (
              <>
                <Divider />
                <Title level={5}>📌 Yêu cầu ứng viên</Title>
                <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {job.requirements}
                </Paragraph>
              </>
            )}

            {/* Benefits */}
            {job.benefits && (
              <>
                <Divider />
                <Title level={5}>🎁 Quyền lợi</Title>
                <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {job.benefits}
                </Paragraph>
              </>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Apply Card */}
          <Card style={{ borderRadius: 16, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4F46E5', marginBottom: 8 }}>
              <DollarOutlined /> {formatSalary(job.salary)}
            </div>
            {user?.role === 'student' && (
              <Button type="primary" size="large" icon={<SendOutlined />} block onClick={openApplyModal}
                style={{ height: 48, borderRadius: 12, fontSize: 16, fontWeight: 600,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', marginBottom: 8 }}>
                Ứng tuyển ngay
              </Button>
            )}
            <Space>
              <Text type="secondary"><CalendarOutlined /> Hạn: {job.deadline ? dayjs(job.deadline).format('DD/MM/YYYY') : '—'}</Text>
            </Space>
          </Card>

          {/* Info */}
          <Card title="📊 Thông tin" style={{ borderRadius: 16, marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Lượt xem"><TeamOutlined /> {job.viewCount || 0}</Descriptions.Item>
              <Descriptions.Item label="Đã ứng tuyển"><SendOutlined /> {job.applicationCount || 0}</Descriptions.Item>
              <Descriptions.Item label="Ngày đăng">{dayjs(job.publishedAt).format('DD/MM/YYYY')}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Required Skills */}
          {job.requiredSkills?.length > 0 && (
            <Card title="💡 Kỹ năng yêu cầu" style={{ borderRadius: 16 }}>
              {job.requiredSkills.map((rs, i) => (
                <Tag key={i} color="blue" style={{ marginBottom: 6, padding: '4px 12px' }}>
                  {rs.skillId?.name || 'Skill'}
                </Tag>
              ))}
            </Card>
          )}
        </Col>
      </Row>

      {/* Apply Modal */}
      <Modal
        title="📄 Ứng tuyển"
        open={applyModal}
        onCancel={() => setApplyModal(false)}
        onOk={() => form.submit()}
        confirmLoading={applying}
        okText="Gửi đơn"
        cancelText="Hủy"
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleApply} style={{ marginTop: 16 }}>
          <Form.Item name="cvId" label="Chọn CV">
            <Select placeholder="Chọn CV của bạn" allowClear
              options={cvList.map((cv) => ({ value: cv._id, label: cv.title || cv._id }))}
            />
          </Form.Item>
          <Form.Item name="coverLetter" label="Thư xin việc">
            <Input.TextArea rows={5} placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
