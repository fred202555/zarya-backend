import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { transcribeAudio } from './whisper.js';
import { generateResponse } from './zarya_openai.js';
import { synthesizeSpeech } from './tts.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const text = await transcribeAudio(req.file.path);
    res.json({ transcript: text });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur transcription');
  }
});

app.post('/zarya', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const reply = await generateResponse(prompt);
    res.json({ response: reply });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Zarya');
  }
});

app.post('/speak', async (req, res) => {
  try {
    const filePath = await synthesizeSpeech(req.body.text);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur TTS');
  }
});

app.listen(port, () => {
  console.log(`✅ Zarya backend live on port ${port}`);
});