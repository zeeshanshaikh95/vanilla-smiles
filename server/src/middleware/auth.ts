import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AdminUser } from '../models/adminUser.model.js';
import { ApiError } from './errors.js';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    mustChangePassword: boolean;
  };
}

interface TokenPayload {
  sub: string;
}

export async function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Sign in to continue.');
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }

    // Re-read the account so tokens for deleted admins stop working.
    const admin = await AdminUser.findById(payload.sub).lean();
    if (!admin) {
      throw new ApiError(401, 'This account is no longer available.');
    }

    req.admin = {
      id: String(admin._id),
      email: admin.email,
      mustChangePassword: admin.mustChangePassword,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Blocks every admin route except me/password while the bootstrap password is in use. */
export function requirePasswordChanged(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.admin?.mustChangePassword) {
    next(new ApiError(403, 'Choose a new password before using the panel.'));
    return;
  }
  next();
}
