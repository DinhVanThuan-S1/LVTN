/**
 * Seed Data Script — EduPath
 * Tạo dữ liệu mẫu: Career Directions, Roadmaps, Company, Jobs
 * Chạy: node src/scripts/seed-demo-data.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('../modules/skill/skill.model');
const CareerDirection = require('../modules/career-direction/career-direction.model');
const Roadmap = require('../modules/roadmap/roadmap.model');
const CompanyProfile = require('../modules/company/company.model');
const Job = require('../modules/job/job.model');
const User = require('../modules/user/user.model');
const slugify = require('slugify');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupath';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ========== GET EXISTING SKILLS ==========
  const skills = await Skill.find({});
  const skillMap = {};
  skills.forEach((s) => { skillMap[s.name.toLowerCase()] = s._id; });

  const findSkill = (name) => {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(skillMap)) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    return null;
  };

  // ========== CAREER DIRECTIONS ==========
  console.log('📌 Seeding Career Directions...');
  const careerData = [
    {
      name: 'Full-Stack Developer',
      slug: 'full-stack-developer',
      description: 'Phát triển cả frontend và backend, xây dựng ứng dụng web hoàn chỉnh',
      requiredSkills: ['javascript', 'react', 'node.js', 'mongodb', 'html', 'css'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 15000000, max: 40000000 },
    },
    {
      name: 'Frontend Developer',
      slug: 'frontend-developer',
      description: 'Xây dựng giao diện người dùng đẹp, responsive và hiệu năng cao',
      requiredSkills: ['react', 'javascript', 'html', 'css', 'typescript'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 12000000, max: 35000000 },
    },
    {
      name: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Thiết kế và phát triển API, hệ thống server, database và microservices',
      requiredSkills: ['node.js', 'python', 'mongodb', 'postgresql', 'docker'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 15000000, max: 45000000 },
    },
    {
      name: 'Data Scientist',
      slug: 'data-scientist',
      description: 'Phân tích dữ liệu lớn, xây dựng mô hình ML/AI để giải quyết bài toán kinh doanh',
      requiredSkills: ['python', 'machine learning', 'sql', 'tensorflow'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 20000000, max: 60000000 },
    },
    {
      name: 'DevOps Engineer',
      slug: 'devops-engineer',
      description: 'Tự động hóa CI/CD, quản lý hạ tầng cloud và container orchestration',
      requiredSkills: ['docker', 'kubernetes', 'linux', 'aws', 'git'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 20000000, max: 50000000 },
    },
    {
      name: 'Mobile Developer',
      slug: 'mobile-developer',
      description: 'Phát triển ứng dụng iOS/Android native hoặc cross-platform',
      requiredSkills: ['react native', 'javascript', 'flutter', 'swift'].map((s) => ({
        skillId: findSkill(s), importance: 'must_have',
      })).filter((s) => s.skillId),
      averageSalary: { min: 15000000, max: 40000000 },
    },
  ];

  for (const cd of careerData) {
    await CareerDirection.findOneAndUpdate(
      { slug: cd.slug },
      cd,
      { upsert: true, new: true }
    );
  }
  console.log(`   ✅ ${careerData.length} career directions`);

  // Lấy career IDs
  const careers = await CareerDirection.find({});
  const careerMap = {};
  careers.forEach((c) => { careerMap[c.slug] = c._id; });

  // ========== ROADMAPS ==========
  console.log('📌 Seeding Roadmaps...');
  const roadmapData = [
    {
      title: 'Full-Stack Developer với MERN Stack',
      slug: 'fullstack-mern',
      description: 'Lộ trình hoàn chỉnh từ zero đến hero với MongoDB, Express, React, Node.js. Xây dựng ứng dụng web chuyên nghiệp.',
      level: 'beginner',
      careerDirectionId: careerMap['full-stack-developer'],
      isPublished: true,
      phases: [
        {
          title: 'Nền tảng Web',
          description: 'HTML, CSS, JavaScript cơ bản',
          order: 1,
          steps: [
            { title: 'HTML5 & Semantic', description: 'Học cấu trúc HTML5, semantic tags', order: 1, estimatedHours: 8, skillId: findSkill('html') },
            { title: 'CSS3 & Responsive', description: 'Flexbox, Grid, Media queries', order: 2, estimatedHours: 12, skillId: findSkill('css') },
            { title: 'JavaScript ES6+', description: 'let/const, arrow functions, destructuring, async/await', order: 3, estimatedHours: 20, skillId: findSkill('javascript') },
          ],
        },
        {
          title: 'Frontend với React',
          description: 'Xây dựng giao diện với React ecosystem',
          order: 2,
          steps: [
            { title: 'React Components & Hooks', description: 'useState, useEffect, custom hooks', order: 1, estimatedHours: 16, skillId: findSkill('react') },
            { title: 'React Router & State', description: 'Routing, Redux/Context API', order: 2, estimatedHours: 12, skillId: findSkill('react') },
            { title: 'Project: Portfolio Website', description: 'Xây dựng portfolio cá nhân với React', order: 3, estimatedHours: 10 },
          ],
        },
        {
          title: 'Backend với Node.js',
          description: 'API development với Express.js và MongoDB',
          order: 3,
          steps: [
            { title: 'Node.js & Express.js', description: 'REST API, Middleware, Routing', order: 1, estimatedHours: 16, skillId: findSkill('node.js') },
            { title: 'MongoDB & Mongoose', description: 'Schema, CRUD, Aggregation', order: 2, estimatedHours: 12, skillId: findSkill('mongodb') },
            { title: 'Authentication & Security', description: 'JWT, bcrypt, CORS', order: 3, estimatedHours: 8 },
            { title: 'Project: REST API hoàn chỉnh', description: 'Xây dựng API cho blog/e-commerce', order: 4, estimatedHours: 16 },
          ],
        },
        {
          title: 'Full-Stack Integration',
          description: 'Kết hợp frontend + backend + deployment',
          order: 4,
          steps: [
            { title: 'Full-Stack Project', description: 'Xây dựng ứng dụng complete từ đầu đến cuối', order: 1, estimatedHours: 30 },
            { title: 'Testing & Debugging', description: 'Jest, React Testing Library', order: 2, estimatedHours: 8 },
            { title: 'Deployment', description: 'Docker, Vercel, Railway', order: 3, estimatedHours: 6, skillId: findSkill('docker') },
          ],
        },
      ],
    },
    {
      title: 'Frontend React Chuyên sâu',
      slug: 'frontend-react-advanced',
      description: 'Nắm vững React ecosystem: Next.js, TypeScript, Testing, Performance optimization cho frontend developer.',
      level: 'intermediate',
      careerDirectionId: careerMap['frontend-developer'],
      isPublished: true,
      phases: [
        {
          title: 'TypeScript',
          description: 'TypeScript cho React developer',
          order: 1,
          steps: [
            { title: 'TypeScript Basics', description: 'Types, interfaces, generics', order: 1, estimatedHours: 12, skillId: findSkill('typescript') },
            { title: 'React + TypeScript', description: 'Typing components, hooks, events', order: 2, estimatedHours: 10 },
          ],
        },
        {
          title: 'State Management',
          description: 'Quản lý state phức tạp',
          order: 2,
          steps: [
            { title: 'Redux Toolkit', description: 'Slices, thunks, RTK Query', order: 1, estimatedHours: 10 },
            { title: 'Zustand & Jotai', description: 'Lightweight state managers', order: 2, estimatedHours: 6 },
          ],
        },
        {
          title: 'Next.js',
          description: 'Framework React production-ready',
          order: 3,
          steps: [
            { title: 'Next.js App Router', description: 'Server components, layouts, loading', order: 1, estimatedHours: 14 },
            { title: 'SSR/SSG/ISR', description: 'Rendering strategies', order: 2, estimatedHours: 8 },
            { title: 'Project: SaaS Dashboard', description: 'Xây dựng dashboard SaaS với Next.js', order: 3, estimatedHours: 20 },
          ],
        },
      ],
    },
    {
      title: 'Python cho Data Science',
      slug: 'python-data-science',
      description: 'Từ Python cơ bản đến Machine Learning, Data Visualization và AI Applications.',
      level: 'beginner',
      careerDirectionId: careerMap['data-scientist'],
      isPublished: true,
      phases: [
        {
          title: 'Python Fundamentals',
          order: 1,
          steps: [
            { title: 'Python cơ bản', description: 'Syntax, data types, OOP', order: 1, estimatedHours: 16, skillId: findSkill('python') },
            { title: 'NumPy & Pandas', description: 'Data manipulation và analysis', order: 2, estimatedHours: 14 },
          ],
        },
        {
          title: 'Data Visualization',
          order: 2,
          steps: [
            { title: 'Matplotlib & Seaborn', description: 'Biểu đồ và đồ thị', order: 1, estimatedHours: 10 },
            { title: 'Data Storytelling', description: 'Truyền đạt insights qua data', order: 2, estimatedHours: 6 },
          ],
        },
        {
          title: 'Machine Learning',
          order: 3,
          steps: [
            { title: 'Scikit-learn Basics', description: 'Classification, Regression', order: 1, estimatedHours: 16, skillId: findSkill('machine learning') },
            { title: 'Deep Learning Intro', description: 'Neural Networks, TensorFlow', order: 2, estimatedHours: 20, skillId: findSkill('tensorflow') },
            { title: 'Project: Prediction Model', description: 'Xây dựng model dự đoán thực tế', order: 3, estimatedHours: 16 },
          ],
        },
      ],
    },
    {
      title: 'DevOps & Cloud Engineering',
      slug: 'devops-cloud',
      description: 'CI/CD, Container, Kubernetes, AWS/GCP — trở thành DevOps Engineer chuyên nghiệp.',
      level: 'intermediate',
      careerDirectionId: careerMap['devops-engineer'],
      isPublished: true,
      phases: [
        {
          title: 'Linux & Scripting',
          order: 1,
          steps: [
            { title: 'Linux Administration', description: 'Commands, permissions, services', order: 1, estimatedHours: 14, skillId: findSkill('linux') },
            { title: 'Bash Scripting', description: 'Shell automation', order: 2, estimatedHours: 8 },
          ],
        },
        {
          title: 'Containers & Orchestration',
          order: 2,
          steps: [
            { title: 'Docker Mastery', description: 'Dockerfile, Compose, Networks', order: 1, estimatedHours: 14, skillId: findSkill('docker') },
            { title: 'Kubernetes', description: 'Pods, Services, Deployments', order: 2, estimatedHours: 20, skillId: findSkill('kubernetes') },
          ],
        },
        {
          title: 'CI/CD & Cloud',
          order: 3,
          steps: [
            { title: 'GitHub Actions / Jenkins', description: 'Pipeline automation', order: 1, estimatedHours: 10, skillId: findSkill('git') },
            { title: 'AWS/GCP Fundamentals', description: 'EC2, S3, RDS, CloudFormation', order: 2, estimatedHours: 16, skillId: findSkill('aws') },
          ],
        },
      ],
    },
  ];

  for (const rm of roadmapData) {
    await Roadmap.findOneAndUpdate(
      { slug: rm.slug },
      rm,
      { upsert: true, new: true }
    );
  }
  console.log(`   ✅ ${roadmapData.length} roadmaps`);

  // ========== COMPANY PROFILE ==========
  console.log('📌 Seeding Company Profile...');
  const recruiter = await User.findOne({ email: 'recruiter1@company.vn' });
  if (recruiter) {
    await CompanyProfile.findOneAndUpdate(
      { userId: recruiter._id },
      {
        userId: recruiter._id,
        companyName: 'TechViet Solutions',
        industry: 'Công nghệ thông tin',
        companySize: '50-200',
        description: 'Công ty phần mềm hàng đầu Việt Nam chuyên về giải pháp AI và Cloud Computing. Chúng tôi tìm kiếm những tài năng trẻ đam mê công nghệ.',
        website: 'https://techviet.com.vn',
        contactEmail: 'hr@techviet.com.vn',
        contactPhone: '028-1234-5678',
        taxCode: '0123456789',
        addresses: [{
          label: 'Trụ sở chính',
          street: '123 Nguyễn Huệ',
          district: 'Quận 1',
          city: 'TP. Hồ Chí Minh',
        }],
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Company profile created');

    // ========== JOBS ==========
    console.log('📌 Seeding Jobs...');
    const company = await CompanyProfile.findOne({ userId: recruiter._id });

    const jobData = [
      {
        recruiterId: recruiter._id,
        companyId: company?._id,
        title: 'Senior React Developer',
        slug: 'senior-react-developer',
        description: 'Tuyển Senior React Developer cho dự án SaaS platform. Yêu cầu 3+ năm kinh nghiệm React, TypeScript, hiểu biết sâu về performance optimization.',
        requirements: '- 3+ năm kinh nghiệm React/Next.js\n- TypeScript thành thạo\n- Hiểu RESTful API & GraphQL\n- Kinh nghiệm CI/CD là lợi thế',
        benefits: '- Lương 25-40 triệu\n- Review salary 2 lần/năm\n- 14 ngày phép\n- Bảo hiểm sức khỏe premium',
        jobType: 'full_time',
        experienceLevel: 'senior',
        location: { city: 'TP. Hồ Chí Minh', district: 'Quận 1', isRemote: false },
        salary: { min: 25000000, max: 40000000, currency: 'VND' },
        positions: 2,
        requiredSkills: ['react', 'typescript', 'javascript', 'node.js'].map((s) => ({
          skillId: findSkill(s), level: 'advanced',
        })).filter((s) => s.skillId),
        careerDirectionId: careerMap['frontend-developer'],
        status: 'published',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter._id,
        companyId: company?._id,
        title: 'Junior Backend Developer (Node.js)',
        slug: 'junior-backend-nodejs',
        description: 'Tuyển Junior Backend Developer, fresher welcome! Được mentoring bởi tech lead với 10+ năm kinh nghiệm.',
        requirements: '- Hiểu căn bản Node.js/Express\n- Biết SQL hoặc MongoDB\n- Có kiến thức Git\n- Tiếng Anh đọc hiểu tài liệu',
        benefits: '- Lương 10-18 triệu\n- Đào tạo on-the-job\n- Môi trường startup năng động\n- Happy Friday hàng tuần',
        jobType: 'full_time',
        experienceLevel: 'fresher',
        location: { city: 'TP. Hồ Chí Minh', district: 'Quận 7', isRemote: false },
        salary: { min: 10000000, max: 18000000, currency: 'VND' },
        positions: 3,
        requiredSkills: ['node.js', 'mongodb', 'git'].map((s) => ({
          skillId: findSkill(s), level: 'beginner',
        })).filter((s) => s.skillId),
        careerDirectionId: careerMap['backend-developer'],
        status: 'published',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter._id,
        companyId: company?._id,
        title: 'Full-Stack Developer (Remote)',
        slug: 'fullstack-remote',
        description: 'Tham gia team phát triển sản phẩm EdTech platform. 100% remote, flexible hours.',
        requirements: '- 2+ năm kinh nghiệm Full-Stack\n- React + Node.js\n- Hiểu Git Flow\n- Kỹ năng communicate tốt',
        benefits: '- Lương 20-35 triệu\n- Làm việc remote 100%\n- Laptop + setup budget\n- ESOP program',
        jobType: 'remote',
        experienceLevel: 'middle',
        location: { city: 'Remote', isRemote: true },
        salary: { min: 20000000, max: 35000000, currency: 'VND' },
        positions: 1,
        requiredSkills: ['react', 'node.js', 'mongodb', 'git'].map((s) => ({
          skillId: findSkill(s), level: 'intermediate',
        })).filter((s) => s.skillId),
        careerDirectionId: careerMap['full-stack-developer'],
        status: 'published',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter._id,
        companyId: company?._id,
        title: 'Intern - Data Analyst',
        slug: 'intern-data-analyst',
        description: 'Thực tập Data Analyst 3-6 tháng. Được training Python, SQL và Data Visualization.',
        requirements: '- Sinh viên năm 3-4 ngành CNTT\n- Biết Python cơ bản\n- Ham học hỏi, chăm chỉ',
        benefits: '- Trợ cấp 5-8 triệu\n- Mentor 1-1\n- Cơ hội chuyển chính thức\n- Giờ giấc linh hoạt',
        jobType: 'internship',
        experienceLevel: 'intern',
        location: { city: 'TP. Hồ Chí Minh', district: 'Quận 3', isRemote: false },
        salary: { min: 5000000, max: 8000000, currency: 'VND' },
        positions: 2,
        requiredSkills: ['python', 'sql'].map((s) => ({
          skillId: findSkill(s), level: 'beginner',
        })).filter((s) => s.skillId),
        careerDirectionId: careerMap['data-scientist'],
        status: 'published',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter._id,
        companyId: company?._id,
        title: 'DevOps Engineer',
        slug: 'devops-engineer-job',
        description: 'Tuyển DevOps Engineer quản lý hạ tầng AWS, CI/CD pipelines và container orchestration.',
        requirements: '- 2+ năm kinh nghiệm DevOps\n- Docker, Kubernetes\n- AWS (EC2, ECS, RDS, S3)\n- Terraform/CloudFormation',
        benefits: '- Lương 25-45 triệu\n- AWS certification budget\n- 16 ngày phép\n- Team building hàng quý',
        jobType: 'full_time',
        experienceLevel: 'middle',
        location: { city: 'Hà Nội', district: 'Cầu Giấy', isRemote: false },
        salary: { min: 25000000, max: 45000000, currency: 'VND' },
        positions: 1,
        requiredSkills: ['docker', 'kubernetes', 'aws', 'linux'].map((s) => ({
          skillId: findSkill(s), level: 'intermediate',
        })).filter((s) => s.skillId),
        careerDirectionId: careerMap['devops-engineer'],
        status: 'published',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const job of jobData) {
      await Job.findOneAndUpdate(
        { slug: job.slug },
        job,
        { upsert: true, new: true }
      );
    }
    console.log(`   ✅ ${jobData.length} jobs published`);
  } else {
    console.log('   ⚠️ Recruiter not found, skipping jobs');
  }

  console.log('\n🎉 Seed completed!\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
