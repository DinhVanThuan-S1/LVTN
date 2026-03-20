/**
 * Express Application Setup
 * Cấu hình Express app với tất cả middleware và routes
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Middleware
const { publicLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const publicRoutes = require('./modules/public/public.routes');
const academicProfileRoutes = require('./modules/academic-profile/academic-profile.routes');
const careerPreferenceRoutes = require('./modules/career-preference/career-preference.routes');
const roadmapRoutes = require('./modules/roadmap/roadmap.routes');
const personalRoadmapRoutes = require('./modules/personal-roadmap/personal-roadmap.routes');
const jobRoutes = require('./modules/job/job.routes');
const cvRoutes = require('./modules/cv/cv.routes');
const companyRoutes = require('./modules/company/company.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const chatRoutes = require('./modules/chat/chat.routes');

const app = express();

// ========== SECURITY ==========
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ========== BODY PARSING ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ========== RATE LIMITING ==========
app.use('/api/', publicLimiter);

// ========== LOGGING ==========
app.use(requestLogger);

// ========== API ROUTES ==========
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/academic-profile', academicProfileRoutes);
app.use('/api/v1/career-preferences', careerPreferenceRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);
app.use('/api/v1/my-roadmaps', personalRoadmapRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/cvs', cvRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduPath API đang hoạt động',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ========== 404 HANDLER ==========
app.use((req, res, next) => {
  next(ApiError.notFound(`Không tìm thấy route: ${req.method} ${req.originalUrl}`));
});

// ========== ERROR HANDLER ==========
app.use(errorHandler);

module.exports = app;
