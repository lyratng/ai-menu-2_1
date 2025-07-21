// app/api/generate-menu/route.ts
import { projectUpdate } from 'next/dist/build/swc/generated-native';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // 代理地址：本地 .env.local 可覆盖，未设置就用默认
  //const proxyUrl = process.env.PROXY_URL ?? 'https://deepseek-proxy.fly.dev/proxy';
  //const proxyUrl = process.env.PROXY_URL ?? 'http://localhost:4000/proxy';
  //const proxyUrl = process.env.PROXY_URL ?? 'https://menu-deepseek.fly.dev/api/proxy';
  const proxyUrl = process.env.PROXY_URL ?? 'http://47.239.123.43:4000/proxy';

  try {
    //
    //console.log("🔥 使用的 proxyUrl 是：", process.env.PROXY_URL);
    console.log("🔥 使用的 proxyUrl 是：", proxyUrl); // 而不是 process.env.PROXY_URL
    console.log('📝 发送到 Proxy 的 Prompt：', prompt);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    console.log('📡 Proxy 返回状态码:', response.status);
    const raw = await response.text();
    console.log("🔍 Proxy 返回原始内容:", raw);

    try {
      const result = JSON.parse(raw);
      return NextResponse.json({ text: result.choices?.[0]?.message?.content ?? '⚠️ Proxy 返回内容为空或格式不符合预期' });
    } catch (err) {
      console.error("❌ JSON 解析失败:", err);
      return new Response("Proxy 返回内容不是合法 JSON", { status: 500 });
    }
  } catch (err) {
    console.error('❌ 调用 Proxy 出错:', err);
    return NextResponse.json({ error: '调用 Proxy 失败' }, { status: 500 });
  }
}