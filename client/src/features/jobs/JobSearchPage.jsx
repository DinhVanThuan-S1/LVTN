/**
 * Job Search Page — Tìm việc làm
 */
import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Input, Select, Space, Skeleton, Empty, Button, Divider, List, Avatar } from 'antd';
import {
  SearchOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined,
  HeartOutlined, HeartFilled, EyeOutlined, TeamOutlined, FilterOutlined,
  BankOutlined, RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const jobTypeLabels = {
  full_time: 'Toàn thời gian', part_time: 'Bán thời gian',
  internship: 'Thực tập', freelance: 'Freelance', remote: 'Remote',
};
const expLabels = {
  intern: 'Thực tập sinh', fresher: 'Fresher', junior: 'Junior',
  middle: 'Middle', senior: 'Senior', lead: 'Lead',
};
const jobTypeColors = {
  full_time: 'blue', part_time: 'cyan', internship: 'green',
  freelance: 'purple', remote: 'orange',
};

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  if (salary.isNegotiable) return 'Thỏa thuận';
  const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(0)}tr` : `${(n / 1000).toFixed(0)}k`;
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  if (salary.min) return `Từ ${fmt(salary.min)}`;
  return 'Thỏa thuận';
};

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (jobType) params.jobType = jobType;
      if (expLevel) params.experienceLevel = expLevel;
      const res = await jobService.search(params);
      setJobs(res.data || []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [jobType, expLevel]);

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 8 }}>🔍 Tìm việc làm</Title>
        <Text type="secondary">Khám phá cơ hội nghề nghiệp phù hợp với kỹ năng của bạn</Text>
      </div>

      {/* Search Bar */}
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="Tìm kiếm theo tiêu đề, kỹ năng, công ty..."
              size="large"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={fetchJobs}
              enterButton={<><SearchOutlined /> Tìm kiếm</>}
              style={{ borderRadius: 12 }}
            />
          </Col>
        </Row>
        <Space wrap style={{ marginTop: 12 }}>
          <Select
            placeholder="Loại công việc"
            style={{ width: 160 }}
            value={jobType || undefined}
            onChange={(v) => setJobType(v || '')}
            allowClear
            options={Object.entries(jobTypeLabels).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Select
            placeholder="Kinh nghiệm"
            style={{ width: 140 }}
            value={expLevel || undefined}
            onChange={(v) => setExpLevel(v || '')}
            allowClear
            options={Object.entries(expLabels).map(([k, v]) => ({ value: k, label: v }))}
          />
        </Space>
      </Card>

      {/* Job List */}
      {loading ? (
        <Card style={{ borderRadius: 16 }}><Skeleton active paragraph={{ rows: 8 }} /></Card>
      ) : jobs.length === 0 ? (
        <Card style={{ borderRadius: 16 }}><Empty description="Không tìm thấy việc làm phù hợp" /></Card>
      ) : (
        <div>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Tìm thấy {jobs.length} việc làm
          </Text>
          <List
            dataSource={jobs}
            renderItem={(job) => (
              <Card
                hoverable
                className="hover-lift"
                style={{ borderRadius: 16, marginBottom: 12, cursor: 'pointer' }}
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <Row align="middle" gutter={16}>
                  <Col>
                    <Avatar
                      size={56}
                      src={job.companyId?.logo}
                      icon={<BankOutlined />}
                      style={{ background: '#EEF2FF', color: '#4F46E5' }}
                    />
                  </Col>
                  <Col flex="auto">
                    <Title level={5} style={{ marginBottom: 4 }}>{job.title}</Title>
                    <Text type="secondary">{job.companyId?.companyName || 'Công ty ẩn danh'}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={4}>
                        <Tag color={jobTypeColors[job.jobType]}>{jobTypeLabels[job.jobType]}</Tag>
                        <Tag>{expLabels[job.experienceLevel]}</Tag>
                        {job.location?.city && (
                          <Tag icon={<EnvironmentOutlined />}>{job.location.city}</Tag>
                        )}
                        {job.location?.isRemote && <Tag color="orange">Remote</Tag>}
                      </Space>
                    </div>
                  </Col>
                  <Col style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#4F46E5', marginBottom: 4 }}>
                      <DollarOutlined /> {formatSalary(job.salary)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(job.publishedAt).fromNow?.() || dayjs(job.publishedAt).format('DD/MM/YYYY')}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Space size={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><EyeOutlined /> {job.viewCount}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}><TeamOutlined /> {job.applicationCount}</Text>
                      </Space>
                    </div>
                  </Col>
                </Row>

                {job.requiredSkills?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {job.requiredSkills.slice(0, 5).map((rs, i) => (
                      <Tag key={i} style={{ fontSize: 11, marginBottom: 4 }}>
                        {rs.skillId?.name || 'Skill'}
                      </Tag>
                    ))}
                  </div>
                )}
              </Card>
            )}
          />
        </div>
      )}
    </div>
  );
}
