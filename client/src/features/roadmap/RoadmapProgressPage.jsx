/**
 * Roadmap Progress Tracker — Theo dõi tiến trình lộ trình (Student)
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Steps, Space, Skeleton, Progress, Row, Col, Divider, message, Modal, Form, Input, Result, Collapse, Badge, Tooltip } from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined,
  LockOutlined, RocketOutlined, ArrowLeftOutlined, BookOutlined,
  PauseCircleOutlined, TrophyOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { personalRoadmapService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const stepStatusConfig = {
  not_started: { icon: <LockOutlined />, color: '#94A3B8', label: 'Chưa bắt đầu' },
  in_progress: { icon: <PlayCircleOutlined />, color: '#4F46E5', label: 'Đang học' },
  completed: { icon: <CheckCircleOutlined />, color: '#10B981', label: 'Hoàn thành' },
  skipped: { icon: <ExclamationCircleOutlined />, color: '#F59E0B', label: 'Bỏ qua' },
};

const roadmapStatusConfig = {
  active: { color: 'processing', label: 'Đang học', icon: <PlayCircleOutlined /> },
  paused: { color: 'warning', label: 'Tạm dừng', icon: <PauseCircleOutlined /> },
  completed: { color: 'success', label: 'Hoàn thành', icon: <TrophyOutlined /> },
};

export default function RoadmapProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteModal, setNoteModal] = useState({ open: false, phaseIdx: null, stepIdx: null });
  const [noteForm] = Form.useForm();

  const fetchRoadmap = async () => {
    try {
      const res = await personalRoadmapService.getById(id);
      setRoadmap(res.data);
    } catch {
      message.error('Không tải được lộ trình');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoadmap(); }, [id]);

  // Bắt đầu bước
  const handleStartStep = async (phaseId, stepId) => {
    setActionLoading(true);
    try {
      await personalRoadmapService.startStep(id, phaseId, stepId);
      message.success('Đã bắt đầu bước mới!');
      fetchRoadmap();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setActionLoading(false); }
  };

  // Hoàn thành bước
  const handleCompleteStep = async () => {
    setActionLoading(true);
    const { phaseIdx, stepIdx } = noteModal;
    const phase = roadmap?.phases?.[phaseIdx];
    const step = phase?.steps?.[stepIdx];
    try {
      const values = await noteForm.validateFields();
      await personalRoadmapService.completeStep(id, phase._id, step._id, {
        note: values.note,
        rating: values.rating,
      });
      message.success('Hoàn thành bước! 🎉');
      setNoteModal({ open: false, phaseIdx: null, stepIdx: null });
      noteForm.resetFields();
      fetchRoadmap();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setActionLoading(false); }
  };

  // Tạm dừng / Tiếp tục
  const handleTogglePause = async () => {
    setActionLoading(true);
    try {
      const newStatus = roadmap.status === 'paused' ? 'active' : 'paused';
      await personalRoadmapService.updateStatus(id, newStatus);
      message.success(newStatus === 'paused' ? 'Đã tạm dừng lộ trình' : 'Tiếp tục lộ trình!');
      fetchRoadmap();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setActionLoading(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (!roadmap) return <Result status="404" title="Không tìm thấy" extra={<Button onClick={() => navigate('/my-roadmaps')}>Quay lại</Button>} />;

  const statusCfg = roadmapStatusConfig[roadmap.status] || roadmapStatusConfig.active;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/my-roadmaps')} style={{ marginBottom: 12 }}>
          Quay lại
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              {roadmap.roadmapId?.title || 'Lộ trình'}
            </Title>
            <Space>
              <Tag color={statusCfg.color} icon={statusCfg.icon}>{statusCfg.label}</Tag>
              <Text type="secondary">Đăng ký: {dayjs(roadmap.enrolledAt).format('DD/MM/YYYY')}</Text>
            </Space>
          </div>
          {roadmap.status !== 'completed' && (
            <Button onClick={handleTogglePause} loading={actionLoading}
              icon={roadmap.status === 'paused' ? <PlayCircleOutlined /> : <PauseCircleOutlined />}>
              {roadmap.status === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <Card style={{ borderRadius: 16, marginBottom: 24, background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Progress
              type="dashboard"
              percent={roadmap.overallProgress || 0}
              strokeColor={{ '0%': '#4F46E5', '100%': '#7C3AED' }}
              size={140}
              format={(p) => <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#4F46E5' }}>{p}%</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Hoàn thành</div>
              </div>}
            />
          </Col>
          <Col xs={24} sm={16}>
            <Row gutter={16}>
              <Col span={8}>
                <div className="dashboard-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#4F46E5' }}>{roadmap.completedSteps || 0}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đã hoàn thành</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="dashboard-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>
                    {(roadmap.totalSteps || 0) - (roadmap.completedSteps || 0)}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Còn lại</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="dashboard-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>{roadmap.totalSteps || 0}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng bước</Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Phases */}
      {roadmap.phases?.map((phase, pIdx) => {
        const phaseCompleted = phase.steps?.every((s) => s.status === 'completed');
        const phaseProgress = phase.steps?.length
          ? Math.round((phase.steps.filter((s) => s.status === 'completed').length / phase.steps.length) * 100)
          : 0;

        return (
          <Card key={phase._id || pIdx} style={{
            borderRadius: 16, marginBottom: 16,
            borderLeft: phaseCompleted ? '4px solid #10B981' : '4px solid #4F46E5',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <Badge count={pIdx + 1} style={{ background: phaseCompleted ? '#10B981' : '#4F46E5' }} />
                <Title level={5} style={{ margin: 0 }}>{phase.title || `Giai đoạn ${pIdx + 1}`}</Title>
                {phaseCompleted && <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>}
              </Space>
              <Progress percent={phaseProgress} size="small" style={{ width: 120 }}
                strokeColor={phaseCompleted ? '#10B981' : '#4F46E5'} />
            </div>

            <Steps direction="vertical" size="small" current={-1}
              items={phase.steps?.map((step, sIdx) => {
                const cfg = stepStatusConfig[step.status] || stepStatusConfig.not_started;
                return {
                  title: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Space>
                        <Text strong={step.status === 'in_progress'}>{step.title || `Bước ${sIdx + 1}`}</Text>
                        <Tag color={cfg.color === '#10B981' ? 'success' : cfg.color === '#4F46E5' ? 'processing' : 'default'}>
                          {cfg.label}
                        </Tag>
                      </Space>
                      <Space>
                        {step.estimatedHours && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <ClockCircleOutlined /> {step.estimatedHours}h
                          </Text>
                        )}
                        {step.status === 'not_started' && roadmap.status === 'active' && (
                          <Button size="small" type="primary" icon={<PlayCircleOutlined />}
                            onClick={() => handleStartStep(phase._id, step._id)}
                            loading={actionLoading}>
                            Bắt đầu
                          </Button>
                        )}
                        {step.status === 'in_progress' && (
                          <Button size="small" type="primary" style={{ background: '#10B981', border: 'none' }}
                            icon={<CheckCircleOutlined />}
                            onClick={() => setNoteModal({ open: true, phaseIdx: pIdx, stepIdx: sIdx })}>
                            Hoàn thành
                          </Button>
                        )}
                      </Space>
                    </div>
                  ),
                  description: step.description ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>{step.description}</Text>
                  ) : null,
                  icon: cfg.icon,
                  status: step.status === 'completed' ? 'finish' : step.status === 'in_progress' ? 'process' : 'wait',
                };
              }) || []}
            />
          </Card>
        );
      })}

      {/* Complete Note Modal */}
      <Modal
        title="✅ Hoàn thành bước"
        open={noteModal.open}
        onOk={handleCompleteStep}
        onCancel={() => { setNoteModal({ open: false, phaseIdx: null, stepIdx: null }); noteForm.resetFields(); }}
        confirmLoading={actionLoading}
        okText="Xác nhận hoàn thành"
        cancelText="Hủy"
      >
        <Form form={noteForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="note" label="Ghi chú (tùy chọn)">
            <Input.TextArea rows={3} placeholder="Bạn đã học được gì ở bước này?" />
          </Form.Item>
          <Form.Item name="rating" label="Đánh giá độ khó (1-5)">
            <Input type="number" min={1} max={5} placeholder="1-5" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
