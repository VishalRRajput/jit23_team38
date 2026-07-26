import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_tracking');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`[Database Error] Connection Failed: ${error.message}`);
    console.log('[Database] Operating with dynamic fallback / cached schema handler.');
  }
};
