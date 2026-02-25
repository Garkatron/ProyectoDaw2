import { q_addAppointmentToUser, q_getAppointmentsByUser } from "../../databases/queries.js";
import { APP_COMISSION } from '../../constants.js';
import { withdb } from '../../databases/mysql.js';
import { sendEmailNotificationAppoinment } from "../../helpers/email_verification.js";

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

    // TODO: await sendEmailNotificationAppoinment()
    
    // DATABASE
    const result = await withdb(conn =>
      q_addAppointmentToUser(
        conn,
        d,
        price,
        APP_COMISSION,
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
