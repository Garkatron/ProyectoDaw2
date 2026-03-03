import { withdb } from '../../databases/mysql.js';
import { q_getEarnings, q_getClosedAppointments } from '../../databases/queries.js';

export const getUserEarnings = async (req, res) => {
  const { userId } = req.params;
  try {
    const earnings = await withdb(async (conn) => await q_getEarnings(conn, userId));
    const appointments = await withdb(async (conn) => await q_getClosedAppointments(conn, userId));
    
    res.status(200).json({ 
      success: true, 
      data: {
        earnings,
        appointments
      }
    });
  } catch (error) {
    console.error('Error getting earnings:', error);
    res.status(500).json({ success: false, message: 'Error getting earnings' });
  }
};