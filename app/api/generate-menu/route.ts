// app/api/generate-menu/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // 代理地址：本地 .env.local 可覆盖，未设置就用默认
  //const proxyUrl = process.env.PROXY_URL ?? 'https://deepseek-proxy.fly.dev/proxy';
  //const proxyUrl = process.env.PROXY_URL ?? 'http://localhost:4000/proxy';
  const proxyUrl = process.env.PROXY_URL ?? 'https://menu-deepseek.fly.dev/api/proxy';

  try {
    console.log('📝 发送到 Proxy 的 Prompt：', prompt);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    console.log('📡 Proxy 返回状态码:', response.status);
    const text = await response.text();  // 获取原始文本
    console.log('📨 Proxy 返回原始内容:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ 返回内容不是合法 JSON:', e);
      return NextResponse.json({ error: 'Proxy 返回非 JSON 内容' }, { status: 500 });
    }

    const reply =
      data.choices?.[0]?.message?.content ??
      '⚠️ Proxy 返回内容为空或格式不符合预期';

    return NextResponse.json({ text: reply });
  } catch (err) {
    console.error('❌ 调用 Proxy 出错:', err);
    return NextResponse.json({ error: '调用 Proxy 失败' }, { status: 500 });
  }
}