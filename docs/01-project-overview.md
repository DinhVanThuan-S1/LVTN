# 📘 EduPath — Tổng quan Dự án

> **Tên đầy đủ:** Hệ thống cá nhân hóa lộ trình học tập và định hướng nghề nghiệp cho sinh viên CNTT có tích hợp hệ thống gợi ý
> **Tên ngắn:** EduPath
> **Phiên bản:** 1.0
> **Ngày khởi tạo:** 20/03/2026
> **Tech Lead:** AI Agent

---

## 1. Mô tả dự án

EduPath là hệ thống web hỗ trợ sinh viên CNTT:
- Quản lý hồ sơ học tập, phân tích kỹ năng từ kết quả học tập
- Xây dựng **Skill Map** (bản đồ kỹ năng)
- Gợi ý **hướng nghề nghiệp** phù hợp (recommendation system)
- Gợi ý **lộ trình học tập** cá nhân hóa
- Tạo **lịch học** theo thời gian rảnh
- Theo dõi **tiến độ học**, làm **bài test kỹ năng**
- Tìm kiếm và **ứng tuyển việc làm**
- Hỗ trợ **nhà tuyển dụng** đăng tin, lọc ứng viên
- Hỗ trợ **quản trị viên** quản lý dữ liệu nền tảng

**Lưu ý quan trọng:**
- Hệ thống KHÔNG thay thế kế hoạch học tập chính khóa của trường
- Tập trung gợi ý kiến thức, kỹ năng, tài nguyên, bài tập, lộ trình bổ sung ngoài CTĐT
- Ưu tiên toàn bộ label, giao diện và nội dung hiển thị bằng tiếng Việt

---

## 2. Công nghệ

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | React + Vite + React Router v6 | React 18.x, Vite 5.x |
| UI Library | Ant Design 5 | 5.x |
| State Management | Redux Toolkit + RTK Query | 2.x |
| Backend | Node.js + Express.js | Node 20 LTS, Express 4.x |
| Database | MongoDB (Mongoose) | Mongo 7, Mongoose 8.x |
| AI Service | Python + FastAPI | Python 3.11+, FastAPI 0.110+ |
| Real-time | Socket.IO | 4.x |
| Auth | JWT + Google OAuth2 | passport-google-oauth20 |
| LLM | Ollama / OpenAI GPT / Google Gemini | Cấu hình linh hoạt |

---

## 3. Vai trò người dùng

| # | Role | Mô tả |
|---|------|-------|
| 1 | Khách vãng lai (Guest) | Xem công khai, đăng ký |
| 2 | Sinh viên (Student) | Quản lý hồ sơ, học lộ trình, ứng tuyển |
| 3 | Nhà tuyển dụng (Recruiter) | Đăng tin, quản lý ứng viên |
| 4 | Quản trị viên (Admin) | Quản lý master data, duyệt tin |

---

## 4. Cấu trúc dự án

```
LVTN/
├── client/          ← React Frontend (Vite)
├── server/          ← Node.js + Express Backend
├── ai-service/      ← Python FastAPI (Recommendation Engine)
├── docs/            ← Tài liệu dự án
├── docker-compose.yml
└── README.md
```

---

## 5. Liên kết tài liệu

- [02 - Requirements](./02-requirements.md)
- [03 - System Architecture](./03-system-architecture.md)
- [04 - Database Design](./04-database-design.md)
- [05 - API Spec](./05-api-spec.md)
- [06 - Frontend Structure](./06-frontend-structure.md)
- [07 - Recommendation Design](./07-recommendation-design.md)
- [08 - Progress Log](./08-progress-log.md)
- [09 - Chat History Summary](./09-chat-history-summary.md)
- [10 - Decisions & Assumptions](./10-decisions-and-assumptions.md)
- [11 - Task Breakdown](./11-task-breakdown.md)
