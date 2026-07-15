import serverless from 'serverless-http';
import app from '../backend/index.js';

// Wrap Express app for Vercel Serverless Functions
export default serverless(app);
