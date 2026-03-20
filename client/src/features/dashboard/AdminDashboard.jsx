/**
 * Admin Dashboard
 */
import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, List, Tag, Skeleton, Badge } from 'antd';
import {
  TeamOutlined, AppstoreOutlined, BulbOutlined, BookOutlined,
  ClockCircleOutlined, SafetyCertificateOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsService.getAdminDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  const o = data?.overview || {};

  const stats = [
    { title: 'Sinh viên', value: o.totalStudents, icon: <TeamOutlined />, color: '#4F46E5' },
    { title: 'Nhà tuyển dụng', value: o.totalRecruiters, icon: <AppstoreOutlined />, color: '#10B981' },
    { title: 'Tin tuyển dụng', value: o.totalJobs, icon: <FileTextOutlined />, color: '#F59E0B' },
    { title: 'Chờ duyệt', value: o.pendingJobs, icon: <ClockCircleOutlined />, color: '#EF4444',
      badge: o.pendingJobs > 0 },
    { title: 'Đơn ứng tuyển', value: o.totalApplications, icon: <SafetyCertificateOutlined />, color: '#8B5CF6' },
    { title: 'Kỹ năng', value: o.totalSkills, icon: <BulbOutlined />, color: '#06B6D4' },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>⚙️ Dashboard Quản trị</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={4} key={i}>
            <div className="dashboard-stat-card hover-lift"
              style={{ cursor: stat.badge ? 'pointer' : 'default' }}
              onClick={() => stat.badge && navigate('/admin/jobs')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{stat.title}</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, marginTop: 4 }}>
                    {stat.badge ? <Badge count={stat.value} overflowCount={99} style={{ backgroundColor: stat.color }} /> : (stat.value || 0)}
                  </div>
                </div>
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color, width: 40, height: 40, fontSize: 18 }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="🏆 Top Kỹ năng yêu cầu" style={{ borderRadius: 16 }}>
            {data?.topSkills?.length ? (
              <List
                dataSource={data.topSkills}
                renderItem={(skill, i) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Tag color="blue" style={{ fontSize: 14, padding: '2px 10px' }}>#{i + 1}</Tag>}
                      title={skill.name}
                      description={<Tag>{skill.category}</Tag>}
                    />
                    <Text strong>{skill.count} tin</Text>
                  </List.Item>
                )}
              />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📈 Tăng trưởng người dùng" style={{ borderRadius: 16 }}>
            {data?.userGrowth?.length ? (
              <List
                dataSource={data.userGrowth}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{`${item._id.month}/${item._id.year}`}</Text>
                    <Tag color={item._id.role === 'student' ? 'blue' : 'green'}>
                      {item._id.role === 'student' ? 'SV' : 'NTD'}: +{item.count}
                    </Tag>
                  </List.Item>
                )}
              />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
