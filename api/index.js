import serverless from 'serverless-http';
import app from '../backend/index.js';

// Wrap Express app for serverless deployment
export default serverless(app);
