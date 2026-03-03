import { withdb } from '../../databases/mysql.js';
import {
  q_addReview,
  q_getAverageRating,
  q_getReviews,
  q_getReviewsByReviewed,
  q_getReviewsByReviewer,
  q_getUserByName,
  q_getUserByUid
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

export const getReviewsByReviewer = async (req, res) => {
  const reviewerId = Number(req.params.reviewerId);
  if (isNaN(reviewerId)) return res.status(400).json({ success: false, message: 'Invalid user ID' });

  try {
    const result = await withdb(conn => q_getReviewsByReviewer(conn, reviewerId));
    res.status(200).json({
      success: true,
      data: result,
      message: result.length === 0 ? "No reviews for this user" : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting reviews by reviewer',
      error: error.message
    });
  }
};

export const getReviewsByReviewed = async (req, res) => {
  const reviewedId = Number(req.params.reviewedId);
  if (isNaN(reviewedId)) return res.status(400).json({ success: false, message: 'Invalid reviewed ID' });

  try {
    const result = await withdb(conn => q_getReviewsByReviewed(conn, reviewedId));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting reviews by reviewed user' });
  }
};

export const addReview = async (req, res) => {
  const reviewerUid = req.user.uid;
  const { content, rating, reviewedId } = req.body;

  try {
    const userRecord = await withdb(conn => q_getUserByUid(conn, reviewerUid));
    if (!userRecord) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await withdb(conn => q_addReview(conn, content, rating, userRecord.id, reviewedId));
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: 'Ya has dejado una reseña a este usuario.' 
      });
    }
    res.status(500).json({ success: false, message: 'Error adding review' });
  }
};

export const getAverageRating = async (req, res) => {
  const reviewedId = Number(req.params.reviewedId);
  if (isNaN(reviewedId)) return res.status(400).json({ success: false, message: 'Invalid reviewed ID' });

  try {
    const result = await withdb(conn => q_getAverageRating(conn, reviewedId));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting average rating' });
  }
};

export const getReviewsByUsername = async (req, res) => {
  const username = String(req.params.username);

  try {
    const result = await withdb(async (conn) => {
      const user = await q_getUserByName(conn, username);
      if (!user) return null;

      const reviews = await q_getReviewsByReviewer(conn, user.id);

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