/**
 * Student Dashboard
 */
import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Progress, Statistic, Tag, List, Avatar, Skeleton, Empty } from 'antd';
import {
  BookOutlined, RocketOutlined, FileTextOutlined, TrophyOutlined,
  ArrowUpOutlined, BulbOutlined, StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const statColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsService.getStudentDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;

  const overview = data?.overview || {};
  const stats = [
    { title: 'GPA Tích lũy', value: overview.cumulativeGPA || '—', icon: <StarOutlined />, color: statColors[0] },
    { title: 'Lộ trình đang học', value: overview.totalRoadmaps || 0, icon: <RocketOutlined />, color: statColors[1] },
    { title: 'Đã hoàn thành', value: overview.completedRoadmaps || 0, icon: <TrophyOutlined />, color: statColors[2] },
    { title: 'Đơn ứng tuyển', value: overview.totalApplications || 0, icon: <FileTextOutlined />, color: statColors[3] },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>🎓 Dashboard Sinh viên</Title>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div className="dashboard-stat-card hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginTop: 4 }}>
                    {stat.value}
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
        {/* Active Roadmaps */}
        <Col xs={24} lg={14}>
          <Card
            title={<><RocketOutlined /> Lộ trình đang học</>}
            extra={<a onClick={() => navigate('/my-roadmaps')}>Xem tất cả</a>}
            style={{ borderRadius: 16 }}
          >
            {data?.activeRoadmaps?.length ? (
              <List
                dataSource={data.activeRoadmaps}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer', borderRadius: 8, padding: '12px 0' }}
                    onClick={() => navigate(`/my-roadmaps/${item._id}`)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: '#4F46E5' }} icon={<BookOutlined />} />}
                      title={item.roadmapId?.title}
                      description={`${item.completedSteps}/${item.totalSteps} bước hoàn thành`}
                    />
                    <Progress
                      type="circle"
                      percent={item.overallProgress}
                      size={48}
                      strokeColor={{ '0%': '#4F46E5', '100%': '#7C3AED' }}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Chưa đăng ký lộ trình nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <a onClick={() => navigate('/roadmaps')}>Khám phá lộ trình</a>
              </Empty>
            )}
          </Card>
        </Col>

        {/* Top Skills */}
        <Col xs={24} lg={10}>
          <Card
            title={<><BulbOutlined /> Top Kỹ năng</>}
            extra={<a onClick={() => navigate('/skill-map')}>Xem bản đồ</a>}
            style={{ borderRadius: 16 }}
          >
            {data?.topSkills?.length ? (
              data.topSkills.map((skill, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{skill.skillName || skill.name}</Text>
                    <Text type="secondary">{Math.round(skill.proficiency || 0)}%</Text>
                  </div>
                  <Progress
                    percent={Math.round(skill.proficiency || 0)}
                    showInfo={false}
                    strokeColor={{ '0%': '#4F46E5', '100%': '#7C3AED' }}
                    size="small"
                  />
                </div>
              ))
            ) : (
              <Empty description="Chưa có dữ liệu kỹ năng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
