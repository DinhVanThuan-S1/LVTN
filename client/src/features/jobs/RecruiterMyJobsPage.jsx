/**
 * Recruiter My Jobs — Quản lý tin tuyển dụng
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Popconfirm, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  draft: { color: 'default', label: 'Nháp' },
  pending_review: { color: 'processing', label: 'Chờ duyệt' },
  published: { color: 'success', label: 'Đang tuyển' },
  rejected: { color: 'error', label: 'Từ chối' },
  expired: { color: 'warning', label: 'Hết hạn' },
  closed: { color: 'default', label: 'Đã đóng' },
};

export default function RecruiterMyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getRecruiterJobs();
      setJobs(res.data || []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (id) => {
    try {
      await jobService.submitForReview(id);
      message.success('Đã gửi duyệt tin tuyển dụng');
      fetchJobs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await jobService.deleteJob(id);
      message.success('Đã xóa tin tuyển dụng');
      fetchJobs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title, r) => <Text strong style={{ cursor: 'pointer', color: '#4F46E5' }}
        onClick={() => navigate(`/my-jobs/${r._id}/edit`)}>{title}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label}</Tag>,
    },
    {
      title: 'Đơn ứng tuyển',
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      render: (c) => <Badge count={c || 0} showZero style={{ backgroundColor: c > 0 ? '#4F46E5' : '#d9d9d9' }} />,
      sorter: (a, b) => (a.applicationCount || 0) - (b.applicationCount || 0),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      render: (c) => <><EyeOutlined /> {c || 0}</>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => dayjs(d).format('DD/MM/YYYY'),
      responsive: ['lg'],
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, r) => (
        <Space>
          {r.status === 'draft' && (
            <Tooltip title="Gửi duyệt">
              <Button type="text" icon={<SendOutlined />} onClick={() => handleSubmit(r._id)} style={{ color: '#10B981' }} />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/my-jobs/${r._id}/edit`)} />
          </Tooltip>
          {['draft', 'rejected'].includes(r.status) && (
            <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Hủy">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>📋 Tin tuyển dụng của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/my-jobs/create')}>
          Đăng tin mới
        </Button>
      </div>

      <Card style={{ borderRadius: 16 }}>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} tin` }}
        />
      </Card>
    </div>
  );
}
