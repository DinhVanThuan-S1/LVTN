/**
 * Career Preference — Cài đặt sở thích nghề nghiệp (Student)
 * Phục vụ Recommendation Engine
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Form, Select, Slider, Button, Row, Col, Tag, Space, message, Skeleton, Divider, Rate } from 'antd';
import { AimOutlined, BulbOutlined, SaveOutlined, RocketOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { careerPreferenceService, publicService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const workStyles = [
  { value: 'remote', label: '🏠 Remote' },
  { value: 'onsite', label: '🏢 Onsite' },
  { value: 'hybrid', label: '🔄 Hybrid' },
];

const companySizes = [
  { value: 'startup', label: '🚀 Startup (< 50)' },
  { value: 'small', label: '📦 Nhỏ (50-200)' },
  { value: 'medium', label: '🏗️ Vừa (200-1000)' },
  { value: 'large', label: '🏛️ Lớn (> 1000)' },
];

export default function CareerPreferencePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillOptions, setSkillOptions] = useState([]);
  const [careerOptions, setCareerOptions] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    // Load options
    Promise.all([
      publicService.getSkills({ limit: 200 }),
      publicService.getCareerDirections({ limit: 100 }),
    ]).then(([skillRes, careerRes]) => {
      setSkillOptions((skillRes.data || []).map((s) => ({ value: s._id, label: s.name })));
      setCareerOptions((careerRes.data || []).map((c) => ({ value: c._id, label: c.name })));
    }).catch(() => {});

    // Load current preferences
    careerPreferenceService.get()
      .then((res) => {
        if (res.data) {
          form.setFieldsValue({
            ...res.data,
            preferredSkills: res.data.preferredSkills?.map((s) => s._id || s),
            careerDirections: res.data.careerDirections?.map((c) => c._id || c),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await careerPreferenceService.update(values);
      message.success('Cập nhật sở thích nghề nghiệp thành công! 🎯');
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setSaving(false); }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 8 }}>🎯 Sở thích nghề nghiệp</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Cho chúng tôi biết bạn muốn gì — hệ thống sẽ gợi ý lộ trình và việc làm phù hợp nhất!
      </Paragraph>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          {/* Cột trái — Hướng nghề & Kỹ năng */}
          <Col xs={24} lg={12}>
            <Card title={<><AimOutlined /> Hướng nghề nghiệp</>} style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="careerDirections" label="Hướng nghề bạn quan tâm"
                extra="Chọn 1-3 hướng nghề bạn muốn theo đuổi">
                <Select mode="multiple" options={careerOptions} placeholder="VD: Full-Stack Developer, Data Scientist"
                  showSearch maxCount={5}
                  filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Card>

            <Card title={<><BulbOutlined /> Kỹ năng muốn phát triển</>} style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="preferredSkills" label="Kỹ năng bạn muốn học / nâng cao"
                extra="Chọn 3-10 kỹ năng ưu tiên">
                <Select mode="multiple" options={skillOptions} placeholder="VD: React, Node.js, Python"
                  showSearch maxCount={10}
                  filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Card>
          </Col>

          {/* Cột phải — Môi trường & Lương */}
          <Col xs={24} lg={12}>
            <Card title={<><EnvironmentOutlined /> Môi trường làm việc</>} style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="preferredWorkStyle" label="Hình thức làm việc">
                <Select mode="multiple" options={workStyles} placeholder="Chọn hình thức" />
              </Form.Item>

              <Form.Item name="preferredCompanySize" label="Quy mô công ty">
                <Select mode="multiple" options={companySizes} placeholder="Chọn quy mô" />
              </Form.Item>

              <Form.Item name="preferredLocations" label="Địa điểm ưa thích">
                <Select mode="tags" placeholder="Nhập thành phố: HCM, Hà Nội, Đà Nẵng..." />
              </Form.Item>
            </Card>

            <Card title={<><DollarOutlined /> Mức lương kỳ vọng</>} style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="expectedSalaryRange" label="Khoảng lương mong muốn (triệu VND/tháng)">
                <Slider range min={0} max={100} step={5}
                  marks={{ 0: '0', 10: '10tr', 20: '20tr', 50: '50tr', 100: '100tr+' }}
                  tooltip={{ formatter: (v) => `${v} triệu` }} />
              </Form.Item>
            </Card>

            <Card title={<><RocketOutlined /> Mục tiêu</>} style={{ borderRadius: 16, marginBottom: 16 }}>
              <Form.Item name="jobReadiness" label="Mức độ sẵn sàng đi làm">
                <Rate count={5} tooltips={['Chưa sẵn sàng', 'Còn lâu', 'Đang tìm hiểu', 'Gần sẵn sàng', 'Sẵn sàng ngay']} />
              </Form.Item>
              <Form.Item name="preferredJobType" label="Loại công việc">
                <Select mode="multiple" options={[
                  { value: 'full_time', label: 'Toàn thời gian' },
                  { value: 'part_time', label: 'Bán thời gian' },
                  { value: 'internship', label: 'Thực tập' },
                  { value: 'freelance', label: 'Freelance' },
                ]} placeholder="Chọn loại" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}
            style={{
              height: 48, borderRadius: 12, fontSize: 16, fontWeight: 600, padding: '0 40px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
            }}>
            Lưu sở thích
          </Button>
        </div>
      </Form>
    </div>
  );
}
