import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Request, Response } from 'express';
import multer from 'multer';
import { config } from '../../config/env';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest } from '../../utils/errors';

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const dogImageDir = path.resolve(config.UPLOAD_DIR, 'dog-images');

export const dogImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG or WebP images are allowed.'));
      return;
    }

    callback(null, true);
  },
});

type ImageType = {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: '.jpg' | '.png' | '.webp';
};

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function detectImageType(buffer: Buffer): ImageType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { contentType: 'image/jpeg', extension: '.jpg' };
  }

  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature)) {
    return { contentType: 'image/png', extension: '.png' };
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { contentType: 'image/webp', extension: '.webp' };
  }

  return null;
}

function stripJpegMetadata(buffer: Buffer) {
  if (buffer.length < 4) return buffer;

  const chunks: Buffer[] = [buffer.subarray(0, 2)];
  let offset = 2;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) return buffer;

    const marker = buffer[offset + 1];
    if (marker === 0xda) {
      chunks.push(buffer.subarray(offset));
      return Buffer.concat(chunks);
    }

    if (marker === 0xd9) {
      chunks.push(buffer.subarray(offset, offset + 2));
      return Buffer.concat(chunks);
    }

    const length = buffer.readUInt16BE(offset + 2);
    const nextOffset = offset + 2 + length;
    if (length < 2 || nextOffset > buffer.length) return buffer;

    const isAppSegment = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;
    if (!isAppSegment && !isComment) {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;
  }

  return buffer;
}

function stripPngMetadata(buffer: Buffer) {
  if (buffer.length < 12 || !buffer.subarray(0, 8).equals(pngSignature)) return buffer;

  const chunks: Buffer[] = [buffer.subarray(0, 8)];
  const removableChunks = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt']);
  let offset = 8;

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const nextOffset = offset + 12 + length;
    if (nextOffset > buffer.length) return buffer;

    if (!removableChunks.has(type)) {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;
    if (type === 'IEND') break;
  }

  return Buffer.concat(chunks);
}

function stripWebpMetadata(buffer: Buffer) {
  if (buffer.length < 12) return buffer;

  const chunks: Buffer[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const paddedSize = chunkSize + (chunkSize % 2);
    const nextOffset = offset + 8 + paddedSize;
    if (nextOffset > buffer.length) return buffer;

    if (chunkType !== 'EXIF' && chunkType !== 'XMP ') {
      const chunk = Buffer.from(buffer.subarray(offset, nextOffset));
      if (chunkType === 'VP8X' && chunkSize > 0) {
        chunk[8] = chunk[8] & ~0x0c;
      }
      chunks.push(chunk);
    }

    offset = nextOffset;
  }

  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(body.length + 4, 4);
  header.write('WEBP', 8, 'ascii');
  return Buffer.concat([header, body]);
}

export function stripImageMetadata(buffer: Buffer, type: ImageType) {
  if (type.contentType === 'image/jpeg') return stripJpegMetadata(buffer);
  if (type.contentType === 'image/png') return stripPngMetadata(buffer);
  if (type.contentType === 'image/webp') return stripWebpMetadata(buffer);
  return buffer;
}

export const uploadDogImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw badRequest('Image file is required.');
  }

  const detectedType = detectImageType(req.file.buffer);
  if (!detectedType) {
    throw badRequest('Invalid image content.');
  }

  if (detectedType.contentType !== req.file.mimetype) {
    throw badRequest('Image content does not match the declared file type.');
  }

  await fs.mkdir(dogImageDir, { recursive: true });
  const sanitizedBuffer = stripImageMetadata(req.file.buffer, detectedType);
  const fileName = `${randomUUID()}${detectedType.extension}`;
  const storagePath = path.join(dogImageDir, fileName);
  await fs.writeFile(storagePath, sanitizedBuffer, { flag: 'wx' });

  const relativePath = `/uploads/dog-images/${fileName}`;
  res.status(201).json({
    fileName,
    storageKey: `dog-images/${fileName}`,
    publicUrl: `${config.publicApiUrl}${relativePath}`,
    contentType: detectedType.contentType,
    size: sanitizedBuffer.length,
  });
});
