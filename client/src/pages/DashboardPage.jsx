/**
 * Dashboard Page — Route theo role
 */
import { useSelector } from 'react-redux';
import StudentDashboard from '../features/dashboard/StudentDashboard';
import RecruiterDashboard from '../features/dashboard/RecruiterDashboard';
import AdminDashboard from '../features/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'recruiter': return <RecruiterDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <StudentDashboard />;
  }
}
