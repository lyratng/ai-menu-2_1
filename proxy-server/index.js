// proxy-server/index.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json({ limit: '4mb' }));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.post('/proxy', async (req, res) => {
  const { prompt } = req.body;
  try {
    const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Proxy 调用 Deepseek 出错:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('✅ 本地代理已启动：http://localhost:4000/proxy'));