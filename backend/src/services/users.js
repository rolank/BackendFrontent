import bcrypt from 'bcrypt';    
import { User } from '../db/models/user.js';

export async function createUser({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash: hashedPassword });
  return user.save();
}

export function findUserByEmail(email) {
  return User.findOne({ email }).exec();
}

export function findByUserName(username) {  
  return User.findOne({ username }).exec();
}

export async function validatePassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return false;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : false;
}

export async function deleteUser(username) {
  return User.deleteOne({ username: username });
} 

export async function findUserId(userName) { 
  const userId = await User.findOne({ username: userName }).select("_id").exec();
  return userId ? userId._id : null;
} 