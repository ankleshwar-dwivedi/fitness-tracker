import app from './app.js';
import connectDB from './config/db.js';
import config from './config/index.js'; // Corrected import path

connectDB().then(() => {
  app.listen(config.port, () => 
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`)
  );
}).catch(err => {
  console.error("Failed to connect to DB", err);
  process.exit(1);
});

export default app; // For Vercel or serverless deployments