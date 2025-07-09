'use client';

const tagToPromptMap: { [key: string]: string } = {
  "不辣": "不要出现辣菜",
  "微辣": "微辣，辣菜占比10-20%",
  "中辣": "中辣，辣菜占比20-30%",
  "正常": "甜味菜占比10-20%",
  "偏甜": "甜味菜占比20-30%",
  "自助餐": "自助餐",
  "定价餐": "定价餐",
  "紧缺": "厨师人手紧缺，需要减少整体刀工复杂度，复杂刀工菜不超过两道",
  "适中": "厨师人手适中，可以出10%-20%复杂刀工菜品以体现技术",
  "宽裕": "厨师人手宽裕，可以出20%-35%复杂刀工菜品以体现技术",
  "需要": "需要限制成本，避免出现昂贵食材，减少牛羊肉等使用，增加比如肉丸这样低成本但有分量的菜",
  "无需，正常成本": "成本适中",
  "无需，允许出现高成本菜品": "成本中等偏上，可以出现适量高端食材以体现餐食质量和档次",
  "蒸屉": "蒸屉紧缺，需要蒸的菜不超过一道",
  "烤箱": "烤箱紧缺，需要烘烤的菜不超过一道",
  "炒锅": "炒锅紧缺，炒菜不超过4道",
  "炖锅": "炖锅紧缺，需要炖的菜不超过一道",
  "烧炉": "烧炉紧缺，需要烧的菜不超过两道",
  "无": "所有烹饪设备均充足，蒸屉、烤箱、砂锅、炖锅、烧炉的使用注重均衡协调",
  "正常用餐": "为常规场合，正常用餐",
  "重要接待": "为重要接待场合，需重视，精心设计菜单"
};

import { useState } from 'react';

export default function HomePage() {
  const [cold, setCold] = useState(3);
  const [hot, setHot] = useState(8);
  const [spicy, setSpicy] = useState('不辣');
  const [sweet, setSweet] = useState('正常');
  const [type, setType] = useState('自助餐');
  const [staff, setStaff] = useState('紧缺');
  const [cost, setCost] = useState('需要');
  const [occasion, setOccasion] = useState('正常用餐');
  const [device, setDevice] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [menuResult, setMenuResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prompt 模板
  const promptTemplate = `
你是一位在中国团餐行业工作多年的经验丰富的厨师长。请你根据以下要求，为【tag.食堂性质】食堂接下来一周（周一至周五）设计每日菜单，每日包含 【tag.热菜数量】**个热菜 + 【tag.凉菜数量】个凉菜**，输出格式请严格遵循 【附II】的模板。

菜单必须同时满足以下五段内容（【A】为硬性规则，优先级最高，其次依次为【B】、【C】、【D】）。

请**先完全满足【A】中的所有规则（占权重70%）**，再根据【B】调整风格，之后通过【C】优化菜单吸引力，最后在【D】中实现成本控制。

【A】开菜硬性规则（优先级最高）

【A1】烹饪方式多样化

每餐覆盖如下8种烹饪方式中的至少5种：炒、熘、蒸、烧、烤、炖、煎、烹

【比如，浓汤江团（炖）、梅菜扣肉配荷叶夹（蒸）、香烤鸡翅根（烤）、五花肉炒木耳（炒）、西红柿炒鸡蛋（烹）、椒油小白菜（炒）】

【A2】做工合理搭配：三三制，一锅出:半成品:现炒=1:1:1（一锅出比如酱鸡翅、大锅红烧肉、咖喱鸡块、土豆烧排骨、大锅焖菜、卤味拼盘；半成品比如藕合、酿青椒、烧麦、包子；现炒比如西红柿炒鸡蛋、青椒肉丝、清炒时蔬）

【A3】原材料均衡

1. 每餐饭避免重复出现肉丝或者肉片或者鸡蛋
2. 一餐中，肉、禽、鱼、蛋、豆、筋、菌、蔬，八类中出现不少于六类；或至少包含肉、禽、鱼、蛋、蔬五类

【A4】刀工平衡

1. 每餐饭避免出现重复刀工（如切丝或切片菜）
2. 避免高刀工复杂度菜品过多（如京酱肉丝、宫保鸡丁、鱼香茄子、干煸四季豆等）

【A5】设备均衡

【tag.设备紧缺】

【A6】口味丰富

1. 每餐调味品不少于5种（按主味计算）
2. 菜系尽量少重复，偏向【tag.偏向地区】地区
3. 【tag.甜味菜占比标准】，【tag.辣味菜占比标准】

【A7】菜感平衡

1. 感性感知上要保证菜品的多样性，比如每餐勾芡菜（宫保鸡丁、鱼香肉丝、红烧肉、糖醋排骨等）不要超过两道，否则黏腻
2. 风格近似的菜不要重复出现，如小炒肉、小炒有机花菜、芹菜炒肉片给人感觉接近

【A8】菜品合理

每一道菜里的主料辅料组配要合乎章法，不能胡乱搭配

【A9】历史重复率控制

与历史菜单（见【附I】）进行对照，每周新菜占比不少于70%，重复菜可通过烹饪方式或配料变化以实现“创新变体”

【B】私人化、地域化定制

【B1】 季节感

现在是夏季，比如可利用番茄、黄瓜和西瓜等清爽的食材

【B2】地域口味

北京地区：少辣偏清淡，口味偏温和，注意不可麻辣过头

偏向口味是【tag.偏向口味】，可以适当增加体现此菜系风格

【B3】食堂档次

面向公司白领，中档偏上

【B4】创新程度

适度创新，**不保守、不冒进**，在可行范围内尝试部分新颖组合或菜品名优化

【B5】员工能力

【tag.员工能力】

【C】感知优化

【C1】整体吸引力

每餐菜单从直觉上要“令人有食欲”，搭配有视觉冲击力与诱惑感

【C2】色泽搭配

考虑菜色明暗、清重搭配，使菜品整体摆盘丰富、和谐

【C3】美化菜名

允许对常见菜品适度命名优化，例如“酸辣土豆丝”可改为“青花椒香丝土豆”，更具吸引力但不虚假宣传

【D】成本控制与后勤可行性

【tag.成本控制】

【附I】历史菜单案例参考

周一：

- **凉菜**：素沙拉 炒红果 酸辣蕨根粉
- **热菜**：土豆炖牛肉 锅包肉（鸡肉） 重庆毛血旺 五花肉炒木耳（辣） 白菜炖豆腐 栗子冬瓜条 醋烹绿豆芽 鲮鱼油麦菜

周二：

- **凉菜**：黄瓜蘸酱 红酒雪梨 凉拌金针菇
- **热菜**：黄豆烧猪手 烤鸡翅根 剁椒鮰鱼 炸茄盒 西红柿炒鸡蛋 干锅有机菜花 香芹香干 香菇油菜

周三：

- **凉菜：素沙拉 话梅芸豆 爽口笋丝**
- 热菜：酒香东坡肉 椒盐虾（白灼） 宫保鸡丁 鸡蛋羹 麻婆豆腐 干煸豆角 荷塘小炒 椒油小白菜

周四：

- 凉菜：凉拌苦菊 挂霜花生 捞汁西葫芦
- 热菜：酱腔骨 巫山烤鱼 鱼香肉丝 孜然鱼豆腐 胡萝卜炒鸡蛋 炝炒圆白菜 地三鲜 清炒筷菜

周五

- 凉菜：素沙拉 蓝莓山药 蒜泥茄子
- 热菜：京味涮羊肉 梅菜扣肉 辣子鸡 醋溜木须 青椒炒豆皮 干锅土豆片 蒜蓉粉丝娃娃菜 清炒广东菜心

【附II】输出格式（严格遵循）

输出一周5天完整菜单，不要缩减省略。每日输出格式如下，每道菜输出以下字段，用“+”隔开，无需换行：

菜名+烹饪方式+做工+刀工+菜系+主料+辅料+口味/调味+直觉感受

字段说明（标准格式）：

- 烹饪方式：炒、熘、蒸、烧、烤、炖、煎、烹
- 做工：一锅出 / 半成品 / 现炒
- 刀工：切块 / 切丝 / 切片 / 免刀工
- 菜系：川菜、鲁菜、粤菜、京菜、东北菜、融合
- 主料/辅料：不能混淆，必须明确（例：主料=鸡肉，辅料=青椒）
- 调味：列出主味（例：糖醋/椒盐/酱油/醋/花椒）
- 直觉感受：如“香辣开胃”、“爽口清淡”、“酥软浓郁”等

【附III】自我反思（生成后必须回答）

请在输出菜单后进行如下批判性回顾：

1. 争议搭配：你对本周菜单中有哪些菜品组合、调味或技术安排持保留意见？请具体指出原因。
2. 风味与规则冲突：是否有某些地方为了合规而牺牲了口味吸引力或菜感？
3. 成本与人力问题：是否有可能在某些菜上人力负担偏重或原料偏贵？如有，请说明是否值得保留。

【其他补充】：
【tag.其他规定】
`;

  return (
    <main style={{ padding: '2rem', background: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>炊语菜单系统 🍽️</h1>

      {/* 凉菜数量 */}
      <label htmlFor="cold" style={{ display: 'block', marginTop: '1rem' }}>
        凉菜数量：（手动输入，默认是3）
      </label>
      <input
        id="cold"
        type="number"
        value={cold}
        onChange={(e) => setCold(Number(e.target.value))}
        style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid white', color: 'black' }}
      />

      {/* 热菜数量 */}
      <label htmlFor="hot" style={{ display: 'block', marginTop: '1rem' }}>
        热菜数量：（手动输入，默认是8）
      </label>
      <input
        id="hot"
        type="number"
        value={hot}
        onChange={(e) => setHot(Number(e.target.value))}
        style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid white', color: 'black' }}
      />

      {/* 辣味菜占比标准 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>辣味菜占比标准：</legend>
        <label>
          <input
            type="radio"
            name="spicy"
            value="不辣"
            checked={spicy === '不辣'}
            onChange={(e) => setSpicy(e.target.value)}
          /> 不辣
        </label>{' '}
        <label>
          <input
            type="radio"
            name="spicy"
            value="微辣"
            checked={spicy === '微辣'}
            onChange={(e) => setSpicy(e.target.value)}
          /> 微辣
        </label>{' '}
        <label>
          <input
            type="radio"
            name="spicy"
            value="中辣"
            checked={spicy === '中辣'}
            onChange={(e) => setSpicy(e.target.value)}
          /> 中辣
        </label>
      </fieldset>

      {/* 甜味菜占比标准 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>甜味菜占比标准：</legend>
        <label>
          <input
            type="radio"
            name="sweet"
            value="正常"
            checked={sweet === '正常'}
            onChange={(e) => setSweet(e.target.value)}
          /> 正常
        </label>{' '}
        <label>
          <input
            type="radio"
            name="sweet"
            value="偏甜"
            checked={sweet === '偏甜'}
            onChange={(e) => setSweet(e.target.value)}
          /> 偏甜
        </label>
      </fieldset>

      {/* 食堂性质 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>食堂性质：</legend>
        <label>
          <input
            type="radio"
            name="type"
            value="自助餐"
            checked={type === '自助餐'}
            onChange={(e) => setType(e.target.value)}
          /> 自助餐
        </label>{' '}
        <label>
          <input
            type="radio"
            name="type"
            value="定价餐"
            checked={type === '定价餐'}
            onChange={(e) => setType(e.target.value)}
          /> 定价餐
        </label>
      </fieldset>

      {/* 员工能力 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>员工能力：</legend>
        <label>
          <input
            type="radio"
            name="staff"
            value="紧缺"
            checked={staff === '紧缺'}
            onChange={(e) => setStaff(e.target.value)}
          /> 紧缺
        </label>{' '}
        <label>
          <input
            type="radio"
            name="staff"
            value="适中"
            checked={staff === '适中'}
            onChange={(e) => setStaff(e.target.value)}
          /> 适中
        </label>{' '}
        <label>
          <input
            type="radio"
            name="staff"
            value="宽裕"
            checked={staff === '宽裕'}
            onChange={(e) => setStaff(e.target.value)}
          /> 宽裕
        </label>
      </fieldset>

      {/* 是否需要控制成本 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>是否需要控制成本：</legend>
        <label>
          <input
            type="radio"
            name="cost"
            value="需要"
            checked={cost === '需要'}
            onChange={(e) => setCost(e.target.value)}
          /> 需要
        </label>{' '}
        <label>
          <input
            type="radio"
            name="cost"
            value="无需，正常成本"
            checked={cost === '无需，正常成本'}
            onChange={(e) => setCost(e.target.value)}
          /> 无需，正常成本
        </label>{' '}
        <label>
          <input
            type="radio"
            name="cost"
            value="无需，允许出现高成本菜品"
            checked={cost === '无需，允许出现高成本菜品'}
            onChange={(e) => setCost(e.target.value)}
          /> 无需，允许出现高成本菜品
        </label>
      </fieldset>

      {/* 是否存在设备紧缺 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>是否存在设备紧缺：</legend>
        <label>
          <input
            type="checkbox"
            name="device"
            value="蒸屉"
            checked={device.includes("蒸屉")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 蒸屉
        </label>{' '}
        <label>
          <input
            type="checkbox"
            name="device"
            value="烤箱"
            checked={device.includes("烤箱")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 烤箱
        </label>{' '}
        <label>
          <input
            type="checkbox"
            name="device"
            value="砂锅"
            checked={device.includes("砂锅")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 砂锅
        </label>{' '}
        <label>
          <input
            type="checkbox"
            name="device"
            value="炖锅"
            checked={device.includes("炖锅")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 炖锅
        </label>{' '}
        <label>
          <input
            type="checkbox"
            name="device"
            value="烧炉"
            checked={device.includes("烧炉")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 烧炉
        </label>{' '}
        <label>
          <input
            type="checkbox"
            name="device"
            value="无"
            checked={device.includes("无")}
            onChange={(e) => {
              if (e.target.checked) {
                setDevice([...device, e.target.value]);
              } else {
                setDevice(device.filter((d) => d !== e.target.value));
              }
            }}
          /> 无
        </label>
      </fieldset>

      {/* 场合 */}
      <fieldset style={{ marginTop: '1rem' }}>
        <legend>场合：</legend>
        <label>
          <input
            type="radio"
            name="occasion"
            value="正常用餐"
            checked={occasion === '正常用餐'}
            onChange={(e) => setOccasion(e.target.value)}
          /> 正常用餐
        </label>{' '}
        <label>
          <input
            type="radio"
            name="occasion"
            value="重要接待"
            checked={occasion === '重要接待'}
            onChange={(e) => setOccasion(e.target.value)}
          /> 重要接待
        </label>
      </fieldset>

      {/* 其他规定 */}
      <label htmlFor="other" style={{ display: 'block', marginTop: '1rem' }}>
        其他规定：（手动填空）
      </label>
      <textarea
        id="other"
        rows={4}
        value={other}
        onChange={(e) => setOther(e.target.value)}
        placeholder="如有特殊要求请填写……"
        style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', color: 'black' }}
      ></textarea>
      {/* 生成菜单按钮 */}
      <button
        onClick={async () => {
          setError('');
          setLoading(true);
          console.log('⚡准备发送 prompt 请求:', {
            type,
            hot,
            cold,
            spicy,
            sweet,
            staff,
            cost,
            occasion,
            device,
            other
          });

          const finalPrompt = promptTemplate
            .replace('【tag.食堂性质】', type)
            .replace('【tag.热菜数量】', hot.toString())
            .replace('【tag.凉菜数量】', cold.toString())
            .replace('【tag.设备紧缺】', device.length > 0 ? device.map(d => tagToPromptMap[d] || '').join('\n') : '所有烹饪设备均充足，蒸屉、烤箱、砂锅、炖锅、烧炉的使用注重均衡协调')
            .replace('【tag.甜味菜占比标准】', tagToPromptMap[sweet])
            .replace('【tag.辣味菜占比标准】', tagToPromptMap[spicy])
            .replace('【tag.员工能力】', tagToPromptMap[staff])
            .replace('【tag.成本控制】', tagToPromptMap[cost])
            .replace('【tag.其他规定】', other.trim() || '无');
          console.log("🧾 完整拼接后的 prompt:\n", finalPrompt);

          try {
            const response = await fetch('/api/generate-menu', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: finalPrompt })
            });

            const data = await response.json();
            setMenuResult(data.text || '生成失败');
            console.log('📦 Deepseek 返回结果:', data);
          } catch (err) {
            setMenuResult('');
            setError('调用出错，请检查服务器或接口设置');
          } finally {
            setLoading(false);
          }
        }}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '6px',
          background: 'white',
          color: 'black',
          border: 'none',
          cursor: 'pointer'
        }}
        disabled={loading}
      >
        {loading ? '🌀 正在生成菜单…' : '🧠 生成菜单'}
      </button>
      {menuResult && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', background: '#222', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>🍽️ 本周菜单结果：</h2>
          <div>
            {(() => {
              // 清除 markdown 符号
              const cleanedMenu = menuResult.replaceAll("*", "").replaceAll("#", "");
              // 移除自我反思部分
              const menuOnlyText = cleanedMenu.split("【附III】自我反思")[0];
              // 按行分割
              const lines = menuOnlyText.split("\n");
              // 分组，遇到“周X”开头就新建一组
              const groups: { title: string, content: string[] }[] = [];
              let currentGroup: { title: string, content: string[] } | null = null;
              for (let i = 0; i < lines.length; ++i) {
                const line = lines[i].trim();
                if (/^周[一二三四五]：?/.test(line)) {
                  // 新的一天
                  if (currentGroup) groups.push(currentGroup);
                  currentGroup = { title: line.replace(/：?$/, "："), content: [] };
                } else if (currentGroup) {
                  currentGroup.content.push(line);
                }
              }
              if (currentGroup) groups.push(currentGroup);
              // 只保留菜单分组渲染部分
              return groups.map((group, gidx) => (
                <div
                  key={gidx}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 8px rgba(255,255,255,0.1)'
                  }}
                >
                  {group.title && (
                    <h3 style={{ marginTop: 0, color: '#ffcc00' }}>{group.title}</h3>
                  )}
                  <div>
                    {group.content.map((line, index) => {
                      if (!line) return null;
                      // 判断是否是凉菜或热菜标题
                      if (/^[-]?\s*凉菜[:：]/.test(line) || /^[-]?\s*热菜[:：]/.test(line)) {
                        return (
                          <p key={index} style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
                            {line}
                          </p>
                        );
                      }
                      // 正常菜品行，按 + 分割
                      const fields = line.split("+").map(f => f.trim()).filter(Boolean);
                      if (fields.length <= 1) {
                        // 不是标准菜品行，原样输出
                        return (
                          <div key={index} style={{ color: '#aaa', margin: '0.2rem 0' }}>{line}</div>
                        );
                      }
                      return (
                        <div key={index} style={{ padding: '0.25rem 0', borderBottom: '1px dashed #555' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#eee' }}>
                            {fields[0]}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                            {fields.slice(1).map((field, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-block',
                                  background: '#333',
                                  border: '1px solid #555',
                                  borderRadius: '12px',
                                  padding: '0.2rem 0.6rem',
                                  fontSize: '0.85rem',
                                  marginRight: '0.4rem',
                                  marginBottom: '0.3rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
          {/* 自我反思部分 markdown 渲染 */}
          {(() => {
            const reflectionStart = menuResult.indexOf("【附III】自我反思");
            if (reflectionStart !== -1) {
              const reflectionText = menuResult.slice(reflectionStart);
              const reflectionLines = reflectionText
                .replaceAll("**", "")
                .replaceAll("*", "")
                .replaceAll("#", "")
                .split("\n")
                .filter(line => line.trim() !== "");

              return (
                <div style={{ background: '#111', padding: '1rem', borderRadius: '10px', marginTop: '2rem' }}>
                  <h3 style={{ color: '#ffcc00', marginBottom: '1rem' }}>🧠 自我反思</h3>
                  {reflectionLines.map((line, idx) => (
                    <p key={idx} style={{ marginBottom: '0.5rem', color: '#ccc' }}>
                      {line}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1rem', color: 'red', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}
    </main>
  );
}
