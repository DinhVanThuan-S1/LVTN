# 📋 Task Breakdown — EduPath

## Backend Modules (Node.js + Express 5 + Mongoose 9)

### Module 1: Auth + Role ✅
- [x] 1.1 Khởi tạo server Node.js + Express
- [x] 1.2 Cấu hình MongoDB connection
- [x] 1.3 User Model (Mongoose)
- [x] 1.4 Refresh Token Model
- [x] 1.5 Auth Service (register, login, google, refresh, logout, change-password)
- [x] 1.6 Auth Controller
- [x] 1.7 Auth Validation (express-validator)
- [x] 1.8 Auth Routes
- [x] 1.9 Middleware: authenticate, authorize, errorHandler, validate
- [x] 1.10 Utility: ApiError, ApiResponse, catchAsync
- [x] 1.11 Config: logger, constants, passport (Google OAuth)
- [x] 1.12 Rate limiter

### Module 2: User Profile ✅
- [x] 2.1 User Controller + Service (getMe, updateMe, uploadAvatar)
- [x] 2.2 User Routes + Validation
- [x] 2.3 Multer config cho upload ✅

### Module 3: Admin Master Data ✅
- [x] 3.1 Skill Model + CRUD (24 skills mẫu)
- [x] 3.2 Course Model + CRUD (15 courses mẫu)
- [x] 3.3 Curriculum Model + CRUD
- [x] 3.4 Career Direction Model + CRUD (9 hướng nghề nghiệp)
- [x] 3.5 Job Template Model + CRUD
- [x] 3.6 Admin routes + validation (38 endpoints)
- [x] 3.7 Kiểm tra tham chiếu trước khi xóa (BR-13)
- [x] 3.8 Public routes cho Guest access
- [x] 3.9 Seed script

### Module 4: Student Academic Profile + Skill Map ✅
- [x] 4.1 Academic Profile Model + CRUD
- [x] 4.2 Career Preference Model + CRUD
- [x] 4.3 Skill Map Engine (tính từ grades × skill weights)

### Module 5: Roadmap ✅
- [x] 5.1 Roadmap Model (lộ trình mẫu)
- [x] 5.2 Personal Roadmap Model (lộ trình cá nhân)
- [x] 5.3 Admin CRUD lộ trình mẫu + toggle publish
- [x] 5.4 Student enroll, customize, view schedule
- [x] 5.5 Start/complete step + auto-unlock + progress tracking
- [x] 5.6 Skill Test + Test Result + auto-grading

### Module 6: Jobs + Application ✅
- [x] 6.1 Job Model + public listing + search
- [x] 6.2 Application Model + student apply/withdraw
- [x] 6.3 Favorites Model (polymorphic Job/Roadmap)
- [x] 6.4 Business rules (BR-06, BR-07, BR-08)

### Module 7: Recruiter Workflow ✅
- [x] 7.1 Company Profile Model + CRUD
- [x] 7.2 CV Model + CRUD (6 endpoints)
- [x] 7.3 Recruiter Job CRUD + submit for review
- [x] 7.4 Admin approve/reject jobs (BR-09, BR-10)
- [x] 7.5 Applicant management (review, interview schedule)

### Module 8: Chat + Realtime ✅
- [x] 8.1 Conversation Model (direct + group + context)
- [x] 8.2 Message Model (text, image, file, readBy)
- [x] 8.3 Chat Service (send, mark read, unread count, soft delete)
- [x] 8.4 Chat Routes (7 endpoints)
- [x] 8.5 Socket.IO: chat:join, chat:leave, chat:typing, chat:message, chat:read

### Module 9: Notification ✅
- [x] 9.1 Notification Model (TTL 90 ngày)
- [x] 9.2 Socket.IO realtime push
- [x] 9.3 Notification routes (4 endpoints)
- [x] 9.4 Business event helpers (application, job review, roadmap, test)

### Module 10: Analytics ✅
- [x] 10.1 Admin Dashboard (overview + user growth + top skills)
- [x] 10.2 Student Dashboard (GPA + roadmaps + skills + apps)
- [x] 10.3 Recruiter Dashboard (jobs + applicants)

### Config ✅
- [x] Multer upload (avatar, CV, attachments)
- [x] Socket.IO config (JWT auth, rooms)
- [x] Constants (20+ enums)

---

## Pending

### AI Recommendation Engine (Python FastAPI)
- [ ] 8.1 Khởi tạo FastAPI project
- [ ] 8.2 Skill Map Engine (cải tiến)
- [ ] 8.3 Roadmap Recommender
- [ ] 8.4 Job Recommender (hybrid)
- [ ] 8.5 Readiness Scorer
- [ ] 8.6 Schedule Builder
- [ ] 8.7 LLM Explainer
- [ ] 8.8 Recommendation Gateway (Express proxy)

### Frontend (React + Vite + Ant Design)
- [ ] F.1 Khởi tạo Vite + React
- [ ] F.2 Design system + theme
- [ ] F.3 Auth pages (login, register)
- [ ] F.4 Layout components (Guest, Dashboard)
- [ ] F.5 Redux store + API slices
- [ ] F.6 Student pages
- [ ] F.7 Recruiter pages
- [ ] F.8 Admin pages
