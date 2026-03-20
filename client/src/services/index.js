/**
 * Các API services tổng hợp
 */
import api from './api';

// ===== ANALYTICS =====
export const analyticsService = {
  getAdminDashboard: () => api.get('/analytics/admin'),
  getStudentDashboard: () => api.get('/analytics/student'),
  getRecruiterDashboard: () => api.get('/analytics/recruiter'),
};

// ===== ROADMAP =====
export const roadmapService = {
  getPublicList: (params) => api.get('/roadmaps/public', { params }),
  getPublicDetail: (id) => api.get(`/roadmaps/public/${id}`),
  // Admin
  getAll: (params) => api.get('/roadmaps', { params }),
  getById: (id) => api.get(`/roadmaps/${id}`),
  create: (data) => api.post('/roadmaps', data),
  update: (id, data) => api.put(`/roadmaps/${id}`, data),
  togglePublish: (id) => api.patch(`/roadmaps/${id}/publish`),
  delete: (id) => api.delete(`/roadmaps/${id}`),
};

// ===== PERSONAL ROADMAP =====
export const personalRoadmapService = {
  getMyRoadmaps: (params) => api.get('/my-roadmaps', { params }),
  getById: (id) => api.get(`/my-roadmaps/${id}`),
  enroll: (roadmapId) => api.post('/my-roadmaps/enroll', { roadmapId }),
  startStep: (id, phaseId, stepId) => api.post(`/my-roadmaps/${id}/steps/${phaseId}/${stepId}/start`),
  completeStep: (id, phaseId, stepId, data) => api.post(`/my-roadmaps/${id}/steps/${phaseId}/${stepId}/complete`, data),
  updateSchedule: (id, data) => api.put(`/my-roadmaps/${id}/schedule`, data),
  updateStatus: (id, status) => api.patch(`/my-roadmaps/${id}/status`, { status }),
  submitTest: (testId, answers) => api.post(`/my-roadmaps/tests/${testId}/submit`, { answers }),
  getTestResults: (params) => api.get('/my-roadmaps/test-results/me', { params }),
};

// ===== JOBS =====
export const jobService = {
  search: (params) => api.get('/jobs/search', { params }),
  getDetail: (id) => api.get(`/jobs/${id}/detail`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getMyApplications: (params) => api.get('/jobs/my-applications', { params }),
  withdrawApplication: (id) => api.patch(`/jobs/applications/${id}/withdraw`),
  toggleFavorite: (targetType, targetId) => api.post('/jobs/favorites', { targetType, targetId }),
  getFavorites: (params) => api.get('/jobs/favorites', { params }),
  // Recruiter
  getRecruiterJobs: (params) => api.get('/jobs/recruiter/my-jobs', { params }),
  createJob: (data) => api.post('/jobs/recruiter', data),
  updateJob: (id, data) => api.put(`/jobs/recruiter/${id}`, data),
  submitForReview: (id) => api.patch(`/jobs/recruiter/${id}/submit`),
  deleteJob: (id) => api.delete(`/jobs/recruiter/${id}`),
  getJobApplications: (id, params) => api.get(`/jobs/recruiter/${id}/applications`, { params }),
  updateApplicationStatus: (id, data) => api.patch(`/jobs/recruiter/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.post(`/jobs/recruiter/applications/${id}/interview`, data),
  // Admin
  getPendingJobs: (params) => api.get('/jobs/admin/pending', { params }),
  approveJob: (id) => api.patch(`/jobs/admin/${id}/approve`),
  rejectJob: (id, reason) => api.patch(`/jobs/admin/${id}/reject`, { reason }),
};

// ===== CV =====
export const cvService = {
  getAll: () => api.get('/cvs'),
  getById: (id) => api.get(`/cvs/${id}`),
  create: (data) => api.post('/cvs', data),
  update: (id, data) => api.put(`/cvs/${id}`, data),
  setDefault: (id) => api.patch(`/cvs/${id}/default`),
  delete: (id) => api.delete(`/cvs/${id}`),
};

// ===== COMPANY =====
export const companyService = {
  getMe: () => api.get('/company/me'),
  update: (data) => api.put('/company/me', data),
};

// ===== NOTIFICATION =====
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// ===== CHAT =====
export const chatService = {
  getConversations: (params) => api.get('/chat/conversations', { params }),
  createConversation: (data) => api.post('/chat/conversations', data),
  getMessages: (id, params) => api.get(`/chat/conversations/${id}/messages`, { params }),
  sendMessage: (id, data) => api.post(`/chat/conversations/${id}/messages`, data),
  markAsRead: (id) => api.patch(`/chat/conversations/${id}/read`),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
  getUnread: () => api.get('/chat/unread'),
};

// ===== PUBLIC =====
export const publicService = {
  getSkills: (params) => api.get('/public/skills', { params }),
  getCourses: (params) => api.get('/public/courses', { params }),
  getCareerDirections: (params) => api.get('/public/career-directions', { params }),
};

// ===== ACADEMIC PROFILE =====
export const academicProfileService = {
  getMyProfile: () => api.get('/academic-profile'),
  createProfile: (data) => api.post('/academic-profile', data),
  addSemester: (data) => api.post('/academic-profile/semesters', data),
  updateSemester: (semesterId, data) => api.put(`/academic-profile/semesters/${semesterId}`, data),
  deleteSemester: (semesterId) => api.delete(`/academic-profile/semesters/${semesterId}`),
  getSkillMap: () => api.get('/academic-profile/skill-map'),
};

// ===== CAREER PREFERENCE =====
export const careerPreferenceService = {
  get: () => api.get('/career-preferences'),
  update: (data) => api.put('/career-preferences', data),
};

// ===== ADMIN =====
export const adminService = {
  // Skills
  getSkills: (params) => api.get('/admin/skills', { params }),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`),
  // Courses
  getCourses: (params) => api.get('/admin/courses', { params }),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  // Career Directions
  getCareerDirections: (params) => api.get('/admin/career-directions', { params }),
  createCareerDirection: (data) => api.post('/admin/career-directions', data),
  updateCareerDirection: (id, data) => api.put(`/admin/career-directions/${id}`, data),
  deleteCareerDirection: (id) => api.delete(`/admin/career-directions/${id}`),
  // Users (students + recruiters)
  getStudents: (params) => api.get('/admin/students', { params }),
  getRecruiters: (params) => api.get('/admin/recruiters', { params }),
  updateStudentStatus: (id, data) => api.patch(`/admin/students/${id}/status`, data),
  updateRecruiterStatus: (id, data) => api.patch(`/admin/recruiters/${id}/status`, data),
};
