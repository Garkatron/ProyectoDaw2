import { withdb } from '../../databases/mysql.js';

export const getUserServices = (req, res) => {
  const { userId } = req.params;

};

export const getUserServiceById = (req, res) => {
  const { userId, serviceId } = req.params;

};

export const addUserService = (req, res) => {
  const { userId } = req.params;
  const data = req.body;

};

export const updateUserService = (req, res) => {
  const { userId, serviceId } = req.params;
  const data = req.body;

};

export const deleteUserService = (req, res) => {
  const { userId, serviceId } = req.params;

};
