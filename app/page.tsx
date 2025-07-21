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
  const [device, setDevice] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [menuResult, setMenuResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prompt 模板
  const promptTemplate = `
你是一位在中国团餐行业工作多年的经验丰富的厨师长。请你根据以下要求，为【tag.食堂性质】接下来一周（周一至周五）设计每日菜单，每日包含【tag.热菜数量】个热菜 + 【tag.凉菜数量】个凉菜，参考【附II】中2000道原始菜品库中的菜品规律，作为食材&搭配的提示，用于当你的知识库匮乏时起提示作用，但要减少照搬，只作为参考，仍需遵守风格一致的基础上的创新性和多样性；输出格式请严格遵循【附III】的模板。请输出全部菜单，不要有所省略，即使回复会很长。

菜单必须同时满足以下五段内容，其中【A】为硬性规则，优先级最高，其次依次为【B】、【C】、【D】，【E】为可选扩展支持。

请先完全满足【A】中的所有规则（占权重70%），再根据【B】调整风格，之后通过【C】优化菜单吸引力，最后在【D】中实现成本控制。

【A】开菜硬性规则（优先级最高）

【A1】烹饪方式多样化

每餐覆盖如下8种烹饪方式中的至少5种：炒、熘、蒸、烧、烤、炖、煎、烹

（比如，浓汤江团（炖）、梅菜扣肉配荷叶夹（蒸）、香烤鸡翅根（烤）、五花肉炒木耳（炒）、西红柿炒鸡蛋（烹）、椒油小白菜（炒））

【A2】做工合理搭配：三三制，一锅出:半成品:现炒=1:1:1（一锅出比如酱鸡翅、大锅红烧肉、咖喱鸡块、土豆烧排骨、大锅焖菜、卤味拼盘；半成品比如藕合、酿青椒、烧麦、包子；现炒比如西红柿炒鸡蛋、青椒肉丝、清炒时蔬）

【A3】荤素平衡

每餐饭符合荤菜：半荤：素材=1:1:1

【A4】原材料均衡

1. 每餐饭避免重复出现肉丝或者肉片或者鸡蛋
2. 一餐中，肉、禽、鱼、蛋、豆、筋、菌、蔬，八类中出现不少于六类；或至少包含肉、禽、鱼、蛋、蔬五类

【A5】刀工平衡

1. 每餐饭避免出现重复刀工（如切丝或切片菜）
2. 避免高刀工复杂度菜品过多（如京酱肉丝、宫保鸡丁、鱼香茄子、干煸四季豆等）

【A6】设备均衡

【tag.设备紧缺】

【A7】口味丰富

1. 每餐调味品不少于5种（按主味计算）
2. 菜系尽量少重复
3. 【tag.甜味菜占比标准】，【tag.辣味菜占比标准】

【A8】菜感平衡

1. 感性感知上要保证菜品的多样性，比如每餐勾芡菜（宫保鸡丁、鱼香肉丝、红烧肉、糖醋排骨等）不要超过两道，否则黏腻
2. 风格近似的菜不要重复出现，如小炒肉、小炒有机花菜、芹菜炒肉片给人感觉接近

【A9】菜品合理

每一道菜里的主料辅料组配要合乎章法，不能胡乱搭配

【A10】历史重复率控制

与历史菜单（见【附I】）进行对照，每周新菜占比不少于70%，重复菜可通过烹饪方式或配料变化以实现“创新变体”

【A11】其他规定

【tag.其他规定】

【B】私人化、地域化定制

【B1】季节感

现在是夏季，比如可利用番茄、黄瓜和西瓜等清爽的食材

【B2】地域口味

北京地区：少辣偏清淡，口味偏温和，注意不可麻辣过头

【B3】食堂档次

面向公司白领，中档偏上

【B4】创新程度

适度创新，不保守、不冒进，在可行范围内尝试部分新颖组合或菜品名优化

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

共四周，每周从周一到周五，每天8道热菜

| 酱香腔骨 | 荷香粉蒸肉 | 梅干菜辣烧鸡爪 | 风味烤猪手（辣） | 青花椒煮黑鱼片（微辣） |
| --- | --- | --- | --- | --- |
| 麻辣烤鱼（辣） | 盐水鸭 | 红烧鲳鱼 | 金蒜粉丝蒸鲷鱼 | 酱香大棒骨 |
| 茶树菇炖鸡 | 小炒月牙骨（辣） | 海带香菇炖肘块 | 蒜香鸡翅根 | 新疆大盘鸡（辣） |
| 平菇炒肉 | 青椒五花炒土豆片 | 小炒猪肝（辣） | 青笋木耳炒香肠 | 韭菜豆芽肉丝粉 |
| 小炒井冈山豆皮（辣） | 长豆角炒肉丝 | 白菜豆泡炖丸子 | 酸菜肉丝粉 | 大葱木耳爆肉片 |
| 西兰花木耳 | 荷塘小炒 | 西红柿炒鸡蛋 | 青菜蒸水蛋 | 胡萝卜炒鸡蛋 |
| 韭菜炒鸡蛋 | 蒜苔炒鸡蛋 | 金蒜粉丝娃娃菜 | 油淋老豆腐 | 蒜汁蒸杭茄 |
| 白灼油麦菜 | 上汤娃娃菜 | 香菇小油菜 | 菠菜粉丝 | 椒油小白菜 |

| 奥尔良烤鸡翅根 | 萝卜炖筋头巴脑 | 红烧白姑鱼 | 水煮鱼片（辣） | 麻辣口水鸭（辣） |
| --- | --- | --- | --- | --- |
| 土豆梅干菜烧肉 | 孜然烤鸭腿（微辣） | 口水鸡（辣） | 菠菜粉丝汆丸子 | 珍珠丸子 |
| 青柠橙汁鱼片 | 红烧鱼块 | 锅包肉 | 香菇虫草蒸滑鸡 | 红烧鳕鱼 |
| 宫爆鸡丁（微辣） | 山西过油肉 | 肉沫榄菜炒豆角 | 海鲜菇炒肉 | 木须肉片 |
| 小炒烟笋（辣） | 干锅茶树菇（辣） | 黑椒肉丁 | 小炒黑木耳（辣） | 泡椒炒笋丝(微辣） |
| 香芹炒腐竹 | 尖椒土豆丝 | 酸菜汆白肉 | 豉油水蛋 | 虾皮冬瓜丁 |
| 西葫芦木耳炒鸡蛋 | 地三鲜 | 剁椒蒸豆腐（辣） | 醋溜豆芽 | 大酱烧豆腐 |
| 白灼广东菜心 | 白灼圆生菜 | 果仁菠菜 | 香菇油菜 | 上汤快菜 |

| 酸菜龙利鱼（辣） | 紫苏烧武昌鱼 | 红烧带鱼 | 香菇烧鸡块 | 养生排骨 |
| --- | --- | --- | --- | --- |
| 菌菇红烧肉 | 麻辣香锅（辣） | 香炸鸡米花 | 青笋焖咸猪手 | 湘西土匪鸭（辣) |
| 干豆角炖大鹅 | 金粉翅根 | 酸菜炖腔骨 | 冬瓜丸子 | 剁椒鱼块（辣） |
| 东北乱炖 | 五花白菜炖豆泡 | 小炒有机菜花（辣） | 鱼香肉丝（辣） | 芹菜粉条炒肉 |
| 回锅肉（辣） | 小炒木耳（辣） | 干锅茶树菇（微辣） | 肉沫烧豆腐 | 青笋木耳炒肉片 |
| 韭菜炒鸭血 | 蜜汁金瓜山药 | 金蒜蒸金针菇 | 酸辣绿豆芽（辣） | 金蒜粉丝娃娃菜 |
| 蒜汁蒸茄条 | 黄瓜木耳鸡蛋 | 西红柿鸡蛋 | 圆白菜炒粉条 | 时蔬蒸蛋 |
| 木耳小白菜 | 香菇油菜 | 蚝油快菜 | 白灼油麦菜 | 椒油黄心菜 |

| 水煮鱼片（辣） | 养生排骨 | 麻辣羊蝎子（辣） | 香草烤全翅 | 麻辣烤白菇鱼 |
| --- | --- | --- | --- | --- |
| 土豆香菇红烧肉 | 酸菜鱼（辣） | 蒜籽红枣烧鳕鱼 | 红烧武昌鱼 | 毛血旺（辣） |
| 干煸辣子鸡（辣） | 酱烧鸭块 | 菌菇烧鸡块 | 酱香土豆焖肘块 | 酱香腔骨 |
| 肉沫蒸水蛋 | 干煸豆角（辣） | 东北杀猪菜 | 大白菜海带丝炖肉丸 | 芹菜木耳炒肉片 |
| 东北溜肉段 | 青笋木耳炒鸡片 | 肉沫鱼香茄子 | 辣子鸡丁（辣） | 鱼香肉丝（微辣） |
| 西红柿炒菜花 | 油淋老豆腐 | 醋溜土豆丝 | 金瓜山药蒸桃胶 | 蒜蓉粉丝蒸腐竹 |
| 绿甘蓝炒粉条 | 西红柿鸡蛋 | 韭菜炒鸡蛋 | 西兰花炒木耳 | 椒盐土豆块 |
| 白灼油麦菜 | 菠菜粉丝 | 蚝油生菜 | 椒油快菜 | 蒜香蒿子秆 |

【附II】2000道菜品库提炼

一、食材方面

食材方面有如下启发，用于尽可能丰富食材。

1. 大量出现的主料（名称+出现次数）：

鸡蛋：135

茄子：33

南瓜：29

娃娃菜：26

土豆：23


三、烹饪参考

1. 烹饪⽅式提示： 炒、熘、蒸、烧、烤、炖、煎、烹

炸、焗、 煨、浇汁、烩、汆、灼（、 ⽩灼）、 焖、淋、煲、 卤、扒、熏、煮、煸、酿、爆、 烹汁、汤、浸、拌（、 凉拌）、 溜等

1. 风味参考：咸⾹ 、咸鲜、咸酸蒜⾹ 、酸甜、⾹甜 、葱⾹ 、咸辣、酸辣、辣、⿇辣 、甜辣、鲜辣 （、辣鲜）、 ⿇鲜 、鲜⾹ 、⾲⾹ 、⾹辣 、孜然、复合（袈裟⽜⾁）、 ⿊椒 、酱⾹ 、酸⾹ 、 甜、⼲⾹ 、咖喱、蜜汁、豉⾹ 、酒⾹ 、茄汁、奶⾹等
2. 刀工参考：块、⽚ 、丝、⽅、 丁、条、个、 粒、段、整

【附III】输出格式（严格遵循）
输出一周5天完整菜单，严禁缩减省略。每日输出格式如下，每道菜输出以下字段，用“+”隔开，无需换行：

菜名+烹饪方式+做工+刀工+菜系+主料+辅料+口味/调味+直觉感受

字段说明（标准格式）：

- 烹饪方式：炒、熘、蒸、烧、烤、炖、煎、烹等
- 做工：一锅出 / 半成品 / 现炒
- 刀工：切块 / 切丝 / 切片 / 免刀工
- 菜系：川菜、鲁菜、粤菜、苏菜、闽菜、浙菜、湘菜、徽菜、京菜、东北菜、融合
- 主料/辅料：不能混淆，必须明确（例：主料=鸡肉，辅料=青椒）
- 调味：列出主味（例：糖醋/椒盐/酱油/醋/花椒）
- 直觉感受：如“香辣开胃”、“爽口清淡”、“酥软浓郁”等

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
        <div style={{ marginTop: '2rem', background: '#222', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>🍽️ 本周菜单结果：</h2>
          <MenuTable menuResult={menuResult} hot={hot} cold={cold} />
          {/* 菜单说明性文字块渲染（表格后，浅灰蓝色） */}
          {menuResult && (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: '#111',
                color: '#9cc4e4',
                padding: '1rem',
                border: '1px solid #333',
                marginTop: '2rem',
                borderRadius: '8px',
              }}
            >
              {menuResult}
            </pre>
          )}
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

// 菜单表格渲染组件
function MenuTable({ menuResult, hot, cold }: { menuResult: string, hot: number, cold: number }) {
  // 解析函数：提取每周5天、每天 hot+cold 道菜，二维数组 [菜序][星期]
  // 菜名为每行第一个加号+之前内容
  const dayHeaders = ['周一', '周二', '周三', '周四', '周五'];
  // 1. 先按行分割，过滤掉空行和非菜品行（更稳健过滤说明性文本）
  const filteredLines = menuResult
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line &&
      !line.startsWith('以下是') &&
      !line.startsWith('根据') &&
      !line.startsWith('设计了一份') &&
      !line.startsWith('为了方便') &&
      !line.includes('输出格式') &&
      !line.includes('字段说明') &&
      !line.includes('需求') &&
      !line.includes('规则') &&
      !line.includes('每日输出格式如下')
    );
  // 2. 仅保留形如“菜名+烹饪方式+...”的行（含加号且第一个加号前有内容）
  const dishLines = filteredLines.filter(line => {
    const plusIdx = line.indexOf('+');
    return plusIdx > 0 && plusIdx < line.length - 1;
  });

  // 3. 按天分组（每5天为一组），每组 hot+cold 行
  // 允许多余或不足，自动截断或补空
  const dishesByDay: string[][] = [];
  for (let i = 0; i < 5; i++) {
    const start = i * (hot + cold);
    const dayLines = dishLines.slice(start, start + hot + cold);
    // 提取菜名
    const names = dayLines.map(line => {
      const plusIdx = line.indexOf('+');
      return plusIdx > 0 ? line.slice(0, plusIdx).trim() : '';
    });
    // 补足空位
    while (names.length < hot + cold) names.push('');
    dishesByDay.push(names);
  }

  // 构建表格数据：前 hot 行为热菜，后 cold 行为凉菜
  // 转置为 [行][列]，行数 hot+cold，列数5
  const rows: string[][] = [];
  for (let row = 0; row < hot + cold; row++) {
    const thisRow: string[] = [];
    for (let col = 0; col < 5; col++) {
      thisRow.push(dishesByDay[col][row] || '');
    }
    rows.push(thisRow);
  }

  // 渲染
  // Helper to strip leading number-dot-space, e.g., "1. 宫汁神仙腿" -> "宫汁神仙腿"
  function stripNumberPrefix(name: string): string {
    return name.replace(/^\d+\.\s*/, '');
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #555', padding: '0.5rem', background: '#9cc4e4', color: 'black' }}></th>
          {dayHeaders.map(day => (
            <th key={day} style={{ border: '1px solid #555', padding: '0.5rem', background: '#9cc4e4', color: 'black' }}>{day}</th>
          ))}
        </tr>
        {/* 分段表头已移除热菜/凉菜，仅显示周一~周五 */}
      </thead>
      <tbody>
        {/* 热菜 */}
        {Array.from({ length: hot }).map((_, i) => (
          <tr key={'hot-' + i}>
            <td style={{ border: '1px solid #555', padding: '0.5rem', fontWeight: 'bold', background: '#9cc4e4', color: 'black' }}>
              热菜{ i + 1 }
            </td>
            {rows[i]?.map((dish, j) => (
              <td key={j} style={{ border: '1px solid #555', padding: '0.5rem' }}>
                {stripNumberPrefix(dish)}
              </td>
            ))}
          </tr>
        ))}
        {/* 凉菜 */}
        {Array.from({ length: cold }).map((_, i) => (
          <tr key={'cold-' + i}>
            <td style={{ border: '1px solid #555', padding: '0.5rem', fontWeight: 'bold', background: '#9cc4e4', color: 'black' }}>
              凉菜{ i + 1 }
            </td>
            {rows[hot + i]?.map((dish, j) => (
              <td key={j} style={{ border: '1px solid #555', padding: '0.5rem' }}>
                {stripNumberPrefix(dish)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}