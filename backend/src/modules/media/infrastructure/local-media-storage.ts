import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';

const imageTypes = new Map<string, { extension: string; mime: string }>([
  ['image/jpeg', { extension: '.jpg', mime: 'image/jpeg' }],
  ['image/png', { extension: '.png', mime: 'image/png' }],
  ['image/webp', { extension: '.webp', mime: 'image/webp' }],
]);
const videoTypes = new Map<string, { extension: string; mime: string }>([
  ['video/mp4', { extension: '.mp4', mime: 'video/mp4' }],
  ['video/webm', { extension: '.webm', mime: 'video/webm' }],
]);

function matchesSignature(buffer: Buffer, mime: string): boolean {
  if (mime === 'image/jpeg')
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === 'image/png')
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === 'image/webp')
    return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (mime === 'video/webm')
    return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (mime === 'video/mp4') return buffer.toString('ascii', 4, 8) === 'ftyp';
  return false;
}

export class LocalMediaStorage {
  private readonly directory = resolve(process.env.MEDIA_STORAGE_DIR ?? './var/media');

  async save(
    data: Buffer,
    mime: string,
    kind: 'PHOTO' | 'VIDEO',
  ): Promise<{ url: string; mime: string; size: number }> {
    const allowed = kind === 'PHOTO' ? imageTypes : videoTypes;
    const type = allowed.get(mime);
    const maxBytes = kind === 'PHOTO' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (!type || data.length > maxBytes || !matchesSignature(data, mime))
      throw new Error('MEDIA_FILE_INVALID');
    await mkdir(this.directory, { recursive: true });
    const filename = `${randomUUID()}${type.extension}`;
    await writeFile(join(this.directory, filename), data, { flag: 'wx', mode: 0o640 });
    return { url: `/media/${filename}`, mime: type.mime, size: data.length };
  }

  async remove(url: string): Promise<void> {
    const filename = url.startsWith('/media/') ? url.slice('/media/'.length) : '';
    if (!filename || !/^[a-f\d-]+\.(jpg|png|webp|mp4|webm)$/i.test(filename)) return;
    const path = resolve(this.directory, filename);
    if (!path.startsWith(`${this.directory}/`)) return;
    await unlink(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }

  get root(): string {
    return this.directory;
  }
}
