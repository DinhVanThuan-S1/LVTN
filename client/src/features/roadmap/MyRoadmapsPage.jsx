/**
 * My Roadmaps — Lộ trình của tôi (Student)
 */
import { useEffect, useState } from 'react';
import { Card, Typography, List, Progress, Tag, Empty, Skeleton, Button, Space, Avatar, Tabs } from 'antd';
import {
  RocketOutlined, CheckCircleOutlined, PauseCircleOutlined,
  ClockCircleOutlined, PlayCircleOutlined, BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { personalRoadmapService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  active: { color: 'processing', label: 'Đang học', icon: <PlayCircleOutlined /> },
  paused: { color: 'warning', label: 'Tạm dừng', icon: <PauseCircleOutlined /> },
  completed: { color: 'success', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  cancelled: { color: 'default', label: 'Đã hủy', icon: <ClockCircleOutlined /> },
};

export default function MyRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    personalRoadmapService.getMyRoadmaps({ status: activeTab })
      .then((res) => setRoadmaps(res.data || []))
      .catch(() => setRoadmaps([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabItems = [
    { key: 'active', label: '🟢 Đang học' },
    { key: 'completed', label: '✅ Hoàn thành' },
    { key: 'paused', label: '⏸️ Tạm dừng' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>📚 Lộ trình của tôi</Title>
        <Button type="primary" icon={<RocketOutlined />} onClick={() => navigate('/roadmaps')}>
          Khám phá thêm
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={(k) => { setActiveTab(k); setLoading(true); }} items={tabItems} />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : roadmaps.length === 0 ? (
        <Card style={{ borderRadius: 16 }}>
          <Empty description={`Chưa có lộ trình nào ${activeTab === 'active' ? 'đang học' : ''}`}>
            <Button type="primary" onClick={() => navigate('/roadmaps')}>Bắt đầu ngay</Button>
          </Empty>
        </Card>
      ) : (
        <List
          dataSource={roadmaps}
          renderItem={(item) => {
            const cfg = statusConfig[item.status] || statusConfig.active;
            return (
              <Card
                hoverable
                className="hover-lift"
                style={{ borderRadius: 16, marginBottom: 12 }}
                onClick={() => navigate(`/my-roadmaps/${item._id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={56} style={{ background: '#EEF2FF', color: '#4F46E5', flexShrink: 0 }} icon={<BookOutlined />} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Title level={5} style={{ margin: 0 }} ellipsis>{item.roadmapId?.title || 'Lộ trình'}</Title>
                      <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Đăng ký: {dayjs(item.enrolledAt).format('DD/MM/YYYY')} · {item.completedSteps}/{item.totalSteps} bước
                    </Text>
                    <Progress
                      percent={item.overallProgress}
                      size="small"
                      strokeColor={{ '0%': '#4F46E5', '100%': '#7C3AED' }}
                      style={{ marginTop: 8, marginBottom: 0 }}
                    />
                  </div>
                </div>
              </Card>
            );
          }}
        />
      )}
    </div>
  );
}
