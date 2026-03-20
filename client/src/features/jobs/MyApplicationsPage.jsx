/**
 * My Applications — Đơn ứng tuyển của tôi (Student)
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Empty, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, CloseCircleOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  pending: { color: 'processing', label: 'Chờ xử lý' },
  reviewing: { color: 'blue', label: 'Đang xem xét' },
  interview_scheduled: { color: 'purple', label: 'Phỏng vấn' },
  accepted: { color: 'success', label: 'Được nhận' },
  rejected: { color: 'error', label: 'Từ chối' },
  withdrawn: { color: 'default', label: 'Đã rút' },
};

export default function MyApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await jobService.getMyApplications();
      setApps(res.data || []);
    } catch { setApps([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleWithdraw = async (id) => {
    try {
      await jobService.withdrawApplication(id);
      message.success('Đã rút đơn ứng tuyển');
      fetchApps();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Vị trí',
      key: 'job',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: 'pointer', color: '#4F46E5' }}
            onClick={() => navigate(`/jobs/${r.jobId?._id}`)}>
            {r.jobId?.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <BankOutlined /> {r.jobId?.companyId?.companyName || '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = statusConfig[status] || {};
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
      filters: Object.entries(statusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (v, r) => r.status === v,
    },
    {
      title: 'Match %',
      dataIndex: 'matchScore',
      key: 'matchScore',
      render: (score) => score ? <Tag color="blue">{score}%</Tag> : '—',
      sorter: (a, b) => (a.matchScore || 0) - (b.matchScore || 0),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.appliedAt).unix() - dayjs(b.appliedAt).unix(),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, r) => (
        <Space>
          {['pending', 'reviewing'].includes(r.status) && (
            <Popconfirm title="Rút đơn ứng tuyển?" onConfirm={() => handleWithdraw(r._id)} okText="Rút đơn" cancelText="Hủy">
              <Tooltip title="Rút đơn">
                <Button type="text" danger icon={<CloseCircleOutlined />} size="small" />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>📄 Đơn ứng tuyển của tôi</Title>

      <Card style={{ borderRadius: 16 }}>
        <Table
          dataSource={apps}
          columns={columns}
          rowKey="_id"
          loading={loading}
          locale={{ emptyText: <Empty description="Chưa nộp đơn ứng tuyển nào" /> }}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} đơn` }}
        />
      </Card>
    </div>
  );
}
