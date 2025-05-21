import { execSync } from 'child_process';
import fs from 'fs';

export const synthesizeSpeech = async (text) => {
  const output = 'zarya_response.wav';
  execSync(`tts --text "${text}" --out_path ${output}`);
  return output;
};
