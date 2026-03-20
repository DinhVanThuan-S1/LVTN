/**
 * Recruiter Applicants Page — Quản lý ứng viên cho từng tin tuyển dụng
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Select, message, Modal, Form, Input, DatePicker, Avatar, Tooltip, Popconfirm, Empty, Tabs, Badge } from 'antd';
import {
  UserOutlined, CheckOutlined, CloseOutlined, CalendarOutlined,
  EyeOutlined, FileTextOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { jobService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusConfig = {
  pending: { color: 'processing', label: 'Chờ xử lý' },
  reviewing: { color: 'blue', label: 'Đang xem' },
  interview_scheduled: { color: 'purple', label: 'Phỏng vấn' },
  accepted: { color: 'success', label: 'Chấp nhận' },
  rejected: { color: 'error', label: 'Từ chối' },
  withdrawn: { color: 'default', label: 'Đã rút' },
};

export default function RecruiterApplicantsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [interviewModal, setInterviewModal] = useState({ open: false, appId: null });
  const [interviewForm] = Form.useForm();
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // Fetch danh sách tin tuyển dụng
  useEffect(() => {
    jobService.getRecruiterJobs()
      .then((res) => {
        const myJobs = res.data || [];
        setJobs(myJobs);
        if (myJobs.length > 0) setSelectedJob(myJobs[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch applicants khi chọn job
  useEffect(() => {
    if (!selectedJob) return;
    setAppLoading(true);
    jobService.getJobApplications(selectedJob)
      .then((res) => setApplicants(res.data || []))
      .catch(() => setApplicants([]))
      .finally(() => setAppLoading(false));
  }, [selectedJob]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await jobService.updateApplicationStatus(appId, { status });
      message.success(`Đã cập nhật trạng thái: ${statusConfig[status]?.label}`);
      // Refresh
      const res = await jobService.getJobApplications(selectedJob);
      setApplicants(res.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleScheduleInterview = async (values) => {
    try {
      await jobService.scheduleInterview(interviewModal.appId, {
        scheduledAt: values.scheduledAt?.toISOString(),
        location: values.location,
        notes: values.notes,
      });
      message.success('Đã lên lịch phỏng vấn! 📅');
      setInterviewModal({ open: false, appId: null });
      interviewForm.resetFields();
      // Refresh
      const res = await jobService.getJobApplications(selectedJob);
      setApplicants(res.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Ứng viên', key: 'applicant',
      render: (_, r) => (
        <Space>
          <Avatar src={r.studentId?.profile?.avatar} icon={<UserOutlined />} style={{ background: '#4F46E5' }} />
          <div>
            <Text strong>{r.studentId?.profile?.fullName || '—'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.studentId?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Match %', dataIndex: 'matchScore', key: 'matchScore',
      render: (score) => score ? (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'blue' : 'orange'}>{score}%</Tag>
      ) : '—',
      sorter: (a, b) => (a.matchScore || 0) - (b.matchScore || 0),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label}</Tag>,
      filters: Object.entries(statusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (v, r) => r.status === v,
    },
    {
      title: 'Ngày nộp', dataIndex: 'appliedAt', key: 'appliedAt',
      render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.appliedAt).unix() - dayjs(b.appliedAt).unix(),
    },
    {
      title: 'Thao tác', key: 'actions', width: 200,
      render: (_, r) => (
        <Space wrap>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, data: r })} />
          </Tooltip>
          {r.status === 'pending' && (
            <>
              <Tooltip title="Đang xem xét">
                <Button type="text" icon={<EyeOutlined />} style={{ color: '#3B82F6' }}
                  onClick={() => handleUpdateStatus(r._id, 'reviewing')} />
              </Tooltip>
            </>
          )}
          {['pending', 'reviewing'].includes(r.status) && (
            <>
              <Tooltip title="Lên lịch phỏng vấn">
                <Button type="text" icon={<CalendarOutlined />} style={{ color: '#8B5CF6' }}
                  onClick={() => setInterviewModal({ open: true, appId: r._id })} />
              </Tooltip>
              <Tooltip title="Chấp nhận">
                <Button type="text" icon={<CheckOutlined />} style={{ color: '#10B981' }}
                  onClick={() => handleUpdateStatus(r._id, 'accepted')} />
              </Tooltip>
              <Popconfirm title="Từ chối ứng viên?" onConfirm={() => handleUpdateStatus(r._id, 'rejected')}>
                <Tooltip title="Từ chối">
                  <Button type="text" danger icon={<CloseOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>👥 Quản lý ứng viên</Title>

      {/* Job Selector */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Space>
          <Text strong>Chọn tin tuyển dụng:</Text>
          <Select style={{ width: 400 }} value={selectedJob} onChange={setSelectedJob}
            loading={loading} placeholder="Chọn tin..."
            options={jobs.map((j) => ({
              value: j._id,
              label: <Space>{j.title} <Badge count={j.applicationCount || 0} style={{ background: '#4F46E5' }} /></Space>,
            }))} />
        </Space>
      </Card>

      {/* Applicants Table */}
      <Card style={{ borderRadius: 16 }}>
        <Table dataSource={applicants} columns={columns} rowKey="_id" loading={appLoading}
          locale={{ emptyText: <Empty description="Chưa có ứng viên cho tin này" /> }}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} ứng viên` }} />
      </Card>

      {/* Interview Modal */}
      <Modal title="📅 Lên lịch phỏng vấn" open={interviewModal.open}
        onCancel={() => { setInterviewModal({ open: false, appId: null }); interviewForm.resetFields(); }}
        onOk={() => interviewForm.submit()} okText="Xác nhận" cancelText="Hủy">
        <Form form={interviewForm} layout="vertical" onFinish={handleScheduleInterview} style={{ marginTop: 16 }}>
          <Form.Item name="scheduledAt" label="Thời gian" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" placeholder="Chọn ngày giờ" />
          </Form.Item>
          <Form.Item name="location" label="Địa điểm / Link meeting">
            <Input placeholder="VD: Phòng 301 hoặc https://meet.google.com/..." />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú cho ứng viên..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title="📄 Chi tiết đơn ứng tuyển" open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null })} footer={null} width={560}>
        {detailModal.data && (
          <div style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Avatar size={48} src={detailModal.data.studentId?.profile?.avatar} icon={<UserOutlined />}
                style={{ background: '#4F46E5' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>{detailModal.data.studentId?.profile?.fullName}</Text>
                <br />
                <Text type="secondary">{detailModal.data.studentId?.email}</Text>
              </div>
            </Space>
            {detailModal.data.matchScore && (
              <Tag color="blue" style={{ marginBottom: 12 }}>Match: {detailModal.data.matchScore}%</Tag>
            )}
            {detailModal.data.coverLetter && (
              <>
                <Title level={5}>Thư xin việc</Title>
                <Paragraph>{detailModal.data.coverLetter}</Paragraph>
              </>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ứng tuyển lúc: {dayjs(detailModal.data.appliedAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
