/**
 * Roadmap Explorer — Danh sách lộ trình công khai
 */
import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Input, Select, Space, Skeleton, Empty, Button, Progress, Avatar, Badge } from 'antd';
import { RocketOutlined, ClockCircleOutlined, TeamOutlined, SearchOutlined, BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const levelColors = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };
const levelLabels = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

export default function RoadmapExplorer() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (level) params.level = level;
      const res = await roadmapService.getPublicList(params);
      setRoadmaps(res.data || []);
    } catch { setRoadmaps([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoadmaps(); }, [level]);

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 8 }}>🚀 Khám phá Lộ trình học tập</Title>
        <Text type="secondary">Chọn lộ trình phù hợp để phát triển kỹ năng CNTT</Text>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Space wrap size="middle">
          <Input.Search
            placeholder="Tìm kiếm lộ trình..."
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchRoadmaps}
            enterButton
            allowClear
          />
          <Select
            placeholder="Cấp độ"
            style={{ width: 160 }}
            value={level || undefined}
            onChange={(v) => setLevel(v || '')}
            allowClear
            options={[
              { value: 'beginner', label: '🟢 Cơ bản' },
              { value: 'intermediate', label: '🟡 Trung cấp' },
              { value: 'advanced', label: '🔴 Nâng cao' },
            ]}
          />
        </Space>
      </Card>

      {/* Roadmap Grid */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1,2,3,4,5,6].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : roadmaps.length === 0 ? (
        <Empty description="Chưa có lộ trình nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {roadmaps.map((roadmap) => (
            <Col xs={24} sm={12} lg={8} key={roadmap._id}>
              <Card
                hoverable
                className="hover-lift"
                style={{ borderRadius: 16, height: '100%', overflow: 'hidden' }}
                onClick={() => navigate(`/roadmaps/${roadmap._id}`)}
                cover={
                  <div style={{
                    height: 140,
                    background: `linear-gradient(135deg, ${levelColors[roadmap.level]}20, ${levelColors[roadmap.level]}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RocketOutlined style={{ fontSize: 48, color: levelColors[roadmap.level] }} />
                  </div>
                }
              >
                <Tag color={levelColors[roadmap.level]} style={{ marginBottom: 8 }}>
                  {levelLabels[roadmap.level]}
                </Tag>
                <Title level={5} style={{ marginBottom: 8, minHeight: 44 }} ellipsis={{ rows: 2 }}>
                  {roadmap.title}
                </Title>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 13, marginBottom: 12 }}>
                  {roadmap.description}
                </Paragraph>

                <Space split="·" style={{ fontSize: 12, color: '#94A3B8' }}>
                  <span><BookOutlined /> {roadmap.totalSteps || 0} bước</span>
                  <span><ClockCircleOutlined /> {roadmap.totalEstimatedHours || 0}h</span>
                  <span><TeamOutlined /> {roadmap.enrollmentCount || 0}</span>
                </Space>

                {roadmap.targetSkills?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {roadmap.targetSkills.slice(0, 3).map((skill) => (
                      <Tag key={skill._id} style={{ marginBottom: 4, fontSize: 11 }}>{skill.name}</Tag>
                    ))}
                    {roadmap.targetSkills.length > 3 && <Tag>+{roadmap.targetSkills.length - 3}</Tag>}
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
