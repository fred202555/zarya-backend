import { execSync } from 'child_process';
import fs from 'fs';

export const transcribeAudio = (filePath) => {
  const output = 'output.txt';
  execSync(`whisper ${filePath} --model base --output_format txt --output_dir .`);
  const transcript = fs.readFileSync(output, 'utf8');
  fs.unlinkSync(filePath);
  return transcript;
};