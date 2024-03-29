import { Injectable } from '@nestjs/common';
import { constants, PathLike } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';
import { getRandomString } from './randomString';

export interface ICreateImageResolve {
  randomFileName: string;
  file: PathLike;
}

@Injectable()
export class ImageUploader {
  private base64Image: string;
  private imageBuffer: Buffer;

  constructor(base64Image?: string) {
    this.base64Image = base64Image;
  }

  decodeImage() {
    const imageBuffer = Buffer.from(this.base64Image, 'base64');

    this.imageBuffer = imageBuffer;

    return this;
  }

  async removeFile(avatarPath: string) {
    try {
      const filePath = path.resolve('static', avatarPath);

      await fs.access(filePath, constants.F_OK);
      await fs.unlink(filePath);
    } catch (err) {
      console.error('cannot access');
    }

    return this;
  }

  async createFile(): Promise<ICreateImageResolve> {
    const staticFolder = path.resolve('static', 'avatars');
    const randomFileName = getRandomString(6);
    const file = path.resolve(staticFolder, randomFileName + '.webp');

    await sharp(this.imageBuffer).webp().toFile(file);

    return { randomFileName, file };
  }
}
