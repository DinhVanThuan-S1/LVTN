/**
 * Notification Page — Danh sách thông báo
 */
import { useEffect, useState } from 'react';
import { Card, Typography, List, Button, Tag, Space, Empty, Skeleton, Badge } from 'antd';
import { BellOutlined, CheckOutlined, CheckCircleOutlined, FileTextOutlined, RocketOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { notificationService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const typeIcons = {
  application_received: <FileTextOutlined style={{ color: '#4F46E5' }} />,
  application_status_changed: <FileTextOutlined style={{ color: '#F59E0B' }} />,
  interview_scheduled: <SafetyCertificateOutlined style={{ color: '#8B5CF6' }} />,
  job_approved: <CheckCircleOutlined style={{ color: '#10B981' }} />,
  job_rejected: <FileTextOutlined style={{ color: '#EF4444' }} />,
  roadmap_completed: <RocketOutlined style={{ color: '#10B981' }} />,
  test_result: <SafetyCertificateOutlined style={{ color: '#3B82F6' }} />,
  system: <BellOutlined style={{ color: '#64748B' }} />,
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 50 });
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          🔔 Thông báo {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
        </Title>
        {unreadCount > 0 && (
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</Button>
        )}
      </div>

      <Card style={{ borderRadius: 16 }}>
        {loading ? <Skeleton active /> : notifications.length === 0 ? (
          <Empty description="Chưa có thông báo" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notif) => (
              <List.Item
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                style={{
                  cursor: 'pointer', padding: '16px',
                  background: notif.isRead ? 'transparent' : '#EEF2FF',
                  borderRadius: 8, marginBottom: 4,
                  transition: 'background 0.2s',
                }}
              >
                <List.Item.Meta
                  avatar={<div style={{ fontSize: 20, width: 40, textAlign: 'center' }}>{typeIcons[notif.type] || typeIcons.system}</div>}
                  title={<Space>
                    <Text strong={!notif.isRead}>{notif.title}</Text>
                    {!notif.isRead && <Badge status="processing" />}
                  </Space>}
                  description={<>
                    <Text type="secondary">{notif.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(notif.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
