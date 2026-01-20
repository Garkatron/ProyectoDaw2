import { withdb } from '../../databases/mysql.js';
import { 
  q_addReview, 
  q_getAverageRating, 
  q_getReviews, 
  q_getReviewsByProvider, 
  q_getReviewsByUser, 
  q_getUserByName
} from '../../databases/queries.js';

export const getAllReviews = async (req, res) => {
  try {
    const result = await withdb(conn => q_getReviews(conn));
    res.status(200).json({ 
      success: true, 
      data: result,
      message: result.length === 0 ? "No reviews yet" : undefined
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error getting reviews',
      error: error.message
    });
  }
};

export const getReviewsByUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user ID' });

  try {
    const result = await withdb(conn => q_getReviewsByUser(conn, userId));
    res.status(200).json({ 
      success: true, 
      data: result,
      message: result.length === 0 ? "No reviews for this user" : undefined
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error getting reviews by user',
      error: error.message
    });
  }
};

export const getReviewsByProvider = async  (req, res) => {
  const { providerId } = req.params;

  try {
    const result = await withdb(conn => q_getReviewsByProvider(conn, providerId));
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting reviews by provider' });
  }
};

export const addReview = async  (req, res) => {
  const { content, rating, userId, providerId } = req.body;
  try {
    const result = await withdb(conn => q_addReview(conn, content, rating, userId, providerId));
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding review by user to provider' });
  }
};

export const getAverageRating = async  (req, res) => {
  const { providerId } = req.params;
  try {
    const result = await withdb(conn => q_getAverageRating(conn, providerId));
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting average rating from provider' });
  }
};


export const getReviewsByUsername = async (req, res) => {
    const username = String(req.params.username);

    try {
        const result = await withdb(async (conn) => {
            const user = await q_getUserByName(conn, username);
            if (!user) {
                return null;
            }

            const reviews = await q_getReviewsByUser(conn, user.id);

            return reviews.map(r => ({
                id: r.id,
                reviewer: r.client_name,
                rating: r.rating,
                text: r.content,
                avatarColor: 'bg-indigo-100', 
            }));
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Error fetching reviews by username:', error);
        res.status(500).json({ success: false, message: 'Error getting reviews' });
    }
};