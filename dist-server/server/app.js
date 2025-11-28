import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
// Import Routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import letterRoutes from './routes/letters';
import subscriptionRoutes from './routes/subscriptions';
import aiRoutes from './routes/ai';
import webhookRoutes from './routes/webhook';
import rateLimit from 'express-rate-limit';
const app = express();
// Rate Limiter for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate Limiter for AI
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many AI requests from this IP, please try again after 1 minute',
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
}));
app.use(morgan('dev'));
import { profiler } from './middleware/profiler';
app.use(profiler);
// Webhook route must be before express.json() to get raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);
app.use(express.json());
app.use(cookieParser());
// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
import { MonitorService } from './services/monitor-service';
// Monitoring Middleware
app.use((req, res, next) => {
    MonitorService.recordRequest();
    next();
});
// Health Check & Metrics
import { HealthController } from './controllers/health-controller';
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV,
        metrics: MonitorService.getMetrics()
    });
});
app.get('/api/health/deep', HealthController.deepCheck);
// Serve static files in production
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../../dist')));
    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
}
// Global Error Handler
app.use(errorHandler);
app.use(errorHandler);
export { app };
