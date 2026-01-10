import { q_addAppointmentToUser, q_getAppointmentsByUser } from "../../databases/queries";
import { APP_COMISSION } from '../../constants';
import { withdb } from '../../databases/mysql.js';

export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    // DATABASE
    const result = await withdb(conn =>
      q_getAppointmentsByUser(conn, userId)
    );
    //
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error getting appointments' });
  }

};

export const addUserAppointment = async (req, res) => {
  try {
    const { date, clientId, serviceId, providerId, price, paymentMethod, totalAmount } = req.body;

    const d = new Date(date);
    
    // DATABASE
    const result = await withdb(conn =>
      q_addAppointmentToUser(
        conn,
        d,
        price,
        APP_COMMISSION,
        totalAmount,
        paymentMethod,
        clientId,
        providerId,
        serviceId
      )
    );
    //
    
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating the appoitment' });
  }
};
