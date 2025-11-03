import express from 'express';
import { getBotResponse } from '../bot/index.js';

const app = express();
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const response = getBotResponse(message);
  res.json({ response });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI Chatbot API running on port ${PORT}`);
});
