import { q_getTopUsers, q_getUserRankingDetails } from '../databases/queries.js';
import { withdb } from '../databases/mysql.js';

export const getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await withdb(conn => q_getTopUsers(conn, limit));
    
    const rankedUsers = result.map((user, index) => ({
      ...user,
      rank: index + 1,
      member_years: Math.floor((Date.now() - new Date(user.member_since).getTime()) / (1000 * 60 * 60 * 24 * 365))
    }));
    
    res.status(200).json({ success: true, data: rankedUsers });
  } catch (error) {
    console.error('Error getting top users:', error);
    res.status(500).json({ success: false, message: 'Error getting top users' });
  }
};

export const getUserRanking = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await withdb(conn => q_getUserRankingDetails(conn, userId));
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userData = {
      ...result,
      member_years: Math.floor((Date.now() - new Date(result.member_since).getTime()) / (1000 * 60 * 60 * 24 * 365))
    };
    
    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error('Error getting user ranking:', error);
    res.status(500).json({ success: false, message: 'Error getting user ranking' });
  }
};