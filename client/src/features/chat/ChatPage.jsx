/**
 * Chat Page — Tin nhắn realtime
 */
import { useEffect, useState, useRef } from 'react';
import { Card, Typography, Input, Button, List, Avatar, Space, Empty, Badge, Spin, Divider } from 'antd';
import { SendOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { chatService } from '../../services';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    chatService.getConversations()
      .then((res) => setConversations(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  // Fetch messages khi chọn conversation
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    chatService.getMessages(activeConv._id, { limit: 50 })
      .then((res) => {
        setMessages(res.data || []);
        // Mark as read
        chatService.markAsRead(activeConv._id).catch(() => {});
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [activeConv]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!msgInput.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await chatService.sendMessage(activeConv._id, { content: msgInput });
      setMessages((prev) => [...prev, res.data]);
      setMsgInput('');
      // Update last message
      setConversations((prev) => prev.map((c) =>
        c._id === activeConv._id ? { ...c, lastMessage: { content: msgInput, sentAt: new Date() } } : c
      ));
    } catch {} finally { setSending(false); }
  };

  const getOtherUser = (conv) => {
    const other = conv.participants?.find((p) => p.userId?._id !== user?._id);
    return other?.userId || {};
  };

  return (
    <div className="animate-fade-in-up" style={{ height: 'calc(100vh - 160px)' }}>
      <Title level={3} style={{ marginBottom: 16 }}>💬 Tin nhắn</Title>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        {/* Conversation List */}
        <Card style={{ width: 320, borderRadius: 16, overflow: 'auto', flexShrink: 0 }} bodyStyle={{ padding: 0 }}>
          {loadingConvs ? <Spin style={{ padding: 48 }} /> : conversations.length === 0 ? (
            <Empty description="Chưa có cuộc hội thoại" style={{ padding: 48 }} />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conv) => {
                const other = getOtherUser(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <List.Item
                    onClick={() => setActiveConv(conv)}
                    style={{
                      cursor: 'pointer', padding: '12px 16px',
                      background: isActive ? '#EEF2FF' : 'transparent',
                      borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={conv.unreadCount > 0}>
                          <Avatar icon={<UserOutlined />} src={other.profile?.avatar}
                            style={{ background: '#4F46E5' }} />
                        </Badge>
                      }
                      title={<Text strong={conv.unreadCount > 0}>{other.profile?.fullName || 'User'}</Text>}
                      description={
                        <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 180 }}>
                          {conv.lastMessage?.content || 'Bắt đầu trò chuyện'}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* Chat Area */}
        <Card style={{ flex: 1, borderRadius: 16, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description="Chọn cuộc hội thoại để bắt đầu" image={<MessageOutlined style={{ fontSize: 64, color: '#D1D5DB' }} />} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} src={getOtherUser(activeConv).profile?.avatar}
                    style={{ background: '#4F46E5' }} />
                  <div>
                    <Text strong>{getOtherUser(activeConv).profile?.fullName || 'User'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{getOtherUser(activeConv).role}</Text>
                  </div>
                </Space>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                {loadingMsgs ? <Spin /> : messages.map((msg, i) => {
                  const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  return (
                    <div key={msg._id || i} style={{
                      display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: 8,
                    }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 16px', borderRadius: 16,
                        background: isMine ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F1F5F9',
                        color: isMine ? '#fff' : '#1E293B',
                        borderBottomRightRadius: isMine ? 4 : 16,
                        borderBottomLeftRadius: isMine ? 16 : 4,
                      }}>
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</div>
                        <div style={{
                          fontSize: 10, textAlign: 'right', marginTop: 4,
                          opacity: 0.7,
                        }}>
                          {dayjs(msg.createdAt).format('HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    size="large"
                    placeholder="Nhập tin nhắn..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onPressEnter={handleSend}
                    style={{ borderRadius: '12px 0 0 12px' }}
                  />
                  <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSend}
                    loading={sending} style={{ borderRadius: '0 12px 12px 0' }} />
                </Space.Compact>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
