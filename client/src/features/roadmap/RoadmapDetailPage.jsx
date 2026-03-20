/**
 * Roadmap Detail — Chi tiết lộ trình + Enroll
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Steps, Collapse, Space, Skeleton, Descriptions, Divider, message, Progress, Row, Col, List, Avatar, Result } from 'antd';
import { RocketOutlined, BookOutlined, ClockCircleOutlined, TeamOutlined, CheckCircleOutlined, PlayCircleOutlined, LockOutlined, TrophyOutlined } from '@ant-design/icons';
import { roadmapService, personalRoadmapService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const levelConfig = {
  beginner: { color: '#10B981', label: 'Cơ bản', emoji: '🟢' },
  intermediate: { color: '#F59E0B', label: 'Trung cấp', emoji: '🟡' },
  advanced: { color: '#EF4444', label: 'Nâng cao', emoji: '🔴' },
};

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    roadmapService.getPublicDetail(id)
      .then((res) => setRoadmap(res.data))
      .catch(() => message.error('Không tìm thấy lộ trình'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await personalRoadmapService.enroll(id);
      message.success('Đăng ký lộ trình thành công! 🎉');
      navigate('/my-roadmaps');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setEnrolling(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (!roadmap) return <Result status="404" title="Không tìm thấy lộ trình" subTitle="Lộ trình này không tồn tại hoặc đã bị ẩn." extra={<Button type="primary" onClick={() => navigate('/roadmaps')}>Quay lại</Button>} />;

  const lv = levelConfig[roadmap.level] || levelConfig.beginner;

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <Card style={{
        borderRadius: 20, marginBottom: 24, overflow: 'hidden',
        background: `linear-gradient(135deg, ${lv.color}10 0%, ${lv.color}25 100%)`,
        border: `1px solid ${lv.color}30`,
      }}>
        <Row gutter={24} align="middle">
          <Col xs={24} lg={16}>
            <Space>
              <Tag color={lv.color} style={{ fontSize: 13 }}>{lv.emoji} {lv.label}</Tag>
              {roadmap.isPublished && <Tag color="blue">Đã xuất bản</Tag>}
            </Space>
            <Title level={2} style={{ marginTop: 12, marginBottom: 8 }}>{roadmap.title}</Title>
            <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 16 }}>
              {roadmap.description}
            </Paragraph>
            <Space size="large">
              <span><BookOutlined /> <strong>{roadmap.totalSteps || 0}</strong> bước</span>
              <span><ClockCircleOutlined /> <strong>{roadmap.totalEstimatedHours || 0}</strong> giờ</span>
              <span><TeamOutlined /> <strong>{roadmap.enrollmentCount || 0}</strong> đăng ký</span>
            </Space>
          </Col>
          <Col xs={24} lg={8} style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <Button type="primary" size="large" icon={<RocketOutlined />} onClick={handleEnroll} loading={enrolling}
              style={{ height: 52, fontSize: 16, fontWeight: 600, borderRadius: 14, padding: '0 32px',
                background: `linear-gradient(135deg, ${lv.color}, ${lv.color}CC)`, border: 'none' }}>
              Đăng ký lộ trình
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* Phases & Steps */}
        <Col xs={24} lg={16}>
          <Card title={<><BookOutlined /> Nội dung lộ trình</>} style={{ borderRadius: 16 }}>
            {roadmap.phases?.length > 0 ? (
              <Collapse
                accordion
                defaultActiveKey={['0']}
                items={roadmap.phases.map((phase, pIdx) => ({
                  key: String(pIdx),
                  label: (
                    <Space>
                      <Avatar size="small" style={{ background: lv.color }}>{pIdx + 1}</Avatar>
                      <strong>{phase.title}</strong>
                      <Tag>{phase.steps?.length || 0} bước</Tag>
                    </Space>
                  ),
                  children: (
                    <Steps direction="vertical" size="small" current={-1}
                      items={phase.steps?.map((step, sIdx) => ({
                        title: step.title,
                        description: (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{step.description}</Text>
                            {step.estimatedHours && (
                              <Tag style={{ marginTop: 4 }}><ClockCircleOutlined /> {step.estimatedHours}h</Tag>
                            )}
                          </div>
                        ),
                        icon: <BookOutlined />,
                      })) || []}
                    />
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">Chưa có nội dung</Text>
            )}
          </Card>
        </Col>

        {/* Sidebar Info */}
        <Col xs={24} lg={8}>
          {/* Target Skills */}
          {roadmap.targetSkills?.length > 0 && (
            <Card title="🎯 Kỹ năng đạt được" style={{ borderRadius: 16, marginBottom: 16 }}>
              {roadmap.targetSkills.map((skill) => (
                <Tag key={skill._id} color="blue" style={{ marginBottom: 6, padding: '4px 12px' }}>
                  {skill.name}
                </Tag>
              ))}
            </Card>
          )}

          {/* Career Directions */}
          {roadmap.careerDirections?.length > 0 && (
            <Card title="🧭 Hướng nghề nghiệp" style={{ borderRadius: 16, marginBottom: 16 }}>
              <List size="small" dataSource={roadmap.careerDirections}
                renderItem={(cd) => (
                  <List.Item><Text>{cd.name}</Text></List.Item>
                )}
              />
            </Card>
          )}

          {/* Prerequisites */}
          {roadmap.prerequisites && (
            <Card title="📋 Yêu cầu" style={{ borderRadius: 16 }}>
              <Paragraph>{roadmap.prerequisites}</Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
