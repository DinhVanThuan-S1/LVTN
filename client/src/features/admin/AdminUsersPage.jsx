/**
 * Admin User Management — Quản lý người dùng
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Input, Select, Popconfirm, message, Avatar, Tooltip } from 'antd';
import { UserOutlined, LockOutlined, UnlockOutlined, SearchOutlined } from '@ant-design/icons';
import { adminService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const roleConfig = {
  student: { color: 'blue', label: '🎓 Sinh viên' },
  recruiter: { color: 'green', label: '🏢 NTD' },
  admin: { color: 'red', label: '⚙️ Admin' },
};
const statusConfig = {
  active: { color: 'success', label: 'Hoạt động' },
  inactive: { color: 'default', label: 'Vô hiệu' },
  banned: { color: 'error', label: 'Bị khóa' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const results = [];

      // Fetch theo role filter hoặc cả 2
      if (!roleFilter || roleFilter === 'student') {
        const res = await adminService.getStudents(params);
        (res.data || []).forEach((u) => results.push({ ...u, role: 'student' }));
      }
      if (!roleFilter || roleFilter === 'recruiter') {
        const res = await adminService.getRecruiters(params);
        (res.data || []).forEach((u) => results.push({ ...u, role: 'recruiter' }));
      }
      setUsers(results);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleStatusChange = async (id, status, role) => {
    try {
      if (role === 'student') {
        await adminService.updateStudentStatus(id, { status });
      } else {
        await adminService.updateRecruiterStatus(id, { status });
      }
      message.success(`Đã ${status === 'active' ? 'mở khóa' : 'khóa'} tài khoản`);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, r) => (
        <Space>
          <Avatar src={r.profile?.avatar} icon={<UserOutlined />} style={{ background: '#4F46E5' }} />
          <div>
            <Text strong>{r.profile?.fullName || '—'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={roleConfig[role]?.color}>{roleConfig[role]?.label}</Tag>,
      filters: [
        { text: 'Sinh viên', value: 'student' },
        { text: 'NTD', value: 'recruiter' },
        { text: 'Admin', value: 'admin' },
      ],
      onFilter: (v, r) => r.role === v,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label || status}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => dayjs(d).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      responsive: ['lg'],
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, r) => {
        if (r.role === 'admin') return null;
        const isActive = r.status === 'active';
        return (
          <Popconfirm title={`${isActive ? 'Khóa' : 'Mở khóa'} tài khoản?`}
            onConfirm={() => handleStatusChange(r._id, isActive ? 'banned' : 'active', r.role)}
            okText="Xác nhận" cancelText="Hủy">
            <Tooltip title={isActive ? 'Khóa' : 'Mở khóa'}>
              <Button type="text" danger={isActive} icon={isActive ? <LockOutlined /> : <UnlockOutlined />} />
            </Tooltip>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <Title level={3} style={{ marginBottom: 24 }}>👥 Quản lý người dùng</Title>

      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Space wrap>
          <Input.Search placeholder="Tìm tên hoặc email..." style={{ width: 280 }} value={search}
            onChange={(e) => setSearch(e.target.value)} onSearch={fetchUsers} allowClear />
          <Select placeholder="Vai trò" style={{ width: 150 }} value={roleFilter || undefined}
            onChange={(v) => setRoleFilter(v || '')} allowClear
            options={[
              { value: 'student', label: '🎓 Sinh viên' },
              { value: 'recruiter', label: '🏢 NTD' },
              { value: 'admin', label: '⚙️ Admin' },
            ]} />
        </Space>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Table dataSource={users} columns={columns} rowKey="_id" loading={loading}
          pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t} người dùng` }} />
      </Card>
    </div>
  );
}
