import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Import cors

import config from './config/index.js'; // Ensure this path is correct
import { notFound, errorHandler } from './middleware/error.middleware.js';

// Import route handlers
import authRoutes from './features/auth/auth.routes.js';
import userProfileRoutes from './features/userProfile/userProfile.routes.js';
import userStatusRoutes from './features/userStatus/userStatus.routes.js';
import mealPlanRoutes from './features/mealPlans/mealPlan.routes.js';
import waterIntakeRoutes from './features/waterIntake/waterIntake.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // For development, allow any origin or specific ones like Vite's default port
    // For production, you'd use config.frontendUrl
    const allowedOrigins = config.nodeEnv === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173'] // Vite default port
      : [/* config.frontendUrl */]; // Add your production frontend URL here
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes); // Basic user profile (name, email)
app.use('/api/profile/status', userStatusRoutes); // Diet/physical status
app.use('/api/profile/meal-plans', mealPlanRoutes); // User-specific meal plans
app.use('/api/profile/water-intake', waterIntakeRoutes); // User-specific water intake


// Serve frontend in production
if (config.nodeEnv === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.send('API Server is ready'));
}

app.use(notFound);
app.use(errorHandler);

export default app;