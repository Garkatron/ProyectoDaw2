import { withdb } from '../../databases/mysql.js';
import { q_getEarnings } from '../../databases/queries.js';

export const getUserEarnings = (req, res) => {
  const { userId } = req.params;
  try {
    const result = withdb(conn => q_getEarnings(conn, userId));
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting earnings' });
  }
};
