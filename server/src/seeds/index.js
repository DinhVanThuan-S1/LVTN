/**
 * Seed Script — Tạo dữ liệu mẫu
 * Chạy: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../modules/user/user.model');
const Skill = require('../modules/skill/skill.model');
const Course = require('../modules/course/course.model');
const Curriculum = require('../modules/curriculum/curriculum.model');
const CareerDirection = require('../modules/career-direction/career-direction.model');
const logger = require('../config/logger');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB đã kết nối cho seeding');

    // ========== 1. TẠO ADMIN ==========
    const existingAdmin = await User.findOne({ email: 'admin@edupath.vn' });
    if (!existingAdmin) {
      await User.create({
        email: 'admin@edupath.vn',
        password: 'Admin@2026',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        profile: { fullName: 'Quản trị viên EduPath' },
      });
      logger.info('✅ Tạo tài khoản admin thành công');
    } else {
      logger.info('⏭️  Admin đã tồn tại, bỏ qua');
    }

    // ========== 2. TẠO KỸ NĂNG MẪU ==========
    const skillsData = [
      { name: 'JavaScript', slug: 'javascript', category: 'programming', description: 'Ngôn ngữ lập trình web phổ biến nhất' },
      { name: 'TypeScript', slug: 'typescript', category: 'programming', description: 'Superset của JavaScript với static typing' },
      { name: 'Python', slug: 'python', category: 'programming', description: 'Ngôn ngữ lập trình đa năng, phổ biến cho AI/ML' },
      { name: 'Java', slug: 'java', category: 'programming', description: 'Ngôn ngữ lập trình OOP mạnh mẽ' },
      { name: 'C/C++', slug: 'c-cpp', category: 'programming', description: 'Ngôn ngữ lập trình hệ thống' },
      { name: 'React', slug: 'react', category: 'frontend', description: 'Thư viện JavaScript cho xây dựng UI' },
      { name: 'HTML/CSS', slug: 'html-css', category: 'frontend', description: 'Ngôn ngữ đánh dấu và tạo kiểu cho trang web' },
      { name: 'Node.js', slug: 'nodejs', category: 'backend', description: 'Runtime JavaScript phía server' },
      { name: 'Express.js', slug: 'expressjs', category: 'backend', description: 'Framework web cho Node.js' },
      { name: 'Spring Boot', slug: 'spring-boot', category: 'backend', description: 'Framework Java cho microservices' },
      { name: 'MySQL', slug: 'mysql', category: 'database', description: 'Hệ quản trị CSDL quan hệ phổ biến' },
      { name: 'MongoDB', slug: 'mongodb', category: 'database', description: 'Hệ quản trị CSDL NoSQL document-based' },
      { name: 'PostgreSQL', slug: 'postgresql', category: 'database', description: 'Hệ quản trị CSDL quan hệ mã nguồn mở mạnh mẽ' },
      { name: 'Docker', slug: 'docker', category: 'devops', description: 'Nền tảng container hóa ứng dụng' },
      { name: 'Git', slug: 'git', category: 'tools', description: 'Hệ thống quản lý phiên bản phân tán' },
      { name: 'Machine Learning', slug: 'machine-learning', category: 'ai_ml', description: 'Kỹ thuật học máy và trí tuệ nhân tạo' },
      { name: 'Deep Learning', slug: 'deep-learning', category: 'ai_ml', description: 'Kỹ thuật học sâu với neural networks' },
      { name: 'Unit Testing', slug: 'unit-testing', category: 'testing', description: 'Kiểm thử đơn vị phần mềm' },
      { name: 'REST API', slug: 'rest-api', category: 'backend', description: 'Thiết kế và phát triển RESTful APIs' },
      { name: 'Linux', slug: 'linux', category: 'devops', description: 'Hệ điều hành Linux cơ bản' },
      { name: 'Agile/Scrum', slug: 'agile-scrum', category: 'soft_skills', description: 'Phương pháp phát triển phần mềm linh hoạt' },
      { name: 'Networking', slug: 'networking', category: 'networking', description: 'Mạng máy tính cơ bản' },
      { name: 'React Native', slug: 'react-native', category: 'mobile', description: 'Framework phát triển ứng dụng mobile cross-platform' },
      { name: 'Cybersecurity', slug: 'cybersecurity', category: 'security', description: 'An ninh mạng và bảo mật thông tin' },
    ];

    for (const s of skillsData) {
      await Skill.findOneAndUpdate({ slug: s.slug }, s, { upsert: true, new: true });
    }
    logger.info(`✅ Tạo/cập nhật ${skillsData.length} kỹ năng mẫu`);

    // ========== 3. TẠO HỌC PHẦN MẪU ==========
    const coursesData = [
      { courseCode: 'IT001', name: 'Nhập môn lập trình', credits: 4, courseType: 'foundational' },
      { courseCode: 'IT002', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, courseType: 'foundational' },
      { courseCode: 'IT003', name: 'Cơ sở dữ liệu', credits: 4, courseType: 'foundational' },
      { courseCode: 'IT004', name: 'Mạng máy tính', credits: 3, courseType: 'foundational' },
      { courseCode: 'IT005', name: 'Hệ điều hành', credits: 3, courseType: 'foundational' },
      { courseCode: 'IT006', name: 'Lập trình hướng đối tượng', credits: 4, courseType: 'foundational' },
      { courseCode: 'IT007', name: 'Phát triển ứng dụng web', credits: 4, courseType: 'specialized' },
      { courseCode: 'IT008', name: 'Công nghệ phần mềm', credits: 3, courseType: 'specialized' },
      { courseCode: 'IT009', name: 'Trí tuệ nhân tạo', credits: 3, courseType: 'specialized' },
      { courseCode: 'IT010', name: 'Phát triển ứng dụng mobile', credits: 3, courseType: 'elective' },
      { courseCode: 'IT011', name: 'An toàn thông tin', credits: 3, courseType: 'elective' },
      { courseCode: 'IT012', name: 'Học máy', credits: 3, courseType: 'elective' },
      { courseCode: 'GE001', name: 'Toán rời rạc', credits: 3, courseType: 'general' },
      { courseCode: 'GE002', name: 'Xác suất thống kê', credits: 3, courseType: 'general' },
      { courseCode: 'GE003', name: 'Tiếng Anh chuyên ngành CNTT', credits: 3, courseType: 'general' },
    ];

    for (const c of coursesData) {
      await Course.findOneAndUpdate({ courseCode: c.courseCode }, c, { upsert: true, new: true });
    }
    logger.info(`✅ Tạo/cập nhật ${coursesData.length} học phần mẫu`);

    // ========== 4. TẠO HƯỚNG NGHỀ NGHIỆP MẪU ==========
    const directionsData = [
      { name: 'Frontend Developer', slug: 'frontend-developer', description: 'Phát triển giao diện người dùng cho ứng dụng web' },
      { name: 'Backend Developer', slug: 'backend-developer', description: 'Phát triển logic phía server và API' },
      { name: 'Fullstack Developer', slug: 'fullstack-developer', description: 'Phát triển toàn diện web (frontend + backend)' },
      { name: 'Mobile Developer', slug: 'mobile-developer', description: 'Phát triển ứng dụng di động' },
      { name: 'Data Engineer', slug: 'data-engineer', description: 'Xây dựng hệ thống xử lý và lưu trữ dữ liệu lớn' },
      { name: 'AI/ML Engineer', slug: 'ai-ml-engineer', description: 'Phát triển các mô hình trí tuệ nhân tạo và học máy' },
      { name: 'DevOps Engineer', slug: 'devops-engineer', description: 'Tối ưu hóa quy trình phát triển và triển khai phần mềm' },
      { name: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', description: 'Phân tích và đảm bảo an ninh hệ thống thông tin' },
      { name: 'QA/Testing Engineer', slug: 'qa-testing-engineer', description: 'Đảm bảo chất lượng phần mềm' },
    ];

    for (const d of directionsData) {
      await CareerDirection.findOneAndUpdate({ slug: d.slug }, d, { upsert: true, new: true });
    }
    logger.info(`✅ Tạo/cập nhật ${directionsData.length} hướng nghề nghiệp mẫu`);

    logger.info('🎉 Seeding hoàn tất!');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Lỗi seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
