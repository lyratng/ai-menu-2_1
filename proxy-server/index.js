// 避免重复声明 express（清理缓存或重新部署时可能发生）
// proxy-server/index.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
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
    const text = await r.text();
    console.log('🔵 Deepseek 返回原始内容:', text);

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (err) {
      console.error('❌ JSON 解析失败:', err.message);
      res.status(500).json({ error: 'Proxy 收到非 JSON 内容', raw: text });
    }
  } catch (err) {
    console.error('❌ Proxy 调用 Deepseek 出错:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('✅ 本地代理已启动：http://localhost:4000/proxy'));