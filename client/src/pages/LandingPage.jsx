/**
 * Landing Page — Trang chủ cho khách vãng lai
 * Giới thiệu EduPath, CTA đăng ký/đăng nhập
 */
import { Typography, Button, Row, Col, Card, Space, Tag } from 'antd';
import {
  RocketOutlined, BookOutlined, BulbOutlined, TeamOutlined,
  ArrowRightOutlined, CheckCircleOutlined, AimOutlined,
  BankOutlined, StarOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: '#4F46E5' }} />,
    title: 'Lộ trình cá nhân hóa',
    desc: 'Hệ thống AI phân tích năng lực và đề xuất lộ trình học tập phù hợp với từng sinh viên.',
  },
  {
    icon: <BulbOutlined style={{ fontSize: 32, color: '#7C3AED' }} />,
    title: 'Bản đồ kỹ năng',
    desc: 'Trực quan hóa kỹ năng đã có, đang học và cần phát triển qua biểu đồ thông minh.',
  },
  {
    icon: <AimOutlined style={{ fontSize: 32, color: '#10B981' }} />,
    title: 'Gợi ý nghề nghiệp',
    desc: 'Kết nối sinh viên với cơ hội việc làm phù hợp dựa trên kỹ năng và sở thích.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: '#F59E0B' }} />,
    title: 'Kết nối nhà tuyển dụng',
    desc: 'Nhà tuyển dụng tìm kiếm ứng viên tiềm năng, hẹn phỏng vấn, quản lý tuyển dụng.',
  },
];

const stats = [
  { number: '1000+', label: 'Sinh viên IT' },
  { number: '50+', label: 'Lộ trình học tập' },
  { number: '200+', label: 'Kỹ năng CNTT' },
  { number: '100+', label: 'Nhà tuyển dụng' },
];

const roles = [
  {
    icon: <BookOutlined style={{ fontSize: 28 }} />,
    title: 'Sinh viên CNTT',
    color: '#4F46E5',
    items: ['Lộ trình học tập cá nhân hóa', 'Theo dõi tiến trình & GPA', 'Tìm việc làm phù hợp', 'Quản lý CV chuyên nghiệp'],
  },
  {
    icon: <BankOutlined style={{ fontSize: 28 }} />,
    title: 'Nhà tuyển dụng',
    color: '#10B981',
    items: ['Đăng tin tuyển dụng', 'Tìm ứng viên tiềm năng', 'Match % kỹ năng tự động', 'Quản lý phỏng vấn'],
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 28 }} />,
    title: 'Quản trị viên',
    color: '#F59E0B',
    items: ['Quản lý hệ thống toàn diện', 'Duyệt tin tuyển dụng', 'Thống kê & phân tích', 'Quản lý lộ trình mẫu'],
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* ===== HEADER NAV ===== */}
      <div style={{
        padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <Text style={{ fontSize: 22, fontWeight: 800, color: '#4F46E5' }}>📚 EduPath</Text>
        <Space size={12}>
          <Button size="large" onClick={() => navigate('/login')} style={{ borderRadius: 10 }}>
            Đăng nhập
          </Button>
          <Button type="primary" size="large" onClick={() => navigate('/register')}
            style={{ borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none' }}>
            Đăng ký miễn phí
          </Button>
        </Space>
      </div>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        padding: '80px 48px', textAlign: 'center',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 30%, #C7D2FE 60%, #DDD6FE 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.06)' }} />

        <Tag color="purple" style={{ fontSize: 14, padding: '4px 16px', borderRadius: 20, marginBottom: 24 }}>
          🎓 Nền tảng hướng dẫn nghề nghiệp #1 cho sinh viên IT
        </Tag>

        <Title style={{ fontSize: 48, fontWeight: 800, color: '#1E1B4B', marginBottom: 16, maxWidth: 800, margin: '0 auto 16px' }}>
          Xây dựng lộ trình{' '}
          <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            học tập & nghề nghiệp
          </span>{' '}
          cá nhân hóa
        </Title>

        <Paragraph style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto 32px' }}>
          EduPath sử dụng AI để phân tích năng lực, đề xuất lộ trình học tập tối ưu
          và kết nối sinh viên với cơ hội việc làm phù hợp nhất.
        </Paragraph>

        <Space size={16}>
          <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => navigate('/register')}
            style={{
              height: 52, fontSize: 16, fontWeight: 600, borderRadius: 14, padding: '0 32px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
              boxShadow: '0 8px 25px rgba(79,70,229,0.35)',
            }}>
            Bắt đầu ngay — Miễn phí
          </Button>
          <Button size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}
            style={{ height: 52, fontSize: 16, borderRadius: 14, padding: '0 32px' }}>
            Đăng nhập
          </Button>
        </Space>
      </div>

      {/* ===== STATS ===== */}
      <div style={{ padding: '40px 48px', background: '#1E1B4B' }}>
        <Row gutter={24} justify="center">
          {stats.map((s, i) => (
            <Col xs={12} sm={6} key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#A5B4FC' }}>{s.number}</div>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>{s.label}</Text>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== FEATURES ===== */}
      <div style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag color="blue" style={{ marginBottom: 12 }}>Tính năng nổi bật</Tag>
          <Title level={2} style={{ marginBottom: 8 }}>Tất cả những gì bạn cần</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>Một nền tảng — đầy đủ công cụ cho hành trình học tập và nghề nghiệp</Text>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((f, i) => (
            <Col xs={24} sm={12} key={i}>
              <Card hoverable style={{
                borderRadius: 16, height: '100%', border: '1px solid #E5E7EB',
                transition: 'all 0.3s ease',
              }}
                styles={{ body: { padding: 28 } }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>{f.title}</Title>
                <Text type="secondary">{f.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== ROLES ===== */}
      <div style={{ padding: '80px 48px', background: '#F8FAFC', maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag color="green" style={{ marginBottom: 12 }}>Dành cho mọi người</Tag>
          <Title level={2} style={{ marginBottom: 8 }}>3 vai trò — 1 nền tảng</Title>
        </div>
        <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {roles.map((r, i) => (
            <Col xs={24} sm={8} key={i}>
              <Card style={{ borderRadius: 16, height: '100%', borderTop: `4px solid ${r.color}` }}
                styles={{ body: { padding: 28 } }}>
                <div style={{ color: r.color, marginBottom: 12 }}>{r.icon}</div>
                <Title level={4} style={{ marginBottom: 16 }}>{r.title}</Title>
                {r.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: r.color, fontSize: 14 }} />
                    <Text style={{ fontSize: 14 }}>{item}</Text>
                  </div>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== CTA ===== */}
      <div style={{
        padding: '80px 48px', textAlign: 'center',
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      }}>
        <Title level={2} style={{ color: '#fff', marginBottom: 12 }}>Sẵn sàng bắt đầu?</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32 }}>
          Tạo tài khoản miễn phí và khám phá lộ trình phù hợp với bạn
        </Paragraph>
        <Space size={16}>
          <Button size="large" onClick={() => navigate('/register')}
            style={{
              height: 52, fontSize: 16, fontWeight: 600, borderRadius: 14, padding: '0 32px',
              background: '#fff', color: '#4F46E5', border: 'none',
            }}>
            🎓 Đăng ký Sinh viên
          </Button>
          <Button size="large" ghost onClick={() => navigate('/register')}
            style={{ height: 52, fontSize: 16, borderRadius: 14, padding: '0 32px', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
            🏢 Đăng ký NTD
          </Button>
        </Space>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ padding: '32px 48px', background: '#1E1B4B', textAlign: 'center' }}>
        <Text style={{ color: '#94A3B8' }}>© 2026 EduPath — Hệ thống hỗ trợ lộ trình học tập và nghề nghiệp cho sinh viên CNTT</Text>
      </div>
    </div>
  );
}
