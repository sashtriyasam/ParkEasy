const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const rateLimit = require('express-rate-limit');

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const parkingRoutes = require('./routes/parking.routes');
const bookingRoutes = require('./routes/booking.routes');
const providerRoutes = require('./routes/provider.routes');
const customerRoutes = require('./routes/customer.routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const setupSwagger = require('./config/swagger'); // Import Swagger
const prisma = require('./config/db');
const { version } = require('../package.json');

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.MOBILE_APP_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Versioned Routes
const apiRoutes = express.Router();
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/parking', parkingRoutes);
apiRoutes.use('/bookings', bookingRoutes);
apiRoutes.use('/provider', providerRoutes);
apiRoutes.use('/customer', customerRoutes);
apiRoutes.use('/payments', paymentRoutes);
apiRoutes.use('/verification', verificationRoutes);

// Mount with and without v1 for maximum stability
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// Global version info
app.get('/api/version', (req, res) => res.status(200).json({ status: 'success', version, environment: process.env.NODE_ENV }));

// Health Check
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (err) {
        dbStatus = 'disconnected';
    }

    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        version,
    });
});

// 404 Handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
