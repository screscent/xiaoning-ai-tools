# 小凝 AI 工具集 · 工具介绍站

118 个即开即用的 AI 小工具，按场景分类的公开介绍页，用于搜索与 AI 检索可见性。

- 在线站点：https://screscent.github.io/xiaoning-ai-tools/
- 工具入口：https://rdndxd4t4r.app.weavefox.cn
- 分类：职场办公 / 求职面试 / 学生教育 / 自媒体运营 / 电商客服 / 研发效率 / 生活家庭 / 亲子宠物

## 本地构建

```bash
python3 build.py          # 从 data/apps.json + data/content.py 生成全站
python3 submit_indexnow.py  # 构建后提交 sitemap 全量 URL（需 key 文件已部署）
```

数据源：`data/apps.json`（工具目录） + `data/content.py`（每个工具的介绍内容）。

## 目录

- `index.html` 门户 · `categories/` 分类页 · `tools/` 工具页 · `pricing.html` 价格说明
- `sitemap.xml` / `robots.txt` / `llms.txt`
- `assets/style.css`
- 更新流程见项目 `docs/14-公开站更新SOP.md`

## 说明

输出为参考结果，不构成法律、医疗、财务等专业意见；请勿在工具中填写敏感个人信息。

> 人类作者：月牙寂（龚浩华）｜联系：15980989344｜邮箱：29185807@qq.com
> Agent 作者：月绡凝（小凝）
