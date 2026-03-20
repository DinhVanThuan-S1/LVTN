/**
 * App-wide Constants & Enums
 * Định nghĩa tất cả enum values và constants dùng chung toàn hệ thống
 */

// ========== USER ENUMS ==========
const ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};
const ROLES_ARRAY = Object.values(ROLES);

const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  PENDING_VERIFICATION: 'pending_verification',
};
const USER_STATUS_ARRAY = Object.values(USER_STATUS);

const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};
const GENDERS_ARRAY = Object.values(GENDERS);

// ========== JOB ENUMS ==========
const JOB_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CLOSED: 'closed',
};
const JOB_STATUS_ARRAY = Object.values(JOB_STATUS);

const JOB_TYPE = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
  REMOTE: 'remote',
};
const JOB_TYPE_ARRAY = Object.values(JOB_TYPE);

const EXPERIENCE_LEVEL = {
  INTERN: 'intern',
  FRESHER: 'fresher',
  JUNIOR: 'junior',
  MIDDLE: 'middle',
  SENIOR: 'senior',
  LEAD: 'lead',
};
const EXPERIENCE_LEVEL_ARRAY = Object.values(EXPERIENCE_LEVEL);

// ========== APPLICATION ENUMS ==========
const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};
const APPLICATION_STATUS_ARRAY = Object.values(APPLICATION_STATUS);

// Trạng thái đơn chưa kết thúc (dùng cho BR-07)
const ACTIVE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.PENDING,
  APPLICATION_STATUS.REVIEWING,
  APPLICATION_STATUS.INTERVIEW_SCHEDULED,
];

// ========== ROADMAP ENUMS ==========
const ROADMAP_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};
const ROADMAP_LEVEL_ARRAY = Object.values(ROADMAP_LEVEL);

const PERSONAL_ROADMAP_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
const PERSONAL_ROADMAP_STATUS_ARRAY = Object.values(PERSONAL_ROADMAP_STATUS);

const SESSION_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};
const SESSION_STATUS_ARRAY = Object.values(SESSION_STATUS);

// ========== SKILL ENUMS ==========
const SKILL_CATEGORY = {
  PROGRAMMING: 'programming',
  DATABASE: 'database',
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DEVOPS: 'devops',
  AI_ML: 'ai_ml',
  TESTING: 'testing',
  TOOLS: 'tools',
  SOFT_SKILLS: 'soft_skills',
  NETWORKING: 'networking',
  SECURITY: 'security',
  MOBILE: 'mobile',
};
const SKILL_CATEGORY_ARRAY = Object.values(SKILL_CATEGORY);

// Tên tiếng Việt cho category
const SKILL_CATEGORY_LABELS = {
  programming: 'Lập trình',
  database: 'Cơ sở dữ liệu',
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  ai_ml: 'AI/ML',
  testing: 'Kiểm thử',
  tools: 'Công cụ',
  soft_skills: 'Kỹ năng mềm',
  networking: 'Mạng',
  security: 'Bảo mật',
  mobile: 'Mobile',
};

const PROFICIENCY_LEVEL = {
  NONE: 'none',
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};
const PROFICIENCY_LEVEL_ARRAY = Object.values(PROFICIENCY_LEVEL);

const RESOURCE_TYPE = {
  VIDEO: 'video',
  ARTICLE: 'article',
  BOOK: 'book',
  LINK: 'link',
  DOCUMENT: 'document',
};
const RESOURCE_TYPE_ARRAY = Object.values(RESOURCE_TYPE);

const EXERCISE_TYPE = {
  THEORY: 'theory',
  PRACTICE: 'practice',
  PROJECT: 'project',
};
const EXERCISE_TYPE_ARRAY = Object.values(EXERCISE_TYPE);

// ========== COURSE ENUMS ==========
const COURSE_TYPE = {
  GENERAL: 'general',
  FOUNDATIONAL: 'foundational',
  SPECIALIZED: 'specialized',
  ELECTIVE: 'elective',
  THESIS: 'thesis',
};
const COURSE_TYPE_ARRAY = Object.values(COURSE_TYPE);

// ========== TEST ENUMS ==========
const QUESTION_TYPE = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
};
const QUESTION_TYPE_ARRAY = Object.values(QUESTION_TYPE);

// ========== NOTIFICATION ENUMS ==========
const NOTIFICATION_TYPE = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  JOB_APPROVED: 'job_approved',
  JOB_REJECTED: 'job_rejected',
  ROADMAP_COMPLETED: 'roadmap_completed',
  TEST_RESULT: 'test_result',
  SYSTEM: 'system',
};
const NOTIFICATION_TYPE_ARRAY = Object.values(NOTIFICATION_TYPE);

// ========== FAVORITE ENUMS ==========
const FAVORITE_TYPE = {
  JOB: 'job',
  ROADMAP: 'roadmap',
};
const FAVORITE_TYPE_ARRAY = Object.values(FAVORITE_TYPE);

// ========== SEMESTER ENUMS ==========
const SEMESTER_TYPE = {
  FIRST: '1',
  SECOND: '2',
  SUMMER: 'summer',
};
const SEMESTER_TYPE_ARRAY = Object.values(SEMESTER_TYPE);

// ========== IMPORTANCE ENUMS ==========
const IMPORTANCE = {
  MUST_HAVE: 'must_have',
  SHOULD_HAVE: 'should_have',
  NICE_TO_HAVE: 'nice_to_have',
};
const IMPORTANCE_ARRAY = Object.values(IMPORTANCE);

module.exports = {
  ROLES, ROLES_ARRAY,
  USER_STATUS, USER_STATUS_ARRAY,
  GENDERS, GENDERS_ARRAY,
  JOB_STATUS, JOB_STATUS_ARRAY,
  JOB_TYPE, JOB_TYPE_ARRAY,
  EXPERIENCE_LEVEL, EXPERIENCE_LEVEL_ARRAY,
  APPLICATION_STATUS, APPLICATION_STATUS_ARRAY, ACTIVE_APPLICATION_STATUSES,
  ROADMAP_LEVEL, ROADMAP_LEVEL_ARRAY,
  PERSONAL_ROADMAP_STATUS, PERSONAL_ROADMAP_STATUS_ARRAY,
  SESSION_STATUS, SESSION_STATUS_ARRAY,
  SKILL_CATEGORY, SKILL_CATEGORY_ARRAY, SKILL_CATEGORY_LABELS,
  PROFICIENCY_LEVEL, PROFICIENCY_LEVEL_ARRAY,
  RESOURCE_TYPE, RESOURCE_TYPE_ARRAY,
  EXERCISE_TYPE, EXERCISE_TYPE_ARRAY,
  COURSE_TYPE, COURSE_TYPE_ARRAY,
  QUESTION_TYPE, QUESTION_TYPE_ARRAY,
  NOTIFICATION_TYPE, NOTIFICATION_TYPE_ARRAY,
  FAVORITE_TYPE, FAVORITE_TYPE_ARRAY,
  SEMESTER_TYPE, SEMESTER_TYPE_ARRAY,
  IMPORTANCE, IMPORTANCE_ARRAY,
};
