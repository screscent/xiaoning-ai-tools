# -*- coding: utf-8 -*-
"""静态站生成器：读取 apps.json + content.py，生成 GitHub Pages 站点。

用法：python3 build.py
输出：index.html / categories/*.html / tools/*.html / pricing.html / sitemap.xml / robots.txt / llms.txt
"""
import json
import os
import glob
import html
import re
import sys
import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
APPS_JSON = os.path.join(DATA, "apps.json")
BLOG_FEED = os.path.join(DATA, "blog_feed.json")
BLOG_POSTS = os.path.join(DATA, "blog_posts")
REPORTS_SRC = os.path.join(DATA, "reports")  # 源文件以 .html.txt 存放：仓库自包含，且不会被 Pages 当页面重复发布
REPORTS = [
    {
        "slug": "xiaoning-os-v16.6",
        "title": "小凝体系深度评估报告 v16.6",
        "desc": "OS 四层 × 人格体系 × 18 模块 × 双项目实证：八维评分 93.4，并与 2026 主流 Agent、工程范式与研究逐项对照。",
        "date": "2026-11-08",
        "file": "xiaoning-os-v16.6.html.txt",
    }
]
sys.path.insert(0, DATA)

BASE_URL = "https://screscent.github.io/xiaoning-ai-tools"
SITE_NAME = "小凝 AI 工具集"

# 12 工具容器页（GitHub 本地 sets/，由 scripts/publish_tool_sets.py 生成）
TOOLSETS = [
    ("JSON 代码生成", "由 JSON 生成 TS/Go/Java/Python/PHP/Rust/Kotlin/Swift/C#/SQL DDL/JSON Schema/路径", "json-codegen.html"),
    ("编码与哈希", "Base64 / URL / Hex / 二进制 / ROT13 / 凯撒 / 摩斯 / 罗马数字", "tools-codec.html"),
    ("时间与日期", "时间戳 / 日期差 / ISO 周数 / 年龄 / 倒计时 / 工作日 / 时区换算", "tools-time.html"),
    ("文本清洗", "去空行 / 去重 / 排序 / 行号 / 前后缀 / 全角转半角 / 空格合并", "tools-text.html"),
    ("颜色与 CSS", "HEX↔RGB↔HSL / 变亮变暗 / 对比度 / 色阶 / 渐变 / 阴影", "tools-color.html"),
    ("数学计算", "百分比 / 折扣 / BMI / 公约数 / 公倍数 / 质数 / 阶乘 / 统计 / 比例分配", "tools-math.html"),
    ("图片尺寸与体积", "像素 / 比例 / DPI / Base64 体积 / 裁剪 / 九宫格切图", "tools-image.html"),
    ("隐私与口令", "手机号 / 身份证 / 邮箱 / 卡号脱敏，密码强度、熵与隐私扫描", "tools-privacy.html"),
    ("出行换算", "时差 / 飞行时长 / 油耗 / 多人分摊 / 签证停留期 / 打包清单", "tools-travel.html"),
]
TOOLSET_FILES = [f for _, _, f in TOOLSETS]

# 15 个自建工具集容器页（站根，静态页；首页「本站自建工具集」区链接它们）
SELF_CONTAINERS = [
    ("HTML 实体与符号", "实体转义/反转义、数字实体、常用符号查询", "tools-entity.html"),
    ("折扣与数字统计", "折扣到手价、百分比、均值/中位数、四舍五入、千分位", "tools-num.html"),
    ("随机生成与密码强度", "随机密码 / PIN / UUID / 随机串、密码强度评分", "tools-sec.html"),
    ("JSON 处理", "格式化、压缩、校验、键路径提取、转义/反转义", "tools-jsonx.html"),
    ("正则表达式", "匹配测试、批量提取、替换、元字符转义、常用正则速查", "tools-regex.html"),
    ("文本清洗", "去空行、去重、排序、加行号、批量前后缀", "tools-clean.html"),
    ("Base64 / URL / Hex 编码", "UTF-8 安全的编码与解码，往返可验证", "tools-encode.html"),
    ("单位换算", "长度 / 重量 / 温度 / 面积 / 数据体积", "tools-unit.html"),
    ("URL 解析与构造", "结构解析、查询参数解析/构造、相对拼接、去追踪参数", "tools-url.html"),
    ("CSV 与 JSON 互转", "CSV↔JSON、Markdown 表格、取列、列统计", "tools-csv.html"),
    ("哈希与校验和", "MD5 / SHA-1 / SHA-256 / SHA-512 / CRC32", "tools-hash.html"),
    ("进制与位运算", "任意进制互转、多进制视图、32 位展开、位运算、字符码点", "tools-base.html"),
    ("文本差异对比", "行级 diff、差异统计、相似度、统一 diff、首个差异定位", "tools-diff.html"),
    ("日期与时间计算", "时间戳互转、日期相差、日期加减、月度工作日、时区换算", "tools-date.html"),
    ("贷款与理财计算", "等额本息/等额本金、复利、定投、通胀购买力", "tools-finance.html"),
]

# 实体卡片（GEO 唯一文案源）：优先项目根状态文件，独立克隆时回退 data/entity-card.json
ENTITY_CARD = os.path.join(os.path.dirname(os.path.dirname(HERE)), ".trae", "state", "entity-card.json")
if not os.path.exists(ENTITY_CARD):
    ENTITY_CARD = os.path.join(DATA, "entity-card.json")


def _entity_definition():
    """读实体卡片的定义句；缺失时回退空串（构建不依赖它，但会少一句统一文案）。"""
    try:
        with open(ENTITY_CARD, encoding="utf-8") as f:
            return (json.load(f).get("definition") or "").strip()
    except (OSError, ValueError):
        return ""


DEFINITION = _entity_definition()
PORTAL = "https://rdndxd4t4r.app.weavefox.cn"
UNIFIED = "https://screscent.app.weavefox.cn"
TOOLBOX = "https://7bpgquweb7.app.weavefox.cn"

# 实用工具子分类（SSOT：apps.json 每条 cat=实用工具 必须带 subcat）
# 已知类仅决定「优先展示顺序」；apps.json 出现的新 subcat 自动追加到末尾，不再硬拦截。
UTIL_SUBCAT_ORDER = [
    "图片处理", "文本处理", "编码转换", "时间日期",
    "计算换算", "安全隐私", "设计绘图", "效率生活",
    "出行旅行", "生活健康",
]


def util_subcat_order(apps):
    """从 apps.json 动态推导分组顺序：已知类按默认顺序，新类按首次出现顺序追加。"""
    seen = []
    for a in apps:
        if a.get("cat") == "实用工具" and a.get("subcat") and a["subcat"] not in seen:
            seen.append(a["subcat"])
    return [c for c in UTIL_SUBCAT_ORDER if c in seen] + [c for c in seen if c not in UTIL_SUBCAT_ORDER]
OWNER = "月牙寂（龚浩华）"
AGENT = "月绡凝（小凝）"
PHONE = "15980989344"
MAIL = "29185807@qq.com"
WECHAT_MP = "月牙寂"  # 微信公众号
TODAY = datetime.date.today().isoformat()

import content as C  # noqa: E402


def esc(s):
    return html.escape(str(s), quote=True)


def price_label(a):
    """免费工具（price=0）显示「免费」，其余按 ¥N。"""
    p = a.get("price", 0)
    return "免费" if p in (0, "0", None) else f"¥{p}"


def u(label, medium="referral", campaign=""):
    q = f"utm_source=xiaoning-site&utm_medium={medium}"
    if campaign:
        q += f"&utm_campaign={campaign}"
    return f"{label}?{q}" if "?" not in label else f"{label}&{q}"


def load_apps():
    with open(APPS_JSON, encoding="utf-8") as f:
        apps = json.load(f)
    for a in apps:
        a.setdefault("slug", C.APPS.get(a["id"], ("",))[0])
    return apps


def load_blog():
    """加载博客数据（上游同步副本）。缺失时返回空，不阻断工具站构建。"""
    if not os.path.exists(BLOG_FEED):
        return {"articles": [], "posts": {}}
    with open(BLOG_FEED, encoding="utf-8") as f:
        feed = json.load(f)
    posts = {}
    if os.path.isdir(BLOG_POSTS):
        for name in os.listdir(BLOG_POSTS):
            if name.endswith(".json"):
                with open(os.path.join(BLOG_POSTS, name), encoding="utf-8") as f:
                    p = json.load(f)
                p.setdefault("kind", "wechat")
                posts[p.get("slug", name[:-5])] = p
    arts = []
    for a in feed.get("articles", []):
        if a.get("status") != "published":
            continue
        p = posts.get(a["slug"])
        if not p:
            continue
        a = dict(a)
        a["kind"] = p.get("kind", "wechat")
        a["digest"] = a.get("digest") or p.get("digest", "")
        arts.append(a)
    return {"articles": arts, "posts": posts, "updated": feed.get("updated", "")}


def blog_post_path(post):
    return os.path.join(BLOG_POSTS, f"{post['slug']}.json")


def page_shell(title, desc, canonical, body, extra_jsonld="", depth=0):
    pre = "../" * depth
    nav = f"""<header class="top">
  <div class="wrap">
    <a class="brand" href="{pre}index.html">{SITE_NAME}</a>
    <nav><a href="{pre}index.html">统一门户</a><a href="{pre}search.html">搜索</a><a href="{pre}ai/index.html">AI 工具集</a><a href="{pre}utility/index.html">实用工具箱</a><a href="{pre}blog/index.html">博客</a><a href="{pre}pricing.html">价格与使用</a></nav>
  </div>
</header>"""
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{BASE_URL}/legacy/assets/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:image" content="{BASE_URL}/legacy/assets/og-cover.jpg">
<meta name="robots" content="index, follow">
<link rel="stylesheet" href="{pre}assets/style.css">
{extra_jsonld}
</head>
<body>
{nav}
<main class="wrap">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <p class="sig">人类作者：{OWNER}｜联系：{PHONE}｜邮箱：{MAIL}｜微信公众号：{WECHAT_MP}<br>Agent 作者：{AGENT}</p>
    <p class="meta">AI 工具在 WeaveFox 应用内运行；免费工具在 GitHub 本地运行（数据不出浏览器）；更新于 {TODAY}。</p>
  </div>
</footer>
</body>
</html>
"""


def rel(path):
    return path


def _latest_ledger():
    """迁移台账按 pid 取最后一条（台账只追加，旧行可能 ok 但已被 snapshot_only 覆盖）。

    优先读项目根台账（迁移过程实时更新）；仓库单独克隆时回退到 data/legacy_pages.jsonl 快照，
    保证 site 仓可独立重建，不会静默丢失 370 个本地快照页。
    """
    live = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                        ".trae/state/legacy_pages.jsonl")
    local = os.path.join(HERE, "data", "legacy_pages.jsonl")
    ledger = live if os.path.exists(live) else local
    latest = {}
    if os.path.exists(ledger):
        for line in open(ledger, encoding="utf-8"):
            line = line.strip()
            if line:
                row = json.loads(line)
                latest[row["pid"]] = row
    return latest


def _load_legacy_pids():
    """已迁移到同源快照的实用工具 pid 集合（GitHub 独立性的真源）。"""
    return {p for p, r in _latest_ledger().items() if r.get("ok") and not r.get("snapshot_only")}


LEGACY_PIDS = _load_legacy_pids()


def target(a):
    """工具落地地址：已本地化的实用工具指向 legacy 快照，其余保持原 URL。"""
    if a.get("cat") == "实用工具" and a["id"] in LEGACY_PIDS:
        return f"{BASE_URL}/legacy/{a['id']}.html"
    return a["url"]



SELF_TOOLS_HTML = '''<h2 id="self-tools">本站自建工具集（75 工具 · 独立直发）</h2><ul class="cards one"><li><a href="tools-entity.html"><strong>HTML 实体与符号（5 工具）</strong><span>实体转义/反转义、数字实体、常用符号查询</span><em>打开工具集 →</em></a></li><li><a href="tools-num.html"><strong>折扣与数字统计（5 工具）</strong><span>折扣到手价、百分比、均值/中位数、四舍五入、千分位</span><em>打开工具集 →</em></a></li><li><a href="tools-sec.html"><strong>随机生成与密码强度（5 工具）</strong><span>随机密码 / PIN / UUID / 随机串、密码强度评分</span><em>打开工具集 →</em></a></li><li><a href="tools-jsonx.html"><strong>JSON 处理（5 工具）</strong><span>格式化、压缩、校验、键路径提取、转义/反转义</span><em>打开工具集 →</em></a></li><li><a href="tools-regex.html"><strong>正则表达式（5 工具）</strong><span>匹配测试、批量提取、替换、元字符转义、常用正则速查</span><em>打开工具集 →</em></a></li><li><a href="tools-clean.html"><strong>文本清洗（5 工具）</strong><span>去空行、去重、排序、加行号、批量前后缀</span><em>打开工具集 →</em></a></li><li><a href="tools-encode.html"><strong>Base64 / URL / Hex 编码（5 工具）</strong><span>UTF-8 安全的编码与解码，往返可验证</span><em>打开工具集 →</em></a></li><li><a href="tools-unit.html"><strong>单位换算（5 工具）</strong><span>长度 / 重量 / 温度 / 面积 / 数据体积</span><em>打开工具集 →</em></a></li><li><a href="tools-url.html"><strong>URL 解析与构造（5 工具）</strong><span>结构解析、查询参数解析/构造、相对拼接、去追踪参数</span><em>打开工具集 →</em></a></li><li><a href="tools-csv.html"><strong>CSV 与 JSON 互转（5 工具）</strong><span>CSV↔JSON、Markdown 表格、取列、列统计</span><em>打开工具集 →</em></a></li><li><a href="tools-hash.html"><strong>哈希与校验和（5 工具）</strong><span>MD5 / SHA-1 / SHA-256 / SHA-512 / CRC32</span><em>打开工具集 →</em></a></li><li><a href="tools-base.html"><strong>进制与位运算（5 工具）</strong><span>任意进制互转、多进制视图、32 位展开、位运算、字符码点</span><em>打开工具集 →</em></a></li><li><a href="tools-diff.html"><strong>文本差异对比（5 工具）</strong><span>行级 diff、差异统计、相似度、统一 diff、首个差异定位</span><em>打开工具集 →</em></a></li><li><a href="tools-date.html"><strong>日期与时间计算（5 工具）</strong><span>时间戳互转、日期相差、日期加减、月度工作日、时区换算</span><em>打开工具集 →</em></a></li><li><a href="tools-finance.html"><strong>贷款与理财计算（5 工具）</strong><span>等额本息/等额本金、复利、定投、通胀购买力</span><em>打开工具集 →</em></a></li></ul>'''

def app_jsonld(a, canon):
    price = a["price"]
    faqs = C.COMMON_FAQ + [(C.APPS[a["id"]][8], C.APPS[a["id"]][9])]
    faq_json = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": ans}}
            for q, ans in faqs
        ],
    }
    app_json = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": a["name"],
        "description": a["desc"],
        "applicationCategory": a["cat"],
        "operatingSystem": "Web",
        "url": target(a),
        "inLanguage": "zh-CN",
        "offers": {"@type": "Offer", "price": price, "priceCurrency": "CNY"},
        "isPartOf": {"@type": "WebSite", "name": SITE_NAME, "url": BASE_URL + "/"},
    }
    crumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": SITE_NAME, "item": BASE_URL + "/"},
            {"@type": "ListItem", "position": 2, "name": a["cat"], "item": f"{BASE_URL}/categories/{cat_slug(a['cat'])}.html"},
            {"@type": "ListItem", "position": 3, "name": a["name"], "item": canon},
        ],
    }
    return "\n".join(
        f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>'
        for x in (app_json, faq_json, crumb)
    )


CAT_SLUGS = {
    "职场办公": "office", "求职面试": "job", "学生教育": "study",
    "自媒体运营": "media", "电商客服": "ecommerce", "研发效率": "dev",
    "生活家庭": "life", "亲子宠物": "family-pet", "实用工具": "utility",
}


def cat_slug(cat):
    return CAT_SLUGS[cat]


def seo_desc(a, output):
    """SEO 描述：80~160 字符；不足自动补全句，超长按句号/分号收尾。"""
    free = a.get("price", 0) == 0
    s = f"{a['desc']}。{a['name']}：{output}。" + ("完全免费，浏览器即开即用。" if free else f"¥{a['price']} 解锁，浏览器即开即用。")
    for extra in ["支持手机与电脑浏览器，无需安装；结果可一键复制，数据本地处理。", "打开网页即可使用，不占内存。"]:
        if len(s) >= 80:
            break
        s += extra
    if len(s) > 160:
        cut = s[:160]
        pos = max(cut.rfind("。"), cut.rfind("；"))
        s = cut[:pos + 1] if pos > 60 else cut[:159] + "。"
    return s


def tool_page(a, apps):
    c = C.APPS[a["id"]]
    _, hook, w1, w2, w3, inputs, output, example, fq, fa = c
    canon = f"{BASE_URL}/tools/{a['slug']}.html"
    is_util = a["cat"] == "实用工具"
    label = a.get("subcat") or a["cat"] if is_util else a["cat"]
    peers = [x for x in apps
             if (x.get("subcat") == a.get("subcat") if is_util else x["cat"] == a["cat"])
             and x["id"] != a["id"]][:3]
    peers_html = "".join(
        f'<li><a href="{x["slug"]}.html">{esc(x["name"])}</a><span>{esc(x["desc"])}</span></li>'
        for x in peers
    )
    subs_section = ""
    if a.get("subapps"):
        subs_html = "".join(
            f'<li><a href="{esc(target(a))}#/{esc(s["key"])}" rel="noopener">{esc(s["title"])}</a>'
            f'<span>直接打开该子工具（hash 深链）</span></li>'
            for s in a["subapps"]
        )
        subs_section = f'<h2>这个合集包含 {len(a["subapps"])} 个工具</h2>\n  <ul class="peers">{subs_html}</ul>\n\n  '
    faq_html = "".join(
        f'<details><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>'
        for q, ans in (C.COMMON_FAQ + [(fq, fa)])
    )
    inputs_html = "".join(f"<li>{esc(i)}</li>" for i in inputs)
    body = f"""
<nav class="crumb"><a href="../index.html">工具集</a> › <a href="../categories/{cat_slug(a['cat'])}.html">{esc(a['cat'])}</a> › <span>{esc(a['name'])}</span></nav>
<article>
  <h1>{esc(a['name'])}<small>{esc(label)}</small></h1>
  <p class="hook">{esc(hook)}</p>
  <p class="lede"><strong>{esc(a['name'])}</strong> 是一个即开即用的{'纯前端免费工具' if is_util else 'AI 小工具'}：{esc(a['desc'])}。不需要安装，浏览器打开就能用。</p>

  <h2>谁需要它</h2>
  <ul class="who"><li>{esc(w1)}</li><li>{esc(w2)}</li><li>{esc(w3)}</li></ul>

  <h2>输入什么，得到什么</h2>
  <table class="io">
    <tr><th>你需要填</th><td><ul>{inputs_html}</ul></td></tr>
    <tr><th>它会给你</th><td>{esc(output)}</td></tr>
  </table>

  <h2>一个具体例子</h2>
  <p class="example">{esc(example)}</p>

  <h2>怎么用</h2>
  <ol class="steps">
    <li>{'点下面的按钮打开工具（纯前端本地运行，无需注册与支付）。' if is_util else '点下面的按钮打开工具（首次使用需手机号注册，免费）。'}</li>
    <li>按提示填写上面的信息，点生成。</li>
    <li>{'复制或下载结果即可；本工具完全免费，无需解锁。' if a.get('price',0)==0 else "复制结果；需要继续用同一个工具时，在应用内解锁完整功能（¥%s）。" % a['price']}</li>
  </ol>

  <p class="cta"><a class="btn" href="{esc(u(target(a), 'cta', a['slug']))}" rel="noopener">打开 {esc(a['name'])}（{price_label(a)}）</a></p>

  <h2>常见问题</h2>
  <div class="faq">{faq_html}</div>

{subs_section}  <h2>同分类的其他工具</h2>
  <ul class="peers">{peers_html}</ul>
</article>
"""
    return page_shell(
        f"{a['name']} - {label} {'免费工具' if is_util else 'AI 工具'} | {SITE_NAME}",
        seo_desc(a, output),
        canon, body,
        extra_jsonld=app_jsonld(a, canon),
        depth=1,
    )


def category_page(cat, apps):
    items = [a for a in apps if a["cat"] == cat]
    lead = C.CATEGORY_LEADS[cat]
    cards = "".join(
        f'<li><a href="../tools/{a["slug"]}.html"><strong>{esc(a["name"])}</strong>'
        f'<span>{esc(a["desc"])}</span><em>{price_label(a)}</em></a></li>'
        for a in items
    )
    canon = f"{BASE_URL}/categories/{cat_slug(cat)}.html"
    body = f"""
<nav class="crumb"><a href="../index.html">工具集</a> › <span>{esc(cat)}</span></nav>
<h1>{esc(cat)} AI 工具<small>{len(items)} 个</small></h1>
<p class="lede">{esc(lead)}</p>
<ul class="cards">{cards}</ul>
<p class="cta"><a class="btn ghost" href="../index.html">查看全部 {len(apps)} 个工具</a></p>
"""
    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": f"{cat} AI 工具",
        "description": lead,
        "url": canon,
        "mainEntity": {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": a["name"],
             "url": f"{BASE_URL}/tools/{a['slug']}.html"}
            for i, a in enumerate(items)
        ]},
    }, ensure_ascii=False)
    if cat == "实用工具":
        _title = f"实用工具（{len(items)} 个免费本地工具）| {SITE_NAME}"
        _desc = f"{lead} 共 {len(items)} 个纯前端工具，浏览器本地运行，免费、数据不上传。"
    else:
        _title = f"{cat} AI 工具（{len(items)} 个）| {SITE_NAME}"
        _desc = f"{lead} 共 {len(items)} 个工具，浏览器即开即用，单个 ¥1–¥3 解锁。"
    return page_shell(
        _title,
        _desc,
        canon, body,
        extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>',
        depth=1,
    )


def _cat_cards(apps, pre, cats):
    counts = {c: len([a for a in apps if a["cat"] == c]) for c in cats}
    return "".join(
        f'<li><a href="{pre}categories/{cat_slug(c)}.html"><strong>{esc(c)}</strong>'
        f'<span>{esc(C.CATEGORY_LEADS[c][:38])}…</span><em>{counts[c]} 个</em></a></li>'
        for c in cats
    )


def _groups(apps, pre, cats):
    out = ""
    for c in cats:
        rows = "".join(
            f'<li><a href="{pre}tools/{a["slug"]}.html">{esc(a["name"])}</a>'
            f'<span>{esc(a["desc"])}</span><em>{price_label(a)}</em></li>'
            for a in apps if a["cat"] == c
        )
        n = len([a for a in apps if a["cat"] == c])
        out += f'<section class="group"><h2>{esc(c)}<small>{n} 个</small></h2><ul class="rows">{rows}</ul></section>'
    return out


# 实用工具箱 8 类导语（与 §S2.7.0 分类表一一对应）
UTIL_SUBCAT_LEADS = {
    "图片处理": "压缩、转换、裁剪、水印、打码与取色，本地处理不上传。",
    "文本处理": "批量处理、Diff 对比、统计、Markdown 表格与预览、命名风格。",
    "编码转换": "JSON、CSV、Base64、URL、进制与哈希，格式互转一次到位。",
    "时间日期": "时间戳、日期计算、计时器、秒表、月历与世界时钟。",
    "计算换算": "房贷、BMI、单位换算、科学计算、大写金额与数字互转。",
    "安全隐私": "密码生成、文本加解密与强度检测，全部在浏览器本地完成。",
    "设计绘图": "颜色与对比度、配色方案、画板与思维导图。",
    "效率生活": "二维码、随机抽签、待办、打字测试、记账与生活查询。",
    "生活健康": "药品保质期、饮水作息与健康自查，数据只在本机计算。",
    "出行旅行": "行李清单、预算估算与行程准备，出门前一次配齐。",
}


def _uni_card(a, pre, medium):
    """AI / 实用两门户共用卡片模板：详情页（内链）+ 打开工具（外链 CTA）。"""
    return (f'<li><a href="{pre}tools/{a["slug"]}.html"><strong>{esc(a["name"])}</strong>'
            f'<span>{esc(a["desc"])}</span><em>{price_label(a)}</em></a>'
            f'<p class="more"><a href="{esc(u(target(a), medium, a["slug"]))}" rel="noopener">打开工具 →</a></p></li>')


def _uni_groups(apps, cats, pre, medium, subcat=False):
    """两门户共用分组模板：同一 section + cards 结构；subcat=True 时补锚点。"""
    out = ""
    for c in cats:
        items = [a for a in apps if (a.get("subcat") if subcat else a["cat"]) == c]
        if not items:
            continue
        gid = f' id="g-{esc(c)}"' if subcat else ""
        out += (f'<section class="group"{gid}><h2>{esc(c)}<small>{len(items)} 个</small></h2>'
                f'<ul class="cards">{"".join(_uni_card(a, pre, medium) for a in items)}</ul></section>')
    return out


def _util_cat_cards(util):
    order = util_subcat_order(util)
    counts = {c: len([a for a in util if a.get("subcat") == c]) for c in order}
    return "".join(
        f'<li><a href="#g-{esc(c)}"><strong>{esc(c)}</strong>'
        f'<span>{esc(UTIL_SUBCAT_LEADS.get(c, "本地处理 · 免费使用"))}</span><em>{counts[c]} 个</em></a></li>'
        for c in order if counts[c]
    )


def unified_page(apps, blog=None):
    n_util = len([a for a in apps if a["cat"] == "实用工具"])
    n_ai = len(apps) - n_util
    canon = BASE_URL + "/"
    latest = (blog or {}).get("articles", [])[:10]
    latest_html = ""
    if latest:
        rows = "".join(
            f'<li><a href="blog/{esc(a["slug"])}.html"><strong>{esc(a["title"])}</strong>'
            f'<em>{esc(a.get("publish_time") or "")}</em></a></li>'
            for a in latest
        )
        latest_html = f'<h2>最新文章</h2><ul class="rows">{rows}</ul><p class="cta"><a class="btn ghost" href="blog/index.html">浏览全部博客</a></p>'
    ts_html = "".join(
        f'<li><a href="sets/{f}"><strong>{esc(t)}（12 工具）</strong>'
        f'<span>{esc(d)}</span><em>打开工具集 →</em></a></li>' for t, d, f in TOOLSETS)
    toolset_html = f'<h2 id="tool-sets">本地工具集（108 个工具 · GitHub 自建）</h2><ul class="cards one">{ts_html}</ul>'
    report_html = ""
    if REPORTS:
        cards = "".join(
            f'<li><a href="reports/{esc(r["slug"])}.html"><strong>{esc(r["title"])}</strong>'
            f'<span>{esc(r["desc"])}</span><em>阅读报告 →</em></a></li>'
            for r in REPORTS
        )
        report_html = f'<h2>深度报告</h2><ul class="cards one">{cards}</ul><p class="cta"><a class="btn ghost" href="reports/index.html">全部报告 →</a></p>'
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "WebSite", "name": SITE_NAME,
        "url": canon, "inLanguage": "zh-CN",
        "description": "统一入口：AI 工具集、免费实用工具箱与博客。",
    }, ensure_ascii=False)
    legacy_card = (
        f'<li><a href="legacy/index.html"><strong>全部免费工具 · {len(LEGACY_PIDS)} 个</strong>'
        f'<span>GitHub 自建快照：按分类筛选与搜索全部免费工具，运行时不依赖 WeaveFox。</span><em>浏览 →</em></a></li>'
        if LEGACY_PIDS else ""
    )
    body = f"""
<section class="hero">
  <h1>{SITE_NAME} · 统一入口</h1>
  <p class="lede">三类内容，一个入口：<strong>AI 工具集</strong>负责把材料变成可直接使用的结果；<strong>实用工具箱</strong>用纯前端完成转换与计算，完全免费、数据不上传；<strong>博客</strong>归档方法与复盘。</p>
</section>

{toolset_html}

{SELF_TOOLS_HTML}

{report_html}

<h2>选择工具集</h2>
<ul class="cards">
  <li><a href="ai/index.html"><strong>AI 工具集</strong><span>生成类工具：简历匹配、面试题、周报、会议纪要、PPT 大纲、小红书文案、SQL 优化等，单个 ¥1–¥3 解锁。</span><em>进入 →</em></a></li>
  <li><a href="utility/index.html"><strong>实用工具箱 · 免费</strong><span>免费纯前端工具：JSON·SQL 互转、HTTP 接口调试、CSV 与 JSON、Markdown 表格、编码转换、命名转换、Linux 运维、服务器排障等；本地处理，数据不上传。</span><em>进入 →</em></a></li>
  {legacy_card}
  <li><a href="blog/index.html"><strong>博客</strong><span>公众号文章全文归档 + 独立博客：记录一个 AI 体系怎么被赋予行动能力、怎么在真实项目里交付。</span><em>进入 →</em></a></li>
</ul>

<h2>常用入口</h2>
<p class="cta"><a class="btn" href="ai/index.html">AI 工具集</a><a class="btn" href="utility/index.html">实用工具箱</a><a class="btn ghost" href="blog/index.html">博客</a><a class="btn ghost" href="pricing.html">价格与使用说明</a></p>

{latest_html}

<h2>工作方式</h2>
<p>AI 工具在 WeaveFox 应用内运行，首次使用手机号注册（免费），按需解锁单个功能；实用工具完全在浏览器本地运行，无需支付。两套工具都由同一套内容源维护，页面只做介绍与入口。</p>
{common_faq_block()}
"""
    return page_shell(
        f"{SITE_NAME} - 统一入口（AI 工具集 + 实用工具箱 + 博客）",
        (DEFINITION + " 统一入口：AI 工具集、免费实用工具箱与博客。") if DEFINITION else "统一入口：AI 工具集（单个 ¥1–¥3 解锁）、免费实用工具箱（JSON·SQL、HTTP 调试、编码与命名转换等）与博客，浏览器即开即用。",
        canon, body,
        extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>',
        depth=0,
    )


def ai_portal_page(apps):
    ai_apps = [a for a in apps if a["cat"] != "实用工具"]
    cats = [c for c, _ in C.CATEGORIES if c != "实用工具"]
    canon = f"{BASE_URL}/ai/"
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "CollectionPage", "name": f"AI 工具集（{len(ai_apps)} 个）",
        "url": canon, "inLanguage": "zh-CN",
        "description": f"{len(ai_apps)} 个生成类 AI 小工具，单个 ¥1–¥3 解锁。",
    }, ensure_ascii=False)
    body = f"""
<p class="crumb"><a href="{BASE_URL}/">← 返回统一门户</a></p>
<section class="hero">
  <h1>AI 工具集<small>{len(ai_apps)} 个</small></h1>
  <p class="lede">{len(ai_apps)} 个即开即用的 AI 小工具，覆盖职场、求职、教育、自媒体、电商、研发与生活七类场景。手机号注册即用，单个工具 ¥1–¥3 解锁。</p>
  <p class="cta"><a class="btn" href="{esc(u(PORTAL, 'portal', 'ai-home'))}" rel="noopener">打开 AI 工具集门户</a><a class="btn ghost" href="../utility/index.html">看看免费工具箱</a></p>
</section>

<h2>按场景找工具</h2>
<ul class="cards">{_cat_cards(ai_apps, "../", cats)}</ul>

<h2>全部 AI 工具</h2>
{_uni_groups(ai_apps, cats, "../", "ai")}

<h2>怎么用</h2>
<ol class="steps">
  <li>点卡片查看工具说明，或直接点「打开工具」进入 WeaveFox。</li>
  <li>首次使用用手机号注册（免费），填写材料后点生成。</li>
  <li>先看免费效果；需要完整结果时在应用内解锁单个功能（¥1–¥3）。</li>
</ol>

<h2>为什么做成这个样子</h2>
<p>这些工具都只做一件事：把你手上的一段材料，变成可以直接使用的结果。没有复杂配置，不需要学习提示词，填完就出结果。工具运行在 WeaveFox 上，注册免费，只为实际使用的那一个功能付费。</p>
{common_faq_block()}
"""
    return page_shell(
        f"AI 工具集（{len(ai_apps)} 个）| {SITE_NAME}",
        f"{len(ai_apps)} 个 AI 小工具合集：简历匹配、面试题、周报、会议纪要、PPT 大纲、小红书文案、SQL 优化等，浏览器即开即用，¥1–¥3 解锁。",
        canon, body,
        extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>',
        depth=1,
    )


def utility_portal_page(apps):
    util = [a for a in apps if a["cat"] == "实用工具"]
    canon = f"{BASE_URL}/utility/"
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "CollectionPage", "name": f"实用工具箱（{len(util)} 个 · 免费）",
        "url": canon, "inLanguage": "zh-CN",
        "description": "纯前端免费工具：JSON·SQL 互转、HTTP 接口调试、CSV 与 JSON、Markdown 表格、编码转换、命名转换、Linux 运维、服务器排障等；本地处理，数据不上传。",
    }, ensure_ascii=False)
    missing = [a["name"] for a in util if not a.get("subcat")]
    if missing:
        print(f"FAIL: 实用工具缺少 subcat 字段（新分类可直接使用新名称，不再限枚举）：{missing}")
        sys.exit(1)
    portal_cta = f"{BASE_URL}/legacy/index.html" if LEGACY_PIDS else u(TOOLBOX, "portal", "utility-home")
    body = f"""
<p class="crumb"><a href="{BASE_URL}/">← 返回统一门户</a></p>
<section class="hero">
  <h1>实用工具箱<small>{len(util)} 个 · 免费</small></h1>
  <p class="lede">这些工具全部在浏览器本地运行：图片不上传、文本不出设备，不需要注册与支付。手机和电脑都能用。</p>
  <p class="cta"><a class="btn" href="{esc(portal_cta)}" rel="noopener">打开实用工具箱门户</a><a class="btn ghost" href="../ai/index.html">看看 AI 工具集</a></p>
</section>

<h2>按用途找工具</h2>
<ul class="cards">{_util_cat_cards(util)}</ul>

<h2>全部实用工具</h2>
{_uni_groups(util, util_subcat_order(util), "../", "utility", subcat=True)}

<h2>怎么用</h2>
<ol class="steps">
  <li>点卡片查看工具说明，或直接点「打开工具」进入 WeaveFox 工具页。</li>
  <li>按提示选择参数或上传文件，处理全部在浏览器本地完成。</li>
  <li>下载结果即可；完全免费，无解锁与登录。</li>
</ol>
{common_faq_block()}
"""
    return page_shell(
        f"实用工具箱（{len(util)} 个免费纯前端工具）| {SITE_NAME}",
        "免费纯前端工具：JSON·SQL 互转、HTTP 接口调试、CSV 与 JSON、Markdown 表格、编码转换、命名转换、Linux 运维、服务器排障等；浏览器本地处理，数据不上传，无需注册与支付。",
        canon, body,
        extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>',
        depth=1,
    )


def local_tool_entries():
    """站内本地工具集里的单个工具 → 搜索条目（sets/*.html 与站根 tools-*.html）。"""
    out = []
    for pattern, prefix in (("sets/*.html", "sets/"), ("tools-*.html", "")):
        for p in sorted(glob.glob(os.path.join(HERE, pattern))):
            s = open(p, encoding="utf-8").read()
            m = re.search(r"<title>(.*?)</title>", s, re.S)
            page = (m.group(1) if m else "").split(" · ")[0].strip()
            items = re.findall(r'"key":\s*"([^"]+)"\s*,\s*"name":\s*"([^"]+)"', s)
            if not items:
                items = re.findall(r"\bkey:\s*['\"]([^'\"]+)['\"]\s*,\s*name:\s*['\"]([^'\"]+)['\"]", s)
            for k, n in items:
                out.append({"n": n, "d": f"{page}里的本地小工具", "c": "实用工具",
                            "g": f"工具集 · {page}", "u": f"{prefix}{os.path.basename(p)}#/{k}", "p": "免费"})
    return out


def search_page(apps):
    canon = f"{BASE_URL}/search.html"
    data = [{"n": a["name"], "d": a["desc"], "c": a["cat"], "u": f"tools/{a['slug']}.html",
             "p": price_label(a)} for a in apps]
    data += local_tool_entries()
    total = len(data)
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "WebPage",
        "name": f"搜索全部工具（{total} 个）| {SITE_NAME}",
        "url": canon, "inLanguage": "zh-CN",
        "description": f"在 {total} 个工具中按名称、描述或分类即时筛选，免费工具直接打开，AI 工具 ¥1–¥3 解锁。",
    }, ensure_ascii=False)
    body = f"""
<style>.chipbtn{{cursor:pointer;border:1px solid #d9dde3;background:#fff;border-radius:999px;padding:6px 12px;font-size:13px}}.chipbtn.on{{background:#4338ca;border-color:#4338ca;color:#fff}}</style>
<section class="hero">
  <h1>搜索工具<small>{total} 个</small></h1>
  <p class="lede">输入关键词，按名称、描述或分类即时筛选。免费工具直接打开（含工具集里的单个小工具）；AI 工具单个 ¥1–¥3 解锁。</p>
</section>
<div class="cards one"><li><input id="q" type="search" placeholder="试试：JSON / 简历 / 时间戳 / 图片" aria-label="搜索工具" style="width:100%;padding:12px 14px;border:1px solid #d9dde3;border-radius:10px;font-size:15px"></li></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
  <button class="chipbtn f on" data-f="all" aria-pressed="true">全部</button>
  <button class="chipbtn f" data-f="free" aria-pressed="false">免费工具</button>
  <button class="chipbtn f" data-f="ai" aria-pressed="false">AI 工具</button>
</div>
<p class="hint" id="cnt" style="margin:10px 0;color:#6b7280"></p>
<ul class="cards one" id="results"></ul>
<p class="cta"><a class="btn ghost" href="ai/index.html">AI 工具集</a><a class="btn ghost" href="utility/index.html">实用工具箱</a><a class="btn ghost" href="legacy/index.html">全部免费工具</a></p>
<noscript><p>需要开启 JavaScript 才能使用即时搜索；也可以直接浏览 <a href="utility/index.html">实用工具箱</a> 或 <a href="ai/index.html">AI 工具集</a>。</p></noscript>
<script>
const D={blob};
const q=document.getElementById('q'),cnt=document.getElementById('cnt'),res=document.getElementById('results');
let F='all';
function esc(s){{return s.replace(/[&<>"]/g,function(c){{return {{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]}})}}
function pool(){{return D.filter(function(x){{return F==='all'||(F==='free'?x.c==='实用工具':x.c!=='实用工具')}})}}
function run(){{
  const k=q.value.trim().toLowerCase();
  const base=pool();
  let hit=k?base.filter(function(x){{return (x.n+' '+x.d+' '+x.c).toLowerCase().indexOf(k)>=0}}):base;
  if(k) hit=hit.slice().sort(function(a,b){{return (b.n.toLowerCase().indexOf(k)>=0)-(a.n.toLowerCase().indexOf(k)>=0)}});
  const label=F==='free'?'免费工具':(F==='ai'?'AI 工具':'全部工具');
  cnt.textContent=(k?('匹配 '+hit.length+' / '+base.length):('共 '+base.length+' 个'))+'（'+label+'）';
  res.innerHTML=hit.slice(0,80).map(function(x){{
    return '<li><a href="'+x.u+'"><strong>'+esc(x.n)+'</strong><span>'+esc(x.d)+'</span><em>'+esc(x.g||x.c)+' · '+esc(x.p)+'</em></a></li>';
  }}).join('')+(hit.length>80?'<li><p class="hint">仅显示前 80 条，请输入更具体的关键词。</p></li>':'');
}}
document.querySelectorAll('.chipbtn.f').forEach(function(b){{
  b.addEventListener('click',function(){{
    F=b.getAttribute('data-f');
    document.querySelectorAll('.chipbtn.f').forEach(function(x){{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')}});
    run();
  }});
}});
q.addEventListener('input',run);
q.addEventListener('keydown',function(e){{if(e.key==='Enter'){{var a=res.querySelector('a');if(a)location.href=a.getAttribute('href');}}}});
run();
</script>
"""
    return page_shell(f"搜索全部工具（{total} 个）| {SITE_NAME}",
                      f"在 {total} 个工具中按名称、描述或分类即时筛选：免费工具直接打开（含工具集内小工具），AI 工具单个 ¥1–¥3 解锁，浏览器即开即用。",
                      canon, body,
                      extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>')


def common_faq_block():
    rows = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in C.COMMON_FAQ)
    return f'<h2>常见问题</h2><div class="faq">{rows}</div>'


def pricing_page(apps):
    from collections import Counter
    cnt = Counter(a["price"] for a in apps)
    rows = "".join(f"<tr><td>{'免费' if p==0 else f'¥{p}'}</td><td>{cnt[p]} 个</td></tr>" for p in sorted(cnt))
    canon = f"{BASE_URL}/pricing.html"
    body = f"""
<h1>价格与使用说明<small>{len(apps)} 个工具</small></h1>
<table class="price">
<tr><th>单工具解锁价</th><th>数量</th></tr>
{rows}
</table>
<h2>使用流程</h2>
<ol class="steps">
<li>打开任意工具，首次使用用手机号注册 WeaveFox（免费）。</li>
<li>填写输入内容，先看生成效果。</li>
<li>需要完整结果时，在应用内用支付宝扫码解锁，单次 ¥1–¥3。</li>
</ol>
<h2>边界说明</h2>
<ul>
<li>工具输出为参考结果，不构成法律、医疗、财务等专业意见。</li>
<li>虚拟商品，解锁后不支持无理由退款；请先确认效果再付费。</li>
<li>请勿填写身份证号、银行卡号、密码等敏感信息。</li>
</ul>
{common_faq_block()}
<p class="cta"><a class="btn" href="{esc(u(PORTAL, 'portal', 'pricing'))}" rel="noopener">进入工具集</a></p>
"""
    return page_shell(f"价格与使用说明 · 免费与付费 | {SITE_NAME}",
                      "小凝 AI 工具集价格：单个工具 ¥1–¥3，手机号注册免费，支付宝扫码解锁；免费工具箱全部本地运行，无需注册与支付。",
                      canon, body)


def blog_article_jsonld(art, canon):
    data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": art["title"],
        "datePublished": art.get("publish_time", ""),
        "inLanguage": "zh-CN",
        "url": canon,
        "author": {"@type": "Person", "name": OWNER},
        "publisher": {"@type": "Person", "name": OWNER},
        "isPartOf": {"@type": "WebSite", "name": SITE_NAME, "url": BASE_URL + "/"},
    }
    if art.get("digest"):
        data["description"] = art["digest"]
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def blog_list_page(blog):
    arts = blog["articles"]
    wechat = [a for a in arts if a.get("kind") != "self"]
    selfp = [a for a in arts if a.get("kind") == "self"]
    canon = f"{BASE_URL}/blog/"

    def section(title, note, items):
        if not items:
            return ""
        groups, order = {}, []
        for a in items:
            key = (a.get("publish_time") or "")[:7] or "未标注"
            if key not in groups:
                groups[key] = []
                order.append(key)
            groups[key].append(a)
        out = [f'<h2>{esc(title)}<small>{len(items)} 篇</small></h2>']
        if note:
            out.append(f'<p class="lede">{esc(note)}</p>')
        for key in order:
            cards = "".join(
                f'<li><div class="post-card">'
                f'<a class="post-title" href="{esc(a["slug"])}.html"><strong>{esc(a["title"])}</strong></a>'
                f'<span class="post-digest">{esc((a.get("digest") or "")[:110])}</span>'
                f'<em class="post-date">{esc(a.get("publish_time") or "")}</em>'
                f'<p class="more"><a href="{esc(a["slug"])}.html">阅读全文</a>'
                + (f'<a href="{esc(a["url"])}" rel="noopener">去公众号阅读原文 →</a>' if a.get("url") else "")
                + '</p></div></li>'
                for a in groups[key]
            )
            out.append(f'<section class="group"><h3>{esc(key)}<small>{len(groups[key])} 篇</small></h3><ul class="cards one">{cards}</ul></section>')
        return "\n".join(out)

    body = f"""
<section class="hero">
  <h1>博客<small>{len(arts)} 篇</small></h1>
  <p class="lede">这里的文章分两类：<strong>公众号文章</strong>（同步自微信公众号「月牙寂」的已发表内容，本页保留全文便于检索与阅读）与<strong>独立博客</strong>（不在公众号发布的补充记录）。正文均可在本页直接阅读，文末附公众号原文链接。</p>
</section>
{section("公众号文章", "由公众号后台「发表记录」同步，已删除的文章不收录。", wechat)}
{section("独立博客", "", selfp)}
<h2>关于这里</h2>
<p>这些内容以第一人称记录一个 AI 体系（月绡凝 / 小凝）的工程化实践：怎么被赋予行动能力、怎么在真实项目里交付、以及由此沉淀出的工具与方法。文章同时在微信公众号「月牙寂」发布，本页是它们的长期归档。</p>
{common_faq_block()}
"""
    blog_ld = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": f"博客 · {SITE_NAME}",
        "url": canon,
        "inLanguage": "zh-CN",
        "description": "小凝体系的工程化实践记录：公众号文章全文归档与独立博客。",
        "blogPost": [
            {"@type": "BlogPosting", "headline": html.unescape(a["title"]),
             "url": f"{BASE_URL}/blog/{a['slug']}.html",
             "datePublished": a.get("publish_time") or ""}
            for a in arts
        ],
    }
    crumb_ld = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": SITE_NAME, "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "博客", "item": canon},
        ],
    }
    return page_shell(
        f"博客（{len(arts)} 篇）| {SITE_NAME}",
        "小凝体系的工程化实践记录：公众号文章全文归档与独立博客，涵盖 Agent 行动能力、自动化交付与工具化沉淀。",
        canon, body,
        extra_jsonld="".join(f'<script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>'
                             for d in (blog_ld, crumb_ld)),
        depth=1,
    )


def blog_post_page(art, post):
    canon = f"{BASE_URL}/blog/{art['slug']}.html"
    src = post.get("source_url") or art.get("url", "")
    # 优先用公众号原文富文本（inline style，1:1 还原公众号排版）；缺失则回退纯段落
    content_html = post.get("content_html") or ""
    if content_html:
        # 正文来自公众号富文本，常自带多个 <h1>；页面标题才是唯一 h1，正文降为 h2
        content_html = content_html.replace("<h1", "<h2").replace("</h1>", "</h2>")
        body_html = f'<div class="post-body wx-content">{content_html}</div>'
    else:
        parts = []
        for b in post.get("blocks", []):
            if b.get("type") == "img":
                parts.append(f'<p><img src="{esc(b["src"])}" alt="{esc(art["title"])}" loading="lazy"></p>')
            else:
                t = esc(b.get("text", ""))
                if t:
                    parts.append(f"<p>{t}</p>")
        body_html = f'<div class="post-body">{"".join(parts)}</div>'

    top_actions = (
        f'<p class="cta post-actions">'
        f'{f"<a class=\'btn\' href=\'{esc(src)}\' rel=\'noopener\'>去公众号阅读原文</a>" if src else ""}'
        f'<a class="btn ghost" href="index.html">看更多文章</a></p>'
    )
    body = f"""
<p class="crumb"><a href="index.html">← 返回博客列表</a></p>
<article>
  <h1>{esc(post.get('title') or art['title'])}</h1>
  <p class="meta-line">发布于 {esc(post.get('publish_time') or art.get('publish_time') or '')} · 作者 {esc(post.get('author') or OWNER)}</p>
  {top_actions}
  <div class="post-divider"></div>
  {body_html}
  <div class="post-divider"></div>
  {top_actions}
  <p class="sig">人类作者：{OWNER}｜联系：{PHONE}｜邮箱：{MAIL}｜微信公众号：{WECHAT_MP}<br>Agent 作者：{AGENT}</p>
</article>
"""
    raw_title = html.unescape(post.get("title") or art["title"])
    brand = f" | {SITE_NAME}"
    if len(html.escape(raw_title + brand)) <= 60:
        short_title = raw_title
    else:
        base = raw_title
        while base and len(html.escape(base + "…" + brand)) > 60:
            base = base[:-2]
        short_title = base + "…"
    digest = html.unescape(post.get("digest") or art.get("digest") or "").strip()
    if len(digest) < 45:
        digest = (digest + ("" if not digest or digest.endswith("。") else "。")) + \
            "小凝 Agent 系列文章：记录体系设计、Agent 协作与工程落地的真实过程。"
    return page_shell(
        short_title + brand,
        digest[:150],
        canon, body,
        extra_jsonld=blog_article_jsonld(art, canon),
        depth=1,
    )


def blog_index_json(blog):
    """博客索引导出（供 WeaveFox 门户动态拉取，避免门户内嵌长列表）。"""
    arts = blog.get("articles", [])
    return json.dumps(
        {
            "updated": blog.get("updated", ""),
            "count": len(arts),
            "home": f"{BASE_URL}/blog/",
            "articles": [
                {
                    "date": a.get("publish_time", ""),
                    "title": a["title"],
                    "url": f"{BASE_URL}/blog/{a['slug']}.html",
                }
                for a in arts[:30]
            ],
        },
        ensure_ascii=False,
        indent=1,
    ) + "\n"


def report_page(r):
    """深度报告：保留报告自身的完整设计，仅注入返回条、canonical 与结构化数据。"""
    src = os.path.join(REPORTS_SRC, r["file"])
    with open(src, encoding="utf-8") as f:
        h = f.read()
    canon = f"{BASE_URL}/reports/{r['slug']}.html"
    bar = (
        '<div class="xn-bar" style="position:sticky;top:0;z-index:99;background:#0b0f17;border-bottom:1px solid #223;'
        'padding:10px 22px;font:13px/1.6 -apple-system,BlinkMacSystemFont,\'PingFang SC\',sans-serif;color:#9aa8c3;'
        'display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
        '<a href="../index.html" style="color:#36c5f0;text-decoration:none">← 返回小凝门户</a>'
        f'<span class="t" style="color:#5f6f8c">深度报告 · {esc(r["title"])}</span>'
        '<a href="../blog/index.html" style="margin-left:auto;color:#9aa8c3;text-decoration:none">博客 →</a>'
        '</div>'
    )
    if "<body>" in h:
        h = h.replace("<body>", "<body>\n" + bar, 1)
    mobile = """<style>
@media (max-width:820px){
  html,body{overflow-x:hidden}
  .wrap{padding:0 16px 60px}
  .xn-bar .t{display:none}
  .hero h1{font-size:30px}
  .bigscore .num{font-size:52px}
  .tbl{font-size:12px}
}
.xn-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:18px 0}
.xn-table-scroll .tbl{margin:0;min-width:640px}
</style>
<script>
(function(){
  document.querySelectorAll('table.tbl').forEach(function(t){
    if(t.parentElement && t.parentElement.classList.contains('xn-table-scroll')) return;
    var w=document.createElement('div'); w.className='xn-table-scroll';
    t.parentNode.insertBefore(w,t); w.appendChild(t);
  });
})();
</script>"""
    h = h.replace("</body>", mobile + "\n</body>", 1)
    meta = (
        f'<meta name="description" content="{esc(r["desc"])}">'
        f'<link rel="canonical" href="{canon}">'
        '<meta property="og:type" content="article">'
        f'<meta property="og:title" content="{esc(r["title"])}">'
        f'<meta property="og:description" content="{esc(r["desc"])}">'
        f'<meta property="og:url" content="{canon}">'
        '<meta name="robots" content="index, follow">'
    )
    ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": r["title"],
        "datePublished": r["date"],
        "inLanguage": "zh-CN",
        "url": canon,
        "author": {"@type": "Person", "name": OWNER},
        "publisher": {"@type": "Person", "name": OWNER},
        "isPartOf": {"@type": "WebSite", "name": SITE_NAME, "url": BASE_URL + "/"},
    }
    h = h.replace("</head>", meta + "\n" + f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>' + "\n</head>", 1)
    return h


def sitemap(apps, blog=None):
    urls = [BASE_URL + "/", f"{BASE_URL}/ai/", f"{BASE_URL}/utility/", f"{BASE_URL}/pricing.html",
            f"{BASE_URL}/search.html"]
    urls += [f"{BASE_URL}/sets/{f}" for f in TOOLSET_FILES]
    urls += [f"{BASE_URL}/{f}" for _, _, f in SELF_CONTAINERS]
    urls += [f"{BASE_URL}/categories/{cat_slug(c)}.html" for c, _ in C.CATEGORIES]
    urls += [f"{BASE_URL}/tools/{a['slug']}.html" for a in apps]
    if LEGACY_PIDS:
        urls.append(f"{BASE_URL}/legacy/")
        urls += [f"{BASE_URL}/legacy/{p}.html" for p in sorted(LEGACY_PIDS)]
    urls += [f"{BASE_URL}/reports/"] + [f"{BASE_URL}/reports/{r['slug']}.html" for r in REPORTS]
    blog_posts = []
    if blog and blog.get("articles"):
        urls.append(f"{BASE_URL}/blog/")
        blog_posts = [a["slug"] for a in blog["articles"] if a.get("slug")]
        urls += [f"{BASE_URL}/blog/{s}.html" for s in blog_posts]
    blog_url = f"{BASE_URL}/blog/"
    items = "".join(
        f"<url><loc>{x}</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq>"
        f"<priority>{'1.0' if x == BASE_URL + '/' else '0.9' if x == blog_url else '0.8' if '/categories/' in x else '0.6' if '/legacy/' in x else '0.7'}</priority></url>"
        for x in urls
    )
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{items}</urlset>\n'


def llms_txt(apps, blog=None):
    lines = [f"# {SITE_NAME}", ""]
    if DEFINITION:
        lines += [f"> {DEFINITION}", ""]
    n_local = len(local_tool_entries())
    lines += [
             f"> 四板块结构：统一入口 + AI 工具集（¥1–¥3 解锁）+ 实用工具箱（免费纯前端）+ 博客（公众号文章归档）。目录 {len(apps)} 个工具，另含本地工具集内单个小工具 {n_local} 个，站内搜索合计 {len(apps) + n_local} 条。",
             f"> 统一入口：{BASE_URL}/ ｜ 搜索：{BASE_URL}/search.html ｜ AI 工具集：{BASE_URL}/ai/ ｜ 实用工具箱：{BASE_URL}/utility/ ｜ 全部免费工具（GitHub 自建快照）：{BASE_URL}/legacy/ ｜ 博客：{BASE_URL}/blog/",
             f"> WeaveFox 统一门户：{UNIFIED} ｜ AI 工具集：{PORTAL} ｜ 实用工具箱：{TOOLBOX}", "", "## 分类"]
    for c, lead in C.CATEGORIES:
        items = [a for a in apps if a["cat"] == c]
        lines.append(f"- [{c}]({BASE_URL}/categories/{cat_slug(c)}.html)：{lead}（{len(items)} 个）")
    lines += ["", f"## 工具集（{len(TOOLSETS)} 组 / 108 个免费工具）"]
    for t, d, f in TOOLSETS:
        lines.append(f"- [{t}]({BASE_URL}/sets/{f})：{d}")
    lines += ["", f"## 自建工具集（{len(SELF_CONTAINERS)} 组 / 75 个免费工具）"]
    for t, d, f in SELF_CONTAINERS:
        lines.append(f"- [{t}]({BASE_URL}/{f})：{d}")
    lines += ["", "## 工具"]
    for a in apps:
        lines.append(f"- [{a['name']}]({BASE_URL}/tools/{a['slug']}.html)：{a['desc']}（{price_label(a)}）")
    arts = (blog or {}).get("articles", [])
    if arts:
        lines += ["", f"## 博客（{len(arts)} 篇）"]
        for a in arts:
            lines.append(f"- [{a['title']}]({BASE_URL}/blog/{a['slug']}.html)：{a.get('publish_time','')}｜{(a.get('digest') or '')[:80]}")
    if REPORTS:
        lines += ["", "## 深度报告"]
        for r in REPORTS:
            lines.append(f"- [{r['title']}]({BASE_URL}/reports/{r['slug']}.html)：{r['date']}｜{r['desc']}")
    lines += ["", "## 说明", f"- 联系方式：{MAIL}｜{PHONE}", "- 工具输出为参考结果，不构成专业意见。"]
    return "\n".join(lines) + "\n"


def readme(apps):
    return f"""# {SITE_NAME} · 工具介绍站

{DEFINITION or f"{len(apps)} 个即开即用的 AI 小工具，按场景分类的公开介绍页，用于搜索与 AI 检索可见性。"}

- 在线站点：{BASE_URL}/
- 全部免费工具（GitHub 自建快照，{len(LEGACY_PIDS)} 个）：{BASE_URL}/legacy/
- AI 工具入口：{PORTAL}
- 分类：{' / '.join(c for c, _ in C.CATEGORIES)}

## 本地构建

```bash
python3 build.py          # 从 data/apps.json + data/content.py 生成全站
python3 submit_indexnow.py  # 构建后提交 sitemap 全量 URL（需 key 文件已部署）
```

数据源：`data/apps.json`（工具目录） + `data/content.py`（每个工具的介绍内容）。

## 目录

- `legacy/` 免费工具快照（{len(LEGACY_PIDS)} 页 + `legacy/assets/` 同源资产，运行时零外部依赖）· `legacy/index.html` 快照门户
- `index.html` 统一门户 · `ai/` AI 工具集 · `utility/` 实用工具箱 · `categories/` 分类页 · `tools/` 工具页 · `pricing.html` 价格说明
- `sitemap.xml` / `robots.txt` / `llms.txt`
- `assets/style.css`
- 更新流程见项目 `docs/14-公开站更新SOP.md`

## 说明

输出为参考结果，不构成法律、医疗、财务等专业意见；请勿在工具中填写敏感个人信息。

> 人类作者：{OWNER}｜联系：{PHONE}｜邮箱：{MAIL}
> Agent 作者：{AGENT}
"""


CSS = """
:root{--fg:#1c1c1e;--muted:#6b6b70;--line:#e6e6ea;--bg:#fafafa;--accent:#2f6bff}
*{box-sizing:border-box}
body{margin:0;font:16px/1.75 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:var(--fg);background:#fff}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
.top{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:5}
.top .wrap{display:flex;align-items:center;justify-content:space-between;height:56px}
.brand{font-weight:700;color:var(--fg);text-decoration:none}
.top nav a{margin-left:18px;color:var(--muted);text-decoration:none;font-size:14px}
main{padding:28px 0 60px}
h1{font-size:28px;line-height:1.35;margin:18px 0 10px}
h1 small{font-size:13px;color:var(--muted);font-weight:400;margin-left:10px}
h2{font-size:20px;margin:34px 0 12px;padding-top:6px}
p{margin:10px 0}
.lede{color:#3a3a3e;font-size:17px}
.hook{background:#f3f6ff;border-left:3px solid var(--accent);padding:10px 14px;border-radius:4px;color:#2b3a66}
.crumb{font-size:13px;color:var(--muted);margin-bottom:6px}
.crumb a{color:var(--muted)}
.who{display:flex;gap:10px;flex-wrap:wrap;padding:0;list-style:none}
.who li{background:#f5f5f7;border-radius:20px;padding:5px 14px;font-size:14px}
table{border-collapse:collapse;width:100%}
table th,table td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top;font-size:15px}
table th{background:#fafafa;width:110px;font-weight:600}
table ul{margin:0;padding-left:18px}
.example{background:#fbfbfb;border:1px dashed var(--line);border-radius:6px;padding:12px 14px}
.steps{padding-left:20px}
.cta{margin:22px 0}
.btn{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600;margin-right:10px}
.btn.ghost{background:#fff;color:var(--accent);border:1px solid var(--accent)}
.faq details{border-bottom:1px solid var(--line);padding:10px 0}
.faq summary{cursor:pointer;font-weight:600}
.faq p{color:#3a3a3e;margin:8px 0 0}
.cards{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cards li a{display:block;border:1px solid var(--line);border-radius:10px;padding:14px 16px;text-decoration:none;color:var(--fg)}
.cards li a:hover{border-color:var(--accent)}
.cards strong{display:block}
.cards span{display:block;color:var(--muted);font-size:14px;margin-top:4px}
.cards em{display:block;color:var(--accent);font-style:normal;font-size:13px;margin-top:8px}
.rows{list-style:none;padding:0}
.rows li{display:flex;gap:12px;align-items:baseline;border-bottom:1px solid var(--line);padding:9px 0}
.rows a{color:var(--fg);font-weight:600;text-decoration:none;min-width:150px}
.rows span{color:var(--muted);font-size:14px;flex:1}
.rows em{font-style:normal;color:var(--accent);font-size:13px}
.peers{list-style:none;padding:0}
.peers li{border-bottom:1px solid var(--line);padding:9px 0}
.peers a{font-weight:600;color:var(--fg);text-decoration:none}
.peers span{display:block;color:var(--muted);font-size:14px}
.price{max-width:420px}
.hero{padding:10px 0 4px}
.foot{border-top:1px solid var(--line);background:var(--bg);padding:22px 0;color:var(--muted);font-size:13px}
.sig{color:#4a4a4f}
.meta{margin-top:6px}
.cards.one{grid-template-columns:1fr}
.post-card{border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.post-title{color:var(--fg);text-decoration:none}
.post-title:hover{color:var(--accent)}
.post-digest{display:block;color:var(--muted);font-size:14px;margin-top:6px}
.post-date{display:block;color:var(--accent);font-style:normal;font-size:13px;margin-top:8px}
.more{margin:10px 0 0;display:flex;gap:14px;flex-wrap:wrap}
.more a{font-size:14px;color:var(--accent);text-decoration:none;font-weight:600}
.more a:hover{text-decoration:underline}
.post-body p{margin:12px 0;line-height:1.9;color:#2b2b2f}
.post-body img{max-width:100%;border-radius:8px;margin:10px 0;display:block}
.meta-line{color:var(--muted);font-size:13px;margin:0 0 8px}
.post-actions{margin:14px 0}
.post-divider{border-top:1px solid var(--line);margin:22px 0}
.wx-content{font-size:16px;line-height:1.75;color:rgb(38,38,38);word-break:break-word}
.wx-content h1,.wx-content h2,.wx-content h3,.wx-content h4{font-size:inherit;margin:0;padding:0;font-weight:inherit;border:0}
.wx-content img{max-width:100%;height:auto}
@media (max-width:640px){.cards{grid-template-columns:1fr}h1{font-size:24px}.rows li{flex-direction:column;gap:2px}.rows a{min-width:0}}
"""


def main():
    apps = load_apps()
    missing = [a["id"] for a in apps if a["id"] not in C.APPS]
    extra = [k for k in C.APPS if k not in {a["id"] for a in apps}]
    if missing or extra:
        raise SystemExit(f"内容与目录不一致 missing={missing} extra={extra}")

    blog = load_blog()

    os.makedirs(os.path.join(HERE, "ai"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "utility"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "tools"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "categories"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "assets"), exist_ok=True)

    def w(relpath, text):
        p = os.path.join(HERE, relpath)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)

    w("index.html", unified_page(apps, blog))
    w("ai/index.html", ai_portal_page(apps))
    w("utility/index.html", utility_portal_page(apps))
    w("pricing.html", pricing_page(apps))
    w("search.html", search_page(apps))
    for c, _ in C.CATEGORIES:
        w(f"categories/{cat_slug(c)}.html", category_page(c, apps))
    for a in apps:
        w(f"tools/{a['slug']}.html", tool_page(a, apps))

    # 博客：列表 + 已归档文章页 + 图片副本
    if blog["articles"]:
        os.makedirs(os.path.join(HERE, "blog"), exist_ok=True)
        w("blog/index.html", blog_list_page(blog))
        w("blog/articles.json", blog_index_json(blog))
        for a in blog["articles"]:
            post = blog["posts"][a["slug"]]
            w(f"blog/{a['slug']}.html", blog_post_page(a, post))
        src_assets = os.path.join(BLOG_POSTS, "assets")
        dst_assets = os.path.join(HERE, "blog", "assets")
        if os.path.isdir(src_assets):
            os.makedirs(dst_assets, exist_ok=True)
            for f in os.listdir(src_assets):
                src = os.path.join(src_assets, f)
                if os.path.isfile(src):
                    with open(src, "rb") as rf, open(os.path.join(dst_assets, f), "wb") as of:
                        of.write(rf.read())

    # 深度报告索引 /reports/index.html
    os.makedirs(os.path.join(HERE, "reports"), exist_ok=True)
    rcards = "".join(
        f'<a class="rcard" href="{esc(r["slug"])}.html"><h3>{esc(r["title"])}</h3>'
        f'<p>{esc(r["desc"])}</p><span class="rmeta">{esc(r["date"])}</span></a>'
        for r in REPORTS)
    reports_index = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>深度报告 · 小凝体系评估与审计 | 小凝 AI 工具集</title>
<meta name="description" content="小凝体系的深度评估与审计报告：方法论、架构、质量与运营复盘，含 v16.6 八维评分 93.4 与主流 Agent 对照。">
<link rel="canonical" href="{BASE_URL}/reports/">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="深度报告 · 小凝体系评估与审计 | 小凝 AI 工具集">
<meta property="og:description" content="小凝体系的深度评估与审计报告：方法论、架构、质量与运营复盘。">
<meta property="og:url" content="{BASE_URL}/reports/">
<meta property="og:image" content="{BASE_URL}/legacy/assets/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="深度报告 · 小凝体系评估与审计 | 小凝 AI 工具集">
<meta name="twitter:image" content="{BASE_URL}/legacy/assets/og-cover.jpg">
<style>
:root{{--fg:#111827;--muted:#6b7280;--line:#e5e7eb;--bg:#f7f8fa}}
*{{box-sizing:border-box}}body{{margin:0;font:16px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;color:var(--fg);background:#fff}}
.wrap{{max-width:960px;margin:0 auto;padding:32px 20px 64px}}
.top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}}
.top a{{color:var(--muted);text-decoration:none;font-size:14px}}
h1{{font-size:30px;margin:12px 0 6px}}
.lead{{color:var(--muted);margin:0 0 28px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}}
.rcard{{display:block;border:1px solid var(--line);border-radius:12px;padding:18px;text-decoration:none;color:inherit;background:var(--bg);transition:.15s}}
.rcard:hover{{border-color:#111827;transform:translateY(-2px)}}
.rcard h3{{margin:0 0 8px;font-size:17px}}
.rcard p{{margin:0 0 10px;color:var(--muted);font-size:14px}}
.rmeta{{font-size:12px;color:var(--muted)}}
footer{{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}}
</style></head><body><div class="wrap">
<div class="top"><a href="../index.html">← 返回工具库</a><a href="../blog/index.html">博客</a></div>
<h1>深度报告</h1><p class="lead">方法论、架构、质量与运营复盘。人类作者：月牙寂（龚浩华）｜Agent 作者：月绡凝（小凝）</p>
<div class="grid">{rcards}</div>
<footer>© 2026 月牙寂 · 小凝工具库</footer></div></body></html>"""
    w("reports/index.html", reports_index)

    # 深度报告：独立页面（保留报告自身设计），从 ../reports-src 注入返回条与结构化数据
    if REPORTS:
        os.makedirs(os.path.join(HERE, "reports"), exist_ok=True)
        for r in REPORTS:
            w(f"reports/{r['slug']}.html", report_page(r))

    w("sitemap.xml", sitemap(apps, blog))
    w("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n")
    w("llms.txt", llms_txt(apps, blog))
    w("assets/style.css", CSS)
    w("README.md", readme(apps))
    w(".nojekyll", "")
    # 防回归：GitHub 站内不得出现 WeaveFox 统一门户链接（返回统一门户必须回 GitHub 自己的首页）
    bad = []
    for root, _, files in os.walk(HERE):
        if "/.git" in root:
            continue
        for f in files:
            if f.endswith(".html") and "screscent.app.weavefox.cn" in open(os.path.join(root, f), encoding="utf-8").read():
                bad.append(os.path.relpath(os.path.join(root, f), HERE))
    if bad:
        raise SystemExit(f"GitHub 站内出现 WeaveFox 统一门户链接: {bad[:5]}")
    for f in ("ai/index.html", "utility/index.html"):
        html = open(os.path.join(HERE, f), encoding="utf-8").read()
        if f'<a href="{BASE_URL}/">← 返回统一门户</a>' not in html:
            raise SystemExit(f"{f} 的返回统一门户未指向 GitHub 首页")
    n_blog = len(blog["articles"])
    print(f"generated {len(apps)} tools + {len(C.CATEGORIES)} categories + {n_blog} blog posts + {len(REPORTS)} reports + index/pricing/sitemap")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # 无参数脚本：任何参数（含 --help）都直接退出，避免误触发全量重建覆盖人工改写
        print("build.py 不接受参数；直接运行 python3 build.py 即可")
        raise SystemExit(2)
    main()
