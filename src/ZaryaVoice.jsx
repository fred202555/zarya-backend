import React, { useState, useRef } from 'react';

export default function ZaryaVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const BASE_URL = 'https://zarya-backend.onrender.com';

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      try {
        const res = await fetch(`${BASE_URL}/transcribe`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        setTranscript(data.transcript);
        getZaryaResponse(data.transcript);
      } catch (error) {
        console.error('Erreur transcription :', error);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
    }, 5000);
  };

  const getZaryaResponse = async (text) => {
    try {
      const res = await fetch(`${BASE_URL}/zarya`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      setResponse(data.response);
      speak(data.response);
    } catch (error) {
      console.error('Erreur Zarya :', error);
    }
  };

  const speak = async (text) => {
    const res = await fetch(`${BASE_URL}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div style={{ textAlign: 'center', padding: 30 }}>
      <h2>ZARYA – Assistant Vocal</h2>
      <button onClick={startRecording} disabled={isRecording}>
        🎤 {isRecording ? 'Enregistrement...' : 'Parler à Zarya'}
      </button>
      <p><strong>Tu as dit :</strong> {transcript}</p>
      <p><strong>Zarya répond :</strong> {response}</p>
    </div>
  );
}
