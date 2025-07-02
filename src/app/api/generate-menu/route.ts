// /app/api/generate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  console.log('📡 Deepseek API 返回状态码:', response.status);

  const data = await response.json();

  console.log('📦 Deepseek API 返回内容:', data);

  const reply = data.choices?.[0]?.message?.content ?? '⚠️ Deepseek 返回内容为空或格式不符合预期';

  return NextResponse.json({ text: reply });
}