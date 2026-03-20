# 🧠 Decisions & Assumptions — EduPath

## Quyết định kỹ thuật

| # | Quyết định | Lý do |
|---|-----------|-------|
| D-01 | Monorepo (3 thư mục) | Dễ quản lý source code cho 1-2 developers |
| D-02 | Module-based backend | Mỗi module tự chứa (model, service, controller, route), dễ bảo trì |
| D-03 | RTK Query | Auto-caching, auto-refetch, giảm boilerplate so với Axios |
| D-04 | FastAPI tách biệt | Scale AI service độc lập, có thể dùng GPU riêng |
| D-05 | AI đọc MongoDB trực tiếp | Giảm overhead trung chuyển data khi aggregate lớn |
| D-06 | Express là gateway cho AI | Client không gọi trực tiếp → bảo mật + cache + auth |
| D-07 | Socket.IO | Chat real-time, fallback tốt cho proxy |
| D-08 | Redis optional | Dev dùng in-memory cache, prod dùng Redis |
| D-09 | Ant Design 5 | Component library lớn, hỗ trợ locale tiếng Việt, phù hợp ứng dụng quản trị |
| D-10 | Ollama mặc định cho LLM | Tiết kiệm chi phí local, chuyển OpenAI/Gemini khi deploy |

## Giả định hệ thống

| # | Giả định |
|---|----------|
| A-01 | "Chat" bao gồm chat giữa SV ↔ NTD và AI chatbot hỗ trợ |
| A-02 | "Bài tập" trong lộ trình là dạng tự thực hành, có link đề, không cần chấm tự động |
| A-03 | "Bài test kỹ năng" là trắc nghiệm online, hệ thống tự chấm |
| A-04 | Readiness Score = tổng hợp điểm test + % hoàn thành lộ trình + Skill Map score |
| A-05 | WebSocket dùng Socket.IO cho chat real-time |
| A-06 | AI service ban đầu dùng Ollama local |
