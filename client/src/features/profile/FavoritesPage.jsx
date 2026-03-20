/**
 * Favorites Page — Mục yêu thích
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Tabs, List, Avatar, Tag, Empty, Skeleton, Button, Space, message, Popconfirm } from 'antd';
import { HeartFilled, BankOutlined, RocketOutlined, DeleteOutlined } from '@ant-design/icons';
import { jobService } from '../../services';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('job');
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await jobService.getFavorites({ targetType: tab });
      setFavorites(res.data || []);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, [tab]);

  const handleRemove = async (targetId) => {
    try {
      await jobService.toggleFavorite(tab, targetId);
      message.success('Đã xóa khỏi yêu thích');
      fetchFavorites();
    } catch {}
  };

  const tabItems = [
    { key: 'job', label: '💼 Việc làm' },
    { key: 'roadmap', label: '🚀 Lộ trình' },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>
        <HeartFilled style={{ color: '#EF4444' }} /> Yêu thích
      </Title>

      <Tabs activeKey={tab} onChange={(k) => setTab(k)} items={tabItems} />

      {loading ? <Skeleton active /> : favorites.length === 0 ? (
        <Card style={{ borderRadius: 16 }}>
          <Empty description={`Chưa có ${tab === 'job' ? 'việc làm' : 'lộ trình'} yêu thích`} />
        </Card>
      ) : (
        <List
          dataSource={favorites}
          renderItem={(fav) => {
            const item = fav.targetId; // populated target
            return (
              <Card hoverable className="hover-lift" style={{ borderRadius: 16, marginBottom: 12 }}
                onClick={() => navigate(tab === 'job' ? `/jobs/${item?._id}` : `/roadmaps/${item?._id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Avatar icon={tab === 'job' ? <BankOutlined /> : <RocketOutlined />}
                      style={{ background: tab === 'job' ? '#EEF2FF' : '#F0FDF4', color: tab === 'job' ? '#4F46E5' : '#10B981' }} />
                    <div>
                      <Text strong>{item?.title || item?.companyName || 'Item'}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {tab === 'job' ? item?.companyId?.companyName : item?.level}
                      </Text>
                    </div>
                  </Space>
                  <Popconfirm title="Bỏ yêu thích?" onConfirm={(e) => { e.stopPropagation(); handleRemove(item?._id); }}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                </div>
              </Card>
            );
          }}
        />
      )}
    </div>
  );
}
