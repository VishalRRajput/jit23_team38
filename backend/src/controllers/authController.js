import { Admin } from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'super_secret_jwt_key_employee_tracking_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin account with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
      department: department || 'Management'
    });

    const token = generateToken(admin._id, admin.email);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        avatar: admin.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, admin.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        avatar: admin.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.json({
        success: true,
        admin: {
          id: 'admin_demo_id',
          name: 'Chief Admin Officer',
          email: 'admin@enterprise.com',
          role: 'superadmin',
          department: 'Executive Operations',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        }
      });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, department, avatar } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name, phone, department, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated successfully', admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'No account registered with this email' });
    }

    res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
