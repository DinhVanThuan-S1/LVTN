/**
 * Admin Job Approval — Duyệt tin tuyển dụng
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Modal, Input, Tooltip, Empty, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, BankOutlined } from '@ant-design/icons';
import { jobService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function AdminJobApprovalPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, jobId: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getPendingJobs();
      setJobs(res.data || []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleApprove = async (id) => {
    try {
      await jobService.approveJob(id);
      message.success('Đã duyệt tin tuyển dụng');
      fetchJobs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleReject = async () => {
    try {
      await jobService.rejectJob(rejectModal.jobId, rejectReason);
      message.success('Đã từ chối tin tuyển dụng');
      setRejectModal({ open: false, jobId: null });
      setRejectReason('');
      fetchJobs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Tin tuyển dụng',
      key: 'job',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <BankOutlined /> {r.recruiterId?.profile?.fullName || '—'} · {r.recruiterId?.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (t) => <Tag>{t}</Tag>,
    },
    {
      title: 'Mức lương',
      key: 'salary',
      render: (_, r) => r.salary?.isNegotiable ? 'Thỏa thuận' : `${r.salary?.min || 0} - ${r.salary?.max || 0}`,
    },
    {
      title: 'Ngày gửi',
      key: 'submittedAt',
      render: (_, r) => dayjs(r.updatedAt).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space>
          <Tooltip title="Duyệt">
            <Button type="primary" icon={<CheckOutlined />} size="small"
              style={{ background: '#10B981', border: 'none' }}
              onClick={() => handleApprove(r._id)} />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button danger icon={<CloseOutlined />} size="small"
              onClick={() => setRejectModal({ open: true, jobId: r._id })} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          🛡️ Duyệt tin tuyển dụng <Badge count={jobs.length} style={{ marginLeft: 8 }} />
        </Title>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="_id"
          loading={loading}
          locale={{ emptyText: <Empty description="Không có tin nào chờ duyệt 🎉" /> }}
        />
      </Card>

      <Modal
        title="Lý do từ chối"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, jobId: null })}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối tin tuyển dụng..."
        />
      </Modal>
    </div>
  );
}
