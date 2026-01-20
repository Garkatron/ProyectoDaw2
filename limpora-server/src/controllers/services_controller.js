import { withdb } from '../databases/mysql.js';
import { q_getServices, q_getServiceById, q_addService, q_deleteService } from '../databases/queries.js';

export const getAllServices = async (req, res) => {
  try {
    // DATABASE
    const result = await withdb(conn =>
      q_getServices(conn)
    );
    //
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error getting services' });
  }
};

export const getServiceById = async (req, res) => {
  const { serviceId } = req.params;
   try {
    // DATABASE
    const result = await withdb(conn =>
      q_getServiceById(conn, serviceId)
    );
    //
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error getting service by id' });
  }
};

export const createService = async (req, res) => {
  const { name } = req.body;
   try {
    // DATABASE
    const result = await withdb(conn =>
      q_addService(conn, name)
    );
    //
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error getting appointments' });
  }
};

// TODO: Check other tables references
export const deleteService = async (req, res) => {
  const { serviceId } = req.params;
   try {
    // DATABASE
    const result = await withdb(conn =>
      q_deleteService(conn, serviceId)
    );
    //
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing service' });
  }
};