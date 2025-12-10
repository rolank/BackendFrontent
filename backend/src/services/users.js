import bcrypt from "bcrypt";
import { User } from "../db/models/user.js";
import jwt from "jsonwebtoken";
import js from "@eslint/js";
import { use } from "react";

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
  const userId = await User.findOne({ username: userName })
    .select("_id")
    .exec();
  return userId ? userId._id : null;
}

export async function loginUser(userName, password) {
  const user = await findByUserName(userName);
  const isPasswordValid =
    user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !isPasswordValid) {
    return { ok: false, message: "Invalid username or password" };
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  // Remove passwordHash before returning user object
  const { passwordHash, ...userWithoutPassword } = user.toObject();
  return { ok: true, user: userWithoutPassword, token };
}
