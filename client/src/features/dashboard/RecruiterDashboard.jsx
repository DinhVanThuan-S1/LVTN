/**
 * Recruiter Dashboard
 */
import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, List, Avatar, Tag, Skeleton, Empty, Button } from 'antd';
import {
  AppstoreOutlined, FileTextOutlined, EyeOutlined, TeamOutlined,
  PlusOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors = {
  draft: 'default', pending_review: 'processing', published: 'success',
  rejected: 'error', expired: 'warning', closed: 'default',
};
const statusLabels = {
  draft: 'Nháp', pending_review: 'Chờ duyệt', published: 'Đang tuyển',
  rejected: 'Từ chối', expired: 'Hết hạn', closed: 'Đã đóng',
};

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsService.getRecruiterDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  const overview = data?.overview || {};

  const stats = [
    { title: 'Tổng tin', value: overview.totalJobs, icon: <AppstoreOutlined />, color: '#4F46E5' },
    { title: 'Đang tuyển', value: overview.publishedJobs, icon: <EyeOutlined />, color: '#10B981' },
    { title: 'Tổng đơn', value: overview.totalApplications, icon: <FileTextOutlined />, color: '#F59E0B' },
    { title: 'Đơn chờ xử lý', value: overview.pendingApplications, icon: <TeamOutlined />, color: '#EF4444' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>🏢 Dashboard Nhà tuyển dụng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/my-jobs/create')}>
          Đăng tin mới
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div className="dashboard-stat-card hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginTop: 4 }}>
                    {stat.value || 0}
                  </div>
                </div>
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📋 Tin tuyển dụng gần đây" style={{ borderRadius: 16 }}
            extra={<a onClick={() => navigate('/my-jobs')}>Xem tất cả</a>}>
            {data?.recentJobs?.length ? (
              <List
                dataSource={data.recentJobs}
                renderItem={(job) => (
                  <List.Item>
                    <List.Item.Meta
                      title={job.title}
                      description={<>
                        <Tag color={statusColors[job.status]}>{statusLabels[job.status]}</Tag>
                        <Text type="secondary"> · {job.applicationCount} đơn · {job.viewCount} lượt xem</Text>
                      </>}
                    />
                  </List.Item>
                )}
              />
            ) : <Empty description="Chưa có tin tuyển dụng" />}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="👥 Đơn ứng tuyển gần đây" style={{ borderRadius: 16 }}>
            {data?.recentApplications?.length ? (
              <List
                dataSource={data.recentApplications.slice(0, 5)}
                renderItem={(app) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} style={{ background: '#4F46E5' }} />}
                      title={app.studentId?.profile?.fullName || 'Ứng viên'}
                      description={<>
                        {app.jobId?.title}
                        <br />
                        <ClockCircleOutlined /> {dayjs(app.appliedAt).format('DD/MM/YYYY HH:mm')}
                      </>}
                    />
                  </List.Item>
                )}
              />
            ) : <Empty description="Chưa có đơn ứng tuyển" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
