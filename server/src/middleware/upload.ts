import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config } from '../config/env.js';
import { ApiError } from './errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
export const UPLOAD_TYPES_LABEL = 'JPG, PNG, WebP or AVIF';
export const MAX_UPLOAD_MB = Math.round(config.upload.maxBytes / (1024 * 1024));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

export const handleImageUpload = multer({
  storage,
  limits: { fileSize: config.upload.maxBytes, files: config.upload.maxFiles },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new ApiError(400, `Only ${UPLOAD_TYPES_LABEL} images can be uploaded.`));
      return;
    }
    cb(null, true);
  },
}).array('images', config.upload.maxFiles);

export function uploadsUrlFor(filename: string): string {
  return `${config.uploadsUrlPrefix}/${filename}`;
}
