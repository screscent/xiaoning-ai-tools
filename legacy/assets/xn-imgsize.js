/* 小凝工具站 · 平台图片尺寸与规格增强 xn-imgsize v1
 * 能力：6 分类标签 48h/grid/aria-pressed；h2 去掉「工具E/F」占位；
 *       下拉 52/16、推荐尺寸 40、比例徽章、虚线预览框、倍数按钮 44/aria-pressed、
 *       尺寸数值 19、复制 50、错误编号徽章、用途小提示（按选项解释）、回到顶部。
 * 注入：legacy/dzfwjnslwd.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_IMGSIZE__) return;
  window.__XN_IMGSIZE__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["社交", "电商", "视频", "网页", "封面", "头像规格"];
  var TIP_RULES = [
    [/头像/, "头像按圆形显示，四周约 12% 会被裁成圆，人脸或 Logo 必须居中。"],
    [/缩略图/, "缩略图在小卡片里展示，避免细字与贴边元素，主体占画面 60% 以上。"],
    [/白底图/, "白底图要求纯白背景、无阴影、主体居中，便于平台合成与搜索展示。"],
    [/主图/, "主图在搜索结果里按正方形缩略，主体占 70% 以上，四周留出安全边。"],
    [/详情页|长图/, "竖向长图按宽度铺满，建议分段切图，首屏放核心卖点。"],
    [/横屏|Banner|Hero|横幅/i, "Banner/Hero 建议出桌面与移动两套，主体居中，两侧允许裁切。"],
    [/OG|分享图/i, "分享卡片按 1200×630 预览，标题与主图都要落在中间安全区。"],
    [/海报/, "海报按目标平台比例导出，关键文字离边至少 40px。"],
    [/封面/, "封面会被信息流按比例居中裁切，重要信息放中间 60% 区域。"],
    [/视频|竖屏/, "视频封面注意横竖比例，避免黑边与字幕贴边被裁。"],
    [/拼多多|淘宝|京东|小红书|抖音|微信|知乎|视频号|B 站/, "不同平台规则略有差异，上传前以平台最新提示为准。"]
  ];
  var TIP_DEFAULT = "参考推荐尺寸与安全区提示；拿不准时选 2x 更清晰，注意体积上限。";

  function keyWords(vals) {
    var out = [], seen = {};
    each(TIP_RULES, function (r) {
      for (var i = 0; i < vals.length; i++) {
        if (r[0].test(vals[i]) && !seen[r[1]]) { seen[r[1]] = 1; out.push(r[1]); break; }
      }
    });
    return out.slice(0, 2).join(" ");
  }
  function buildTip(vals) { return keyWords(vals) || TIP_DEFAULT; }

  function activeSection() {
    var secs = document.querySelectorAll("#root section");
    for (var i = 0; i < secs.length; i++) { if (vis(secs[i])) return secs[i]; }
    return document.querySelector("#root") || document.body;
  }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) {
      if (vis(h)) add(h, "xn-is-h1");
    });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      var t = clean(h.textContent);
      var s = t.replace(/^工具[A-Z]\s*/, "");
      if (s !== t) h.textContent = s;
      add(h, "xn-is-h2");
    });
    each(document.querySelectorAll("#root h3"), function (h) {
      if (!vis(h)) return;
      add(h, "xn-is-h2");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s)) return;
      var t = clean(s.textContent);
      if (["用途", "平台", "类型（头像）", "类型"].indexOf(t) >= 0 && s.children.length === 0) add(s, "xn-is-label");
    });
  }

  function markTabs() {
    var tabs = [];
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      tabs.push(b);
      add(b, "xn-is-tab");
      var on = /bg-blue-600/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "查看：" + t + "图片尺寸（第 " + (TABS.indexOf(t) + 1) + "/6 类）");
    });
    if (!tabs.length) return;
    var box = tabs[0].parentElement;
    if (!box) return;
    add(box, "xn-is-tabs");
    var cols = window.matchMedia("(max-width: 639px)").matches ? "repeat(3, minmax(0,1fr))" : "repeat(6, minmax(0,1fr))";
    if (box.style.getPropertyValue("display") !== "grid" || box.style.getPropertyValue("grid-template-columns") !== cols) {
      box.style.setProperty("display", "grid", "important");
      box.style.setProperty("grid-template-columns", cols, "important");
    }
  }

  function markCards() {
    each(document.querySelectorAll("#root div"), function (d) {
      var c = String(d.className);
      if (!vis(d)) return;
      if (/bg-white/.test(c) && /rounded-xl/.test(c)) add(d, "xn-is-card");
      if (/bg-blue-50/.test(c) && /rounded/.test(c)) add(d, "xn-is-card-soft");
      if (/border-dashed/.test(c)) add(d, "xn-is-preview");
    });
  }

  function markSelects() {
    var sec = activeSection();
    var sels = [];
    each(sec.querySelectorAll("select"), function (s) { if (vis(s)) { add(s, "xn-is-select"); sels.push(s); } });
    return sels;
  }

  function currentDim() {
    var big = null;
    each(document.querySelectorAll("#root div"), function (d) {
      if (big) return;
      if (!vis(d)) return;
      if (!/text-2xl font-bold/.test(String(d.className))) return;
      if (!/\d+\s*×\s*\d+/.test(clean(d.textContent))) return;
      big = d;
    });
    return big;
  }

  function markNumbers() {
    var big = currentDim();
    if (big) {
      add(big, "xn-is-big");
      each(big.querySelectorAll("span"), function (s) {
        if (clean(s.textContent).toLowerCase() === "px") add(s, "xn-is-unit");
      });
    }
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (/^(宽高比|比例)\s*[:：]?\s*/.test(clean(s.textContent))) add(s, "xn-is-ratio");
    });
    // 尺寸数值（如 640×640 px / 1280×1280）
    each(document.querySelectorAll("#root div, #root span"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (!/^\d{2,5}\s*×\s*\d{2,5}\s*(px)?$/i.test(t)) return;
      if (big && e === big) return;
      add(e, "xn-is-dim");
    });
    // 倍数标签 1x / 2x · 推荐
    each(document.querySelectorAll("#root div, #root span"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (!/^[123]\s*x$/i.test(t)) return;
      add(e, "xn-is-k");
    });
    each(document.querySelectorAll("#root span"), function (e) {
      if (!vis(e)) return;
      var t = clean(e.textContent);
      if (/·\s*推荐$/.test(t)) add(e, "xn-is-rec");
    });
  }

  function markButtons(sels) {
    var dim = currentDim();
    var base = clean(dim && dim.textContent).match(/(\d{2,5})\s*×\s*(\d{2,5})/);
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (/^[123]\s*x$/i.test(t)) {
        var n = parseInt(t, 10);
        add(b, "xn-is-mult");
        var on = /bg-blue-600/.test(String(b.className));
        setA(b, "aria-pressed", on ? "true" : "false");
        if (base) setA(b, "aria-label", "选择 " + n + " 倍图（" + base[1] * n + "×" + base[2] * n + "）");
        else setA(b, "aria-label", "选择 " + n + " 倍尺寸");
      }
      if (t === "复制规格") {
        add(b, "xn-is-copy");
        setA(b, "aria-label", "复制当前分类与用途的图片规格");
      }
    });
    each(document.querySelectorAll("#root li, #root p"), function (p) {
      if (vis(p)) add(p, "xn-is-note");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s)) return;
      if (/^\d\.$/.test(clean(s.textContent)) && parseFloat(getComputedStyle(s).fontSize) <= 13) add(s, "xn-is-num-badge");
    });
    // 格式 / 体积上限徽章
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (s.classList.contains("xn-is-ratio")) return;
      var c = String(s.className);
      if (/(bg-(rose|amber|blue|emerald|slate)-50)/.test(c) && /text-xs/.test(c)) add(s, "xn-is-chip");
    });
    // 返回工具集
    each(document.querySelectorAll("#root a"), function (a) {
      if (vis(a) && /返回工具集/.test(clean(a.textContent))) add(a, "xn-is-back");
    });
    // 标签之间补用途说明（仅最后一个下拉后）
    if (sels && sels.length) {
      var last = sels[sels.length - 1];
      var vals = sels.map(function (s) { return clean(s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ""); });
      each(sels, function (s) {
        if (s === last) return;
        var nx = s.nextElementSibling;
        if (nx && nx.classList.contains("xn-is-tip")) nx.parentNode.removeChild(nx);
      });
      var tip = last.nextElementSibling;
      if (!tip || !tip.classList.contains("xn-is-tip")) {
        tip = document.createElement("div");
        tip.className = "xn-is-tip";
        last.insertAdjacentElement("afterend", tip);
      }
      var sig = vals.join("|");
      if (tip.getAttribute("data-v") !== sig) {
        tip.setAttribute("data-v", sig);
        tip.innerHTML = "<b>小提示</b> · " + buildTip(vals);
      }
    }
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-is-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      markHeads(); markTabs(); markCards();
      var sels = markSelects();
      markNumbers(); markButtons(sels); ensureTop();
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("change", function () { window.setTimeout(tick, 60); }, true);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
