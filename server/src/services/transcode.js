import { spawn } from 'child_process';
import bundledFfmpegPath from 'ffmpeg-static';
import { config } from '../config.js';

export const ffmpegPath = config.ffmpegPath || bundledFfmpegPath || 'ffmpeg';

export function transcodeForAndroid(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-map', '0:v:0',
      '-map', '0:a:0?',
      '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1',
      '-c:v', 'libx264',
      '-profile:v', 'baseline',
      '-level', '3.1',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      '-crf', '24',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-ac', '2',
      '-shortest',
      outputPath
    ];
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`Não consegui converter este vídeo para Android. Detalhe técnico: ffmpeg saiu com código ${code}. ${stderr.slice(-700)}`));
    });
  });
}
