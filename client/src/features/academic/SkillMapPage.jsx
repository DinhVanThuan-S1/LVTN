/**
 * Skill Map — Bản đồ kỹ năng (Student)
 * Hiển thị kỹ năng đã có, sắp sửa học, và recommendation
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Tag, Progress, Empty, Skeleton, Space, Divider, Tooltip } from 'antd';
import { BulbOutlined, TrophyOutlined, RocketOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { academicProfileService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const levelColors = {
  beginner: { bg: '#DBEAFE', color: '#2563EB', label: 'Cơ bản', percent: 25 },
  intermediate: { bg: '#FEF3C7', color: '#D97706', label: 'Trung cấp', percent: 50 },
  advanced: { bg: '#D1FAE5', color: '#059669', label: 'Nâng cao', percent: 75 },
  expert: { bg: '#EDE9FE', color: '#7C3AED', label: 'Chuyên gia', percent: 100 },
};

const categoryIcons = {
  'Frontend': '🎨',
  'Backend': '⚙️',
  'Database': '🗄️',
  'AI/ML': '🤖',
  'DevOps': '🚀',
  'Mobile': '📱',
  'Cơ sở dữ liệu': '🗄️',
};

export default function SkillMapPage() {
  const [skillMap, setSkillMap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academicProfileService.getSkillMap()
      .then((res) => setSkillMap(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;

  // Group skills by category
  const groupedSkills = {};
  (skillMap?.skills || []).forEach((s) => {
    const cat = s.category || 'Khác';
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(s);
  });

  const totalSkills = skillMap?.skills?.length || 0;
  const masteredSkills = (skillMap?.skills || []).filter((s) => s.level === 'advanced' || s.level === 'expert').length;

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 8 }}>🗺️ Bản đồ Kỹ năng</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Tổng quan các kỹ năng bạn đã tích lũy qua quá trình học tập
      </Paragraph>

      {/* Overview Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
            <BulbOutlined style={{ fontSize: 28, color: '#4F46E5', marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#4F46E5' }}>{totalSkills}</div>
            <Text type="secondary">Tổng kỹ năng</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
            <TrophyOutlined style={{ fontSize: 28, color: '#10B981', marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{masteredSkills}</div>
            <Text type="secondary">Thành thạo</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card style={{ borderRadius: 16, textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
            <FireOutlined style={{ fontSize: 28, color: '#F59E0B', marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F59E0B' }}>
              {Object.keys(groupedSkills).length}
            </div>
            <Text type="secondary">Nhóm kỹ năng</Text>
          </Card>
        </Col>
      </Row>

      {/* Skills by Category */}
      {totalSkills === 0 ? (
        <Card style={{ borderRadius: 16 }}>
          <Empty description="Chưa có dữ liệu kỹ năng. Hãy cập nhật hồ sơ học tập để bắt đầu!" />
        </Card>
      ) : (
        Object.entries(groupedSkills).map(([category, skills]) => (
          <Card key={category} style={{ borderRadius: 16, marginBottom: 16 }}
            title={<Space>
              <span style={{ fontSize: 20 }}>{categoryIcons[category] || '📚'}</span>
              <strong>{category}</strong>
              <Tag>{skills.length} kỹ năng</Tag>
            </Space>}>
            <Row gutter={[16, 12]}>
              {skills.map((skill, idx) => {
                const lvl = levelColors[skill.level] || levelColors.beginner;
                return (
                  <Col xs={24} sm={12} lg={8} key={idx}>
                    <Tooltip title={`${skill.name} — ${lvl.label}`}>
                      <div style={{
                        padding: '12px 16px', borderRadius: 12,
                        background: lvl.bg, border: `1px solid ${lvl.color}20`,
                        transition: 'transform 0.2s',
                        cursor: 'default',
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Text strong style={{ color: lvl.color }}>{skill.name}</Text>
                          <Tag color={lvl.color} style={{ margin: 0, fontSize: 10 }}>{lvl.label}</Tag>
                        </div>
                        <Progress
                          percent={lvl.percent}
                          size="small"
                          showInfo={false}
                          strokeColor={lvl.color}
                          trailColor={`${lvl.color}20`}
                        />
                      </div>
                    </Tooltip>
                  </Col>
                );
              })}
            </Row>
          </Card>
        ))
      )}
    </div>
  );
}
