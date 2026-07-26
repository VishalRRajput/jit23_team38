import { Employee } from '../models/Employee.js';
import { Location } from '../models/Location.js';

export const getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { deviceId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ $or: [{ _id: id }, { employeeId: id }] });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const latestLocation = await Location.findOne({ employeeId: employee.employeeId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      employee,
      latestLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, department, designation, email, phone, deviceId, status, avatar } = req.body;

    const existingEmp = await Employee.findOne({ $or: [{ employeeId }, { email }, { deviceId }] });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Email, or Device ID is already assigned to another employee'
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      department,
      designation,
      email,
      phone,
      deviceId,
      status: status || 'Active',
      avatar
    });

    res.status(201).json({ success: true, message: 'Employee added successfully', employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOneAndUpdate(
      { $or: [{ _id: id }, { employeeId: id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOneAndDelete({ $or: [{ _id: id }, { employeeId: id }] });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
