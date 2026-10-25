# -*- coding: utf-8 -*-
"""静态站生成器：读取 apps.json + content.py，生成 GitHub Pages 站点。

用法：python3 build.py
输出：index.html / categories/*.html / tools/*.html / pricing.html / sitemap.xml / robots.txt / llms.txt
"""
import json
import os
import html
import sys
import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
APPS_JSON = os.path.join(DATA, "apps.json")
sys.path.insert(0, DATA)

BASE_URL = "https://screscent.github.io/xiaoning-ai-tools"
SITE_NAME = "小凝 AI 工具集"
PORTAL = "https://rdndxd4t4r.app.weavefox.cn"
UNIFIED = "https://screscent.app.weavefox.cn"
TOOLBOX = "https://7bpgquweb7.app.weavefox.cn"

# 实用工具「按用途」分组（新增工具时在此补映射；未命中归入「其他」）
UTIL_GROUPS = [
    ("图片与文件", {"image-compressor"}),
    ("金融计算", {"mortgage-calculator"}),
    ("编码与链接", {"qr-generator"}),
]
OWNER = "月牙寂（龚浩华）"
AGENT = "月绡凝（小凝）"
PHONE = "15980989344"
MAIL = "29185807@qq.com"
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


def page_shell(title, desc, canonical, body, extra_jsonld="", depth=0):
    pre = "../" * depth
    nav = f"""<header class="top">
  <div class="wrap">
    <a class="brand" href="{pre}index.html">{SITE_NAME}</a>
    <nav><a href="{pre}index.html">统一门户</a><a href="{pre}ai/index.html">AI 工具集</a><a href="{pre}utility/index.html">实用工具箱</a><a href="{pre}pricing.html">价格与使用</a></nav>
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
    <p class="sig">人类作者：{OWNER}｜联系：{PHONE}｜邮箱：{MAIL}<br>Agent 作者：{AGENT}</p>
    <p class="meta">本站为工具介绍与入口页，工具本体运行于 WeaveFox；更新于 {TODAY}。</p>
  </div>
</footer>
</body>
</html>
"""


def rel(path):
    return path


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
        "url": a["url"],
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


def tool_page(a, apps):
    c = C.APPS[a["id"]]
    _, hook, w1, w2, w3, inputs, output, example, fq, fa = c
    canon = f"{BASE_URL}/tools/{a['slug']}.html"
    peers = [x for x in apps if x["cat"] == a["cat"] and x["id"] != a["id"]][:3]
    peers_html = "".join(
        f'<li><a href="{x["slug"]}.html">{esc(x["name"])}</a><span>{esc(x["desc"])}</span></li>'
        for x in peers
    )
    faq_html = "".join(
        f'<details><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>'
        for q, ans in (C.COMMON_FAQ + [(fq, fa)])
    )
    inputs_html = "".join(f"<li>{esc(i)}</li>" for i in inputs)
    body = f"""
<nav class="crumb"><a href="../index.html">工具集</a> › <a href="../categories/{cat_slug(a['cat'])}.html">{esc(a['cat'])}</a> › <span>{esc(a['name'])}</span></nav>
<article>
  <h1>{esc(a['name'])}<small>{esc(a['cat'])}</small></h1>
  <p class="hook">{esc(hook)}</p>
  <p class="lede"><strong>{esc(a['name'])}</strong> 是一个即开即用的 AI 小工具：{esc(a['desc'])}。不需要安装，浏览器打开就能用。</p>

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
    <li>点下面的按钮打开工具（首次使用需手机号注册，免费）。</li>
    <li>按提示填写上面的信息，点生成。</li>
    <li>{'复制或下载结果即可；本工具完全免费，无需解锁。' if a.get('price',0)==0 else "复制结果；需要继续用同一个工具时，在应用内解锁完整功能（¥%s）。" % a['price']}</li>
  </ol>

  <p class="cta"><a class="btn" href="{esc(u(a['url'], 'cta', a['slug']))}" rel="noopener">打开 {esc(a['name'])}（{price_label(a)}）</a></p>

  <h2>常见问题</h2>
  <div class="faq">{faq_html}</div>

  <h2>同分类的其他工具</h2>
  <ul class="peers">{peers_html}</ul>
</article>
"""
    return page_shell(
        f"{a['name']} - {a['cat']} AI 工具 | {SITE_NAME}",
        f"{a['desc']}。{a['name']}：{output}" + ("，完全免费，浏览器即开即用。" if a.get("price",0)==0 else f"，¥{a['price']} 解锁，浏览器即开即用。"),
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
    return page_shell(
        f"{cat} AI 工具（{len(items)} 个）| {SITE_NAME}",
        f"{lead} 共 {len(items)} 个工具，浏览器即开即用，单个 ¥1–¥3 解锁。",
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


def unified_page(apps):
    n_util = len([a for a in apps if a["cat"] == "实用工具"])
    n_ai = len(apps) - n_util
    canon = BASE_URL + "/"
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "WebSite", "name": SITE_NAME,
        "url": canon, "inLanguage": "zh-CN",
        "description": "统一入口：AI 工具集与免费实用工具箱。",
    }, ensure_ascii=False)
    body = f"""
<section class="hero">
  <h1>{SITE_NAME} · 统一入口</h1>
  <p class="lede">两类工具，一个入口：<strong>AI 工具集</strong>负责把材料变成可直接使用的结果；<strong>实用工具箱</strong>用纯前端完成转换与计算，完全免费、数据不上传。</p>
</section>

<h2>选择工具集</h2>
<ul class="cards">
  <li><a href="ai/index.html"><strong>AI 工具集</strong><span>简历匹配、面试题、周报、会议纪要、PPT 大纲、小红书文案、SQL 优化等，生成类工具，单个 ¥1–¥3 解锁。</span><em>进入 →</em></a></li>
  <li><a href="utility/index.html"><strong>实用工具箱 · 免费</strong><span>图片压缩改尺寸、房贷提前还款计算器、二维码生成器——浏览器本地处理，数据不上传，完全免费。</span><em>进入 →</em></a></li>
</ul>

<h2>常用入口</h2>
<p class="cta"><a class="btn" href="ai/index.html">AI 工具集</a><a class="btn" href="utility/index.html">实用工具箱</a><a class="btn ghost" href="pricing.html">价格与使用说明</a></p>

<h2>工作方式</h2>
<p>AI 工具在 WeaveFox 应用内运行，首次使用手机号注册（免费），按需解锁单个功能；实用工具完全在浏览器本地运行，无需支付。两套工具都由同一套内容源维护，页面只做介绍与入口。</p>
{common_faq_block()}
"""
    return page_shell(
        f"{SITE_NAME} - 统一入口（AI 工具集 + 实用工具箱）",
        "统一入口：AI 工具集（单个 ¥1–¥3 解锁）与免费实用工具箱（图片压缩、房贷计算、二维码），浏览器即开即用。",
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
<p class="crumb"><a href="../index.html">← 返回统一门户</a></p>
<section class="hero">
  <h1>AI 工具集<small>{len(ai_apps)} 个</small></h1>
  <p class="lede">{len(ai_apps)} 个即开即用的 AI 小工具，覆盖职场、求职、教育、自媒体、电商、研发与生活七类场景。手机号注册即用，单个工具 ¥1–¥3 解锁。</p>
  <p class="cta"><a class="btn" href="{esc(u(PORTAL, 'portal', 'ai-home'))}" rel="noopener">打开 AI 工具集门户</a><a class="btn ghost" href="../utility/index.html">看看免费工具箱</a></p>
</section>

<h2>按场景找工具</h2>
<ul class="cards">{_cat_cards(ai_apps, "../", cats)}</ul>

<h2>全部 AI 工具</h2>
{_groups(ai_apps, "../", cats)}

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
        "description": "纯前端免费工具：图片压缩改尺寸、房贷提前还款计算器、二维码生成器；本地处理，数据不上传。",
    }, ensure_ascii=False)
    def card(a):
        return (f'<li><a href="{esc(u(a["url"], "utility", a["slug"]))}" rel="noopener">'
                f'<strong>{esc(a["name"])}</strong><span>{esc(a["desc"])}</span><em>免费</em></a>'
                f'<p class="steps"><a href="../tools/{a["slug"]}.html">查看说明页</a></p></li>')
    groups = ""
    used = set()
    for gname, slugs in UTIL_GROUPS:
        items = [a for a in util if a["slug"] in slugs]
        used |= {a["id"] for a in items}
        if not items:
            continue
        groups += (f'<section class="group"><h2>{esc(gname)}<small>{len(items)} 个</small></h2>'
                   f'<ul class="cards">{"".join(card(a) for a in items)}</ul></section>')
    rest = [a for a in util if a["id"] not in used]
    if rest:
        groups += (f'<section class="group"><h2>其他<small>{len(rest)} 个</small></h2>'
                   f'<ul class="cards">{"".join(card(a) for a in rest)}</ul></section>')
    body = f"""
<p class="crumb"><a href="../index.html">← 返回统一门户</a></p>
<section class="hero">
  <h1>实用工具箱<small>{len(util)} 个 · 免费</small></h1>
  <p class="lede">这些工具全部在浏览器本地运行：图片不上传、文本不出设备，不需要注册与支付。手机和电脑都能用。</p>
</section>

<h2>按用途找工具</h2>
{groups}

<h2>怎么用</h2>
<ol class="steps">
  <li>点工具卡片直接打开 WeaveFox 工具页（国内访问速度稳定）。</li>
  <li>按提示选择参数或上传文件，处理在本地完成。</li>
  <li>下载结果即可；完全免费，无解锁与登录。</li>
</ol>
{common_faq_block()}
"""
    return page_shell(
        f"实用工具箱（{len(util)} 个免费纯前端工具）| {SITE_NAME}",
        "免费纯前端工具：图片压缩改尺寸、房贷提前还款计算器、二维码生成器；浏览器本地处理，数据不上传，无需注册与支付。",
        canon, body,
        extra_jsonld=f'<script type="application/ld+json">{jsonld}</script>',
        depth=1,
    )


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
    return page_shell(f"价格与使用说明 | {SITE_NAME}",
                      "小凝 AI 工具集价格：单个工具 ¥1–¥3，手机号注册免费，支付宝扫码解锁。",
                      canon, body)


def sitemap(apps):
    urls = [BASE_URL + "/", f"{BASE_URL}/ai/", f"{BASE_URL}/utility/", f"{BASE_URL}/pricing.html"]
    urls += [f"{BASE_URL}/categories/{cat_slug(c)}.html" for c, _ in C.CATEGORIES]
    urls += [f"{BASE_URL}/tools/{a['slug']}.html" for a in apps]
    items = "".join(
        f"<url><loc>{x}</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq>"
        f"<priority>{'1.0' if x == BASE_URL + '/' else '0.8' if '/categories/' in x else '0.7'}</priority></url>"
        for x in urls
    )
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{items}</urlset>\n'


def llms_txt(apps):
    lines = [f"# {SITE_NAME}", "",
             f"> 三门户结构：统一入口 + AI 工具集（¥1–¥3 解锁）+ 实用工具箱（免费纯前端）。共 {len(apps)} 个工具。",
             f"> 统一入口：{BASE_URL}/ ｜ AI 工具集：{BASE_URL}/ai/ ｜ 实用工具箱：{BASE_URL}/utility/",
             f"> WeaveFox 统一门户：{UNIFIED} ｜ AI 工具集：{PORTAL} ｜ 实用工具箱：{TOOLBOX}", "", "## 分类"]
    for c, lead in C.CATEGORIES:
        items = [a for a in apps if a["cat"] == c]
        lines.append(f"- [{c}]({BASE_URL}/categories/{cat_slug(c)}.html)：{lead}（{len(items)} 个）")
    lines += ["", "## 工具"]
    for a in apps:
        lines.append(f"- [{a['name']}]({BASE_URL}/tools/{a['slug']}.html)：{a['desc']}（{price_label(a)}）")
    lines += ["", "## 说明", f"- 联系方式：{MAIL}｜{PHONE}", "- 工具输出为参考结果，不构成专业意见。"]
    return "\n".join(lines) + "\n"


def readme(apps):
    return f"""# {SITE_NAME} · 工具介绍站

{len(apps)} 个即开即用的 AI 小工具，按场景分类的公开介绍页，用于搜索与 AI 检索可见性。

- 在线站点：{BASE_URL}/
- 工具入口：{PORTAL}
- 分类：{' / '.join(c for c, _ in C.CATEGORIES)}

## 本地构建

```bash
python3 build.py          # 从 data/apps.json + data/content.py 生成全站
python3 submit_indexnow.py  # 构建后提交 sitemap 全量 URL（需 key 文件已部署）
```

数据源：`data/apps.json`（工具目录） + `data/content.py`（每个工具的介绍内容）。

## 目录

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
@media (max-width:640px){.cards{grid-template-columns:1fr}h1{font-size:24px}.rows li{flex-direction:column;gap:2px}.rows a{min-width:0}}
"""


def main():
    apps = load_apps()
    missing = [a["id"] for a in apps if a["id"] not in C.APPS]
    extra = [k for k in C.APPS if k not in {a["id"] for a in apps}]
    if missing or extra:
        raise SystemExit(f"内容与目录不一致 missing={missing} extra={extra}")

    os.makedirs(os.path.join(HERE, "ai"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "utility"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "tools"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "categories"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "assets"), exist_ok=True)

    def w(relpath, text):
        p = os.path.join(HERE, relpath)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)

    w("index.html", unified_page(apps))
    w("ai/index.html", ai_portal_page(apps))
    w("utility/index.html", utility_portal_page(apps))
    w("pricing.html", pricing_page(apps))
    for c, _ in C.CATEGORIES:
        w(f"categories/{cat_slug(c)}.html", category_page(c, apps))
    for a in apps:
        w(f"tools/{a['slug']}.html", tool_page(a, apps))
    w("sitemap.xml", sitemap(apps))
    w("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n")
    w("llms.txt", llms_txt(apps))
    w("assets/style.css", CSS)
    w("README.md", readme(apps))
    w(".nojekyll", "")
    print(f"generated {len(apps)} tools + {len(C.CATEGORIES)} categories + index/pricing/sitemap")


if __name__ == "__main__":
    main()
