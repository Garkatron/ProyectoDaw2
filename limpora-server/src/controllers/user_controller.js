import { withdb } from "../databases/mysql.js";
import { q_getUserById, q_getUserByName, q_getUserByUid, q_getUsers } from "../databases/queries.js";

export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id || id === 'undefined') {
    return res.status(400).json({ success: false, message: 'Valid user ID is required' });
  }
  try {
    const result = await withdb(conn => q_getUserById(conn, id));
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ success: false, message: 'Error getting user', error: error.message });
  }
};

export const getUserByUid = async (req, res) => {
  const { uid } = req.params;
  if (!uid || uid === 'undefined') {
    return res.status(400).json({ success: false, message: 'Valid user UID is required' });
  }
  try {
    const result = await withdb(conn => q_getUserByUid(conn, uid));
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user by UID:', error);
    res.status(500).json({ success: false, message: 'Error getting user', error: error.message });
  }
};

export const getUserByName = async (req, res) => {
  const { name } = req.params;
  if (!name || name === 'undefined') {
    return res.status(400).json({ success: false, message: 'Valid user name is required' });
  }
  try {
    const result = await withdb(conn => q_getUserByName(conn, name));
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user by name:', error);
    res.status(500).json({ success: false, message: 'Error getting user', error: error.message });
  }
};


export const getUsers = async (req, res) => {

  try {
    const result = await withdb(conn => q_getUsers(conn));
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user by name:', error);
    res.status(500).json({ success: false, message: 'Error getting user', error: error.message });
  }
};