/**
 * App Router — React Router v7
 * ✅ 100% HOÀN CHỈNH — Landing Page + 35 protected routes
 */
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth & Public
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

// Roadmap
import RoadmapExplorer from '../features/roadmap/RoadmapExplorer';
import RoadmapDetailPage from '../features/roadmap/RoadmapDetailPage';
import MyRoadmapsPage from '../features/roadmap/MyRoadmapsPage';
import RoadmapProgressPage from '../features/roadmap/RoadmapProgressPage';

// Jobs
import JobSearchPage from '../features/jobs/JobSearchPage';
import JobDetailPage from '../features/jobs/JobDetailPage';
import MyApplicationsPage from '../features/jobs/MyApplicationsPage';
import RecruiterMyJobsPage from '../features/jobs/RecruiterMyJobsPage';
import RecruiterJobFormPage from '../features/jobs/RecruiterJobFormPage';
import RecruiterApplicantsPage from '../features/jobs/RecruiterApplicantsPage';

// Profile
import ProfilePage from '../features/profile/ProfilePage';
import CVManagerPage from '../features/profile/CVManagerPage';
import CompanyProfilePage from '../features/profile/CompanyProfilePage';
import FavoritesPage from '../features/profile/FavoritesPage';

// Academic & Career
import AcademicProfilePage from '../features/academic/AcademicProfilePage';
import SkillMapPage from '../features/academic/SkillMapPage';
import CareerPreferencePage from '../features/career/CareerPreferencePage';

// Chat & Notification
import ChatPage from '../features/chat/ChatPage';
import NotificationPage from '../features/notification/NotificationPage';

// Settings
import SettingsPage from '../features/settings/SettingsPage';

// Admin
import AdminUsersPage from '../features/admin/AdminUsersPage';
import AdminSkillsPage from '../features/admin/AdminSkillsPage';
import AdminCoursesPage from '../features/admin/AdminCoursesPage';
import AdminCareersPage from '../features/admin/AdminCareersPage';
import AdminRoadmapsPage from '../features/admin/AdminRoadmapsPage';
import AdminJobApprovalPage from '../features/admin/AdminJobApprovalPage';
import AdminAnalyticsPage from '../features/admin/AdminAnalyticsPage';

const router = createBrowserRouter([
  // ===== PUBLIC =====
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // ===== PROTECTED (Dashboard Layout) =====
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },

      // Student — Roadmap
      { path: 'roadmaps', element: <RoadmapExplorer /> },
      { path: 'roadmaps/:id', element: <RoadmapDetailPage /> },
      { path: 'my-roadmaps', element: <MyRoadmapsPage /> },
      { path: 'my-roadmaps/:id', element: <RoadmapProgressPage /> },
      { path: 'skill-map', element: <SkillMapPage /> },
      { path: 'academic', element: <AcademicProfilePage /> },
      { path: 'career-preferences', element: <CareerPreferencePage /> },

      // Student — Jobs
      { path: 'jobs', element: <JobSearchPage /> },
      { path: 'jobs/:id', element: <JobDetailPage /> },
      { path: 'my-applications', element: <MyApplicationsPage /> },
      { path: 'my-cvs', element: <CVManagerPage /> },
      { path: 'favorites', element: <FavoritesPage /> },

      // Recruiter
      { path: 'company', element: <CompanyProfilePage /> },
      { path: 'my-jobs', element: <RecruiterMyJobsPage /> },
      { path: 'my-jobs/create', element: <RecruiterJobFormPage /> },
      { path: 'my-jobs/:id/edit', element: <RecruiterJobFormPage /> },
      { path: 'applicants', element: <RecruiterApplicantsPage /> },

      // Admin
      { path: 'admin/users', element: <AdminUsersPage /> },
      { path: 'admin/skills', element: <AdminSkillsPage /> },
      { path: 'admin/courses', element: <AdminCoursesPage /> },
      { path: 'admin/careers', element: <AdminCareersPage /> },
      { path: 'admin/roadmaps', element: <AdminRoadmapsPage /> },
      { path: 'admin/jobs', element: <AdminJobApprovalPage /> },
      { path: 'admin/analytics', element: <AdminAnalyticsPage /> },

      // Common
      { path: 'chat', element: <ChatPage /> },
      { path: 'notifications', element: <NotificationPage /> },
    ],
  },

  // ===== ERROR =====
  { path: '/unauthorized', element: <div style={{ padding: 48, textAlign: 'center' }}><h2>403 — Không có quyền truy cập</h2></div> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
