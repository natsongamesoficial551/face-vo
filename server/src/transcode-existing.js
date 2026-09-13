import fs from 'fs/promises';
import path from 'path';
import { dataDir, initStorage, mutate } from './storage.js';
import { transcodeForAndroid } from './services/transcode.js';

await initStorage();
await mutate(async db => {
  for (const video of db.videos) {
    if (!video.file) continue;
    const current = path.join(dataDir, video.file);
    const parsed = path.parse(current);
    const backup = path.join(parsed.dir, `${parsed.name}-before-transcode${parsed.ext}`);
    const out = path.join(parsed.dir, `${parsed.name}-android.mp4`);
    await fs.copyFile(current, backup);
    await transcodeForAndroid(current, out);
    await fs.rename(out, current);
    const stat = await fs.stat(current);
    video.sizeBytes = stat.size;
    video.transcodedForAndroid = true;
  }
});
console.log('Transcodificação concluída.');
