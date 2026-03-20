/**
 * Dashboard Layout — Sidebar + Header + Content
 * Dùng chung cho Student, Recruiter, Admin
 */
import { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, theme as antTheme } from 'antd';
import {
  DashboardOutlined, BookOutlined, RocketOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, MessageOutlined, BellOutlined,
  UserOutlined, SettingOutlined, LogoutOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, SearchOutlined, BulbOutlined, BarChartOutlined,
  AppstoreOutlined, SafetyCertificateOutlined, AimOutlined,
  SolutionOutlined, HeartOutlined, ReadOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Menu items theo role
const getMenuItems = (role) => {
  const studentMenu = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/roadmaps', icon: <RocketOutlined />, label: 'Lộ trình học tập' },
    { key: '/my-roadmaps', icon: <ReadOutlined />, label: 'Lộ trình của tôi' },
    { key: '/skill-map', icon: <BulbOutlined />, label: 'Bản đồ kỹ năng' },
    { key: '/academic', icon: <BookOutlined />, label: 'Hồ sơ học tập' },
    { key: '/career-preferences', icon: <AimOutlined />, label: 'Sở thích nghề' },
    { key: '/jobs', icon: <SearchOutlined />, label: 'Tìm việc làm' },
    { key: '/my-applications', icon: <FileTextOutlined />, label: 'Đơn ứng tuyển' },
    { key: '/my-cvs', icon: <SolutionOutlined />, label: 'Quản lý CV' },
    { key: '/favorites', icon: <HeartOutlined />, label: 'Yêu thích' },
    { key: '/chat', icon: <MessageOutlined />, label: 'Tin nhắn' },
  ];

  const recruiterMenu = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/company', icon: <BankOutlined />, label: 'Hồ sơ công ty' },
    { key: '/my-jobs', icon: <AppstoreOutlined />, label: 'Tin tuyển dụng' },
    { key: '/applicants', icon: <TeamOutlined />, label: 'Ứng viên' },
    { key: '/chat', icon: <MessageOutlined />, label: 'Tin nhắn' },
  ];

  const adminMenu = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Quản lý người dùng' },
    { key: '/admin/skills', icon: <BulbOutlined />, label: 'Kỹ năng' },
    { key: '/admin/courses', icon: <BookOutlined />, label: 'Học phần' },
    { key: '/admin/careers', icon: <AimOutlined />, label: 'Hướng nghề nghiệp' },
    { key: '/admin/roadmaps', icon: <RocketOutlined />, label: 'Lộ trình mẫu' },
    { key: '/admin/jobs', icon: <SafetyCertificateOutlined />, label: 'Duyệt tin tuyển dụng' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Thống kê' },
  ];

  switch (role) {
    case 'recruiter': return recruiterMenu;
    case 'admin': return adminMenu;
    default: return studentMenu;
  }
};

const roleTitles = {
  student: 'Sinh viên',
  recruiter: 'Nhà tuyển dụng',
  admin: 'Quản trị viên',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { token } = antTheme.useToken();

  const role = user?.role || 'student';
  const menuItems = useMemo(() => getMenuItems(role), [role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Trang cá nhân', onClick: () => navigate('/profile') },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt', onClick: () => navigate('/settings') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ===== SIDEBAR ===== */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Text style={{ color: '#fff', fontSize: collapsed ? 18 : 22, fontWeight: 700 }}>
            {collapsed ? '📚' : '📚 EduPath'}
          </Text>
        </div>

        {/* Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />

        {/* Role Badge */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: '12px 16px',
            background: 'rgba(79,70,229,0.2)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <Text style={{ color: '#A5B4FC', fontSize: 12 }}>
              {roleTitles[role]}
            </Text>
          </div>
        )}
      </Sider>

      {/* ===== MAIN CONTENT ===== */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header style={{
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          background: token.colorBgContainer,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size={20}>
            {/* Notifications */}
            <Badge count={0} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>

            {/* Chat */}
            <Badge count={0} size="small">
              <Button
                type="text"
                icon={<MessageOutlined style={{ fontSize: 18 }} />}
                onClick={() => navigate('/chat')}
              />
            </Badge>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.profile?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: token.colorPrimary }}
                />
                <Text strong style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.profile?.fullName || 'User'}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
