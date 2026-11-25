import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AdminUser } from '../models/adminUser.model.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { changePasswordSchema, loginSchema } from '../validation/schemas.js';

function issueToken(adminId: string): string {
  return jwt.sign({ sub: adminId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = loginSchema.parse(req.body ?? {});

  const admin = await AdminUser.findOne({ email });
  // Constant-ish response for unknown users and wrong passwords.
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    throw new ApiError(401, 'Those details do not match an admin account.');
  }

  res.json({
    token: issueToken(String(admin._id)),
    admin: {
      id: String(admin._id),
      email: admin.email,
      mustChangePassword: admin.mustChangePassword,
    },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.admin) throw new ApiError(401, 'Sign in to continue.');
  res.json({ admin: req.admin });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.admin) throw new ApiError(401, 'Sign in to continue.');
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body ?? {});

  const admin = await AdminUser.findById(req.admin.id);
  if (!admin) throw new ApiError(401, 'This account is no longer available.');

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw new ApiError(400, 'Your current password is not correct.');

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.mustChangePassword = false;
  await admin.save();

  res.json({
    ok: true,
    admin: { id: String(admin._id), email: admin.email, mustChangePassword: false },
  });
});
