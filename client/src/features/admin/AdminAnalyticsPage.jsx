/**
 * Admin Analytics — Thống kê hệ thống
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Skeleton, Space, Tag, List, Progress, Divider } from 'antd';
import {
  TeamOutlined, RocketOutlined, BulbOutlined, FileTextOutlined,
  TrophyOutlined, RiseOutlined, UserOutlined, BarChartOutlined,
  BookOutlined, AimOutlined,
} from '@ant-design/icons';
import { analyticsService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdminDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (!data) return <div style={{ padding: 24 }}>Không tải được dữ liệu thống kê</div>;

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>📊 Thống kê Hệ thống</Title>

      {/* Top Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng người dùng', value: (data.students?.total || 0) + (data.recruiters?.total || 0), icon: <TeamOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
          { title: 'Sinh viên', value: data.students?.total || 0, icon: <UserOutlined />, color: '#10B981', bg: '#F0FDF4' },
          { title: 'Nhà tuyển dụng', value: data.recruiters?.total || 0, icon: <UserOutlined />, color: '#F59E0B', bg: '#FEF3C7' },
          { title: 'Kỹ năng', value: data.skills?.total || 0, icon: <BulbOutlined />, color: '#8B5CF6', bg: '#EDE9FE' },
          { title: 'Lộ trình', value: data.roadmaps?.total || 0, icon: <RocketOutlined />, color: '#06B6D4', bg: '#ECFEFF' },
          { title: 'Tin tuyển dụng', value: data.jobs?.total || 0, icon: <FileTextOutlined />, color: '#EF4444', bg: '#FEF2F2' },
        ].map((stat, i) => (
          <Col xs={12} sm={8} lg={4} key={i}>
            <Card style={{ borderRadius: 14, background: stat.bg, border: 'none' }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{stat.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, lineHeight: 1.2, marginTop: 4 }}>
                    {stat.value}
                  </div>
                </div>
                <div style={{ fontSize: 20, color: stat.color, opacity: 0.6 }}>{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Top Skills */}
        <Col xs={24} lg={12}>
          <Card title={<><TrophyOutlined /> Top kỹ năng phổ biến</>} style={{ borderRadius: 16, height: '100%' }}>
            {data.topSkills?.length > 0 ? (
              <List size="small" dataSource={data.topSkills.slice(0, 8)}
                renderItem={(skill, idx) => (
                  <List.Item>
                    <Space>
                      <Tag color={idx < 3 ? 'gold' : 'default'} style={{ width: 24, textAlign: 'center' }}>{idx + 1}</Tag>
                      <Text strong>{skill.name || skill._id}</Text>
                    </Space>
                    <Tag color="blue">{skill.count || skill.popularity || 0}</Tag>
                  </List.Item>
                )} />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>

        {/* User Growth */}
        <Col xs={24} lg={12}>
          <Card title={<><RiseOutlined /> Tăng trưởng người dùng</>} style={{ borderRadius: 16, height: '100%' }}>
            {data.userGrowth?.length > 0 ? (
              <List size="small" dataSource={data.userGrowth.slice(0, 8)}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item.month}/{item.year}</Text>
                    <Space>
                      <Tag color="blue">SV: +{item.students || 0}</Tag>
                      <Tag color="green">NTD: +{item.recruiters || 0}</Tag>
                    </Space>
                  </List.Item>
                )} />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>

        {/* Job Stats */}
        <Col xs={24} lg={12}>
          <Card title={<><FileTextOutlined /> Thống kê tuyển dụng</>} style={{ borderRadius: 16 }}>
            <Row gutter={16}>
              {[
                { label: 'Đã xuất bản', value: data.jobs?.published || 0, color: '#10B981' },
                { label: 'Chờ duyệt', value: data.jobs?.pending || 0, color: '#F59E0B' },
                { label: 'Tổng đơn ứng tuyển', value: data.applications?.total || 0, color: '#4F46E5' },
                { label: 'Đã chấp nhận', value: data.applications?.accepted || 0, color: '#10B981' },
              ].map((s, i) => (
                <Col span={12} key={i} style={{ marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 12, background: '#F8FAFC', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Roadmap Stats */}
        <Col xs={24} lg={12}>
          <Card title={<><RocketOutlined /> Thống kê lộ trình</>} style={{ borderRadius: 16 }}>
            <Row gutter={16}>
              {[
                { label: 'Đã xuất bản', value: data.roadmaps?.published || 0, color: '#10B981' },
                { label: 'Tổng đăng ký', value: data.roadmaps?.enrollments || 0, color: '#4F46E5' },
                { label: 'Đang học', value: data.roadmaps?.active || 0, color: '#F59E0B' },
                { label: 'Hoàn thành', value: data.roadmaps?.completed || 0, color: '#10B981' },
              ].map((s, i) => (
                <Col span={12} key={i} style={{ marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 12, background: '#F8FAFC', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
