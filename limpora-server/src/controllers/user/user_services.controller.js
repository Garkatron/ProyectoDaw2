import { withdb } from '../../databases/mysql.js';
import {
  q_getUserServices,
  q_getUserServiceById,
  q_addUserService,
  q_updateUserService,
  q_deleteUserService,
  q_userServiceExists
} from '../../databases/queries.js';


export const getUserServices = async (req, res) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID' 
    });
  }

  try {
    const services = await withdb(conn => q_getUserServices(conn, userId));
    
    res.status(200).json({ 
      success: true, 
      data: services,
      message: services.length === 0 ? 'User has no services yet' : undefined
    });
  } catch (error) {
    console.error('getUserServices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting user services',
      error: error.message
    });
  }
};


export const getUserServiceById = async (req, res) => {
  const userId = Number(req.params.userId);
  const serviceId = Number(req.params.serviceId);

  if (isNaN(userId) || isNaN(serviceId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID or service ID' 
    });
  }

  try {
    const service = await withdb(conn => 
      q_getUserServiceById(conn, userId, serviceId)
    );

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found for this user' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: service 
    });
  } catch (error) {
    console.error('getUserServiceById error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting user service',
      error: error.message
    });
  }
};


export const addUserService = async (req, res) => {
  const userId = Number(req.params.userId);
  const { service_id, price, is_active = true } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID' 
    });
  }

  if (!service_id || !price) {
    return res.status(400).json({ 
      success: false, 
      message: 'service_id and price are required' 
    });
  }

  const serviceId = Number(service_id);
  const servicePrice = Number(price);

  if (isNaN(serviceId) || isNaN(servicePrice) || servicePrice < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid service_id or price' 
    });
  }

  try {
    const exists = await withdb(conn => 
      q_userServiceExists(conn, userId, serviceId)
    );

    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already offers this service' 
      });
    }

    await withdb(conn => 
      q_addUserService(conn, userId, serviceId, servicePrice, is_active)
    );

    const newService = await withdb(conn => 
      q_getUserServiceById(conn, userId, serviceId)
    );

    res.status(201).json({ 
      success: true, 
      data: newService,
      message: 'Service added successfully' 
    });
  } catch (error) {
    console.error('addUserService error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding user service',
      error: error.message
    });
  }
};


export const updateUserService = async (req, res) => {
  const userId = Number(req.params.userId);
  const serviceId = Number(req.params.serviceId);
  const data = req.body;

  if (isNaN(userId) || isNaN(serviceId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID or service ID' 
    });
  }

  if (!data.price && data.is_active === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: 'At least one field (price or is_active) is required' 
    });
  }

  if (data.price !== undefined) {
    const price = Number(data.price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid price value' 
      });
    }
    data.price = price;
  }

  try {
    const exists = await withdb(conn => 
      q_userServiceExists(conn, userId, serviceId)
    );

    if (!exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found for this user' 
      });
    }

    await withdb(conn => 
      q_updateUserService(conn, userId, serviceId, data)
    );

    const updatedService = await withdb(conn => 
      q_getUserServiceById(conn, userId, serviceId)
    );

    res.status(200).json({ 
      success: true, 
      data: updatedService,
      message: 'Service updated successfully' 
    });
  } catch (error) {
    console.error('updateUserService error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user service',
      error: error.message
    });
  }
};


export const deleteUserService = async (req, res) => {
  const userId = Number(req.params.userId);
  const serviceId = Number(req.params.serviceId);

  if (isNaN(userId) || isNaN(serviceId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID or service ID' 
    });
  }

  try {
    const result = await withdb(conn => 
      q_deleteUserService(conn, userId, serviceId)
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found for this user' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Service deleted successfully',
      data: { userId, serviceId }
    });
  } catch (error) {
    console.error('deleteUserService error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user service',
      error: error.message
    });
  }
};