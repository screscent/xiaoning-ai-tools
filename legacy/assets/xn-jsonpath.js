/* xn-jsonpath.js · JSON 路径查询合集：编号归一 / 吸顶导航 / 语法 chip 可点 / JSON 整理（幂等） */
(function () {
  "use strict";
  if (window.__XN_JSONPATH__) return;
  window.__XN_JSONPATH__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];
  var CIRCLE = "①②③④⑤⑥⑦⑧";
  var IDS = ["path", "pointer", "dot", "build", "schema", "flat"];
  var NAMES = {
    path: "JSONPath 提取",
    pointer: "JSON Pointer",
    dot: "点号路径",
    build: "路径生成器",
    schema: "Schema 校验",
    flat: "扁平化与还原"
  };
  var SAMPLES = {};

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }
  function secOf(el) { return el && el.closest ? el.closest('section[id^="tool-"]') : null; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* 1. 标题编号归一：工具E → 工具五 ·；⑥JSON → 工具六 · */
  function normalizeHeadings() {
    var list = document.querySelectorAll('#root section[id^="tool-"] h2');
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      var t = text(h);
      var m = /^工具\s*([A-Z])\s*[·・:：]?\s*(.+)$/.exec(t);
      if (m) {
        var idx = m[1].charCodeAt(0) - 65;
        var nt = "工具" + (CN[idx] || m[1]) + " · " + m[2].trim();
        if (t !== nt) h.textContent = nt;
        continue;
      }
      var m2 = /^([①②③④⑤⑥⑦⑧])\s*(.+)$/.exec(t);
      if (m2) {
        var i2 = CIRCLE.indexOf(m2[1]);
        var nt2 = "工具" + (CN[i2] || m2[1]) + " · " + m2[2].trim();
        if (t !== nt2) h.textContent = nt2;
      }
    }
  }

  /* 2. 入口卡：编号水印 + 响应式列数 + 可访问名称 */
  function layoutGrid(grid) {
    if (!grid || !grid.style) return;
    var w = window.innerWidth || 1280;
    var n = w <= 360 ? 1 : (w <= 900 ? 2 : 3);
    grid.style.setProperty("grid-template-columns", "repeat(" + n + ", minmax(0, 1fr))", "important");
  }

  function markCards() {
    var cards = document.querySelectorAll('#root a[href^="#/"]');
    if (!cards.length) return;
    var grid = cards[0].parentElement;
    if (grid && grid.classList) grid.classList.add("xn-entry-grid");
    layoutGrid(grid);
    for (var i = 0; i < cards.length; i++) {
      var a = cards[i];
      if (a.style) a.style.setProperty("grid-column", "auto", "important");
      var num = i + 1 < 10 ? "0" + (i + 1) : String(i + 1);
      if (a.getAttribute("data-xn-num") !== num) a.setAttribute("data-xn-num", num);
      var id = (a.getAttribute("href") || "").replace(/^#\//, "");
      if (!a.getAttribute("aria-label")) {
        a.setAttribute("aria-label", "跳转到工具" + (CN[i] || "") + " · " + (NAMES[id] || text(a)));
        a.title = "跳到页面下方的" + (NAMES[id] || "工具");
      }
    }
  }

  /* 3. 吸顶导航 + 滚动高亮 */
  function setActive(id) {
    var nav = document.getElementById("xnJsonNav");
    if (!nav) return;
    for (var i = 0; i < nav.children.length; i++) {
      var b = nav.children[i];
      if (b.getAttribute("data-id") === id) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    }
  }

  function buildNav() {
    if (document.getElementById("xnJsonNav")) return;
    var card = document.querySelector('#root a[href^="#/"]');
    if (!card) return;
    var grid = card.parentElement;
    if (!grid || !grid.parentNode) return;
    var nav = document.createElement("div");
    nav.id = "xnJsonNav";
    nav.className = "xn-json-nav";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "工具快速跳转");
    for (var i = 0; i < IDS.length; i++) {
      (function (id, i) {
        var sec = document.getElementById("tool-" + id);
        if (!sec) return;
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-id", id);
        b.setAttribute("aria-label", "跳转到工具" + CN[i] + " " + NAMES[id]);
        var n = document.createElement("span");
        n.className = "n";
        n.textContent = CN[i];
        b.appendChild(n);
        b.appendChild(document.createTextNode(NAMES[id]));
        b.addEventListener("click", function () {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
          setActive(id);
        });
        nav.appendChild(b);
      })(IDS[i], i);
    }
    grid.parentNode.insertBefore(nav, grid.nextSibling);

    var spy = function () {
      var current = IDS[0];
      for (var j = 0; j < IDS.length; j++) {
        var s = document.getElementById("tool-" + IDS[j]);
        if (!s) continue;
        if (s.getBoundingClientRect().top <= 110) current = IDS[j];
      }
      setActive(current);
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; spy(); });
    }, { passive: true });
    spy();
  }

  /* 4. 开关与分段按钮语义（状态随 React 重渲染同步） */
  function syncStates() {
    var sws = document.querySelectorAll("#root button.xn-switch");
    for (var i = 0; i < sws.length; i++) {
      var on = /bg-blue-600|bg-blue-500/.test(sws[i].className);
      sws[i].setAttribute("aria-checked", on ? "true" : "false");
    }
    var modes = document.querySelectorAll("#root button.xn-mode");
    for (var j = 0; j < modes.length; j++) {
      modes[j].setAttribute("aria-pressed", /bg-blue-600/.test(modes[j].className) ? "true" : "false");
    }
  }

  function enhanceSwitches() {
    var list = document.querySelectorAll('#root section button[class*="rounded-full"]');
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!b.classList.contains("xn-switch")) b.classList.add("xn-switch");
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
    }
    syncStates();
  }

  function enhanceModes() {
    var list = document.querySelectorAll("#root section button");
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!/^(基础|严格|扁平化|还原)$/.test(text(b))) continue;
      if (!b.classList.contains("xn-mode")) b.classList.add("xn-mode");
    }
    syncStates();
  }

  /* 5. 语法速查 chip：标记为可点，实际点击走事件委托 */
  function enhanceTokens() {
    var codes = document.querySelectorAll('#root section[id^="tool-"] code');
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      var p = code.parentElement;
      if (!p || p.tagName === "PRE" || p.closest("pre") || p.closest("button") || p.closest("a")) continue;
      if (!/inline-flex/.test(p.className)) continue;
      var sec = secOf(code);
      if (!sec || !sec.querySelector('input[type="text"]')) continue;
      if (p.dataset.xnToken) continue;
      p.dataset.xnToken = "1";
      p.dataset.xnTok = text(code);
      p.classList.add("xn-token");
      p.setAttribute("role", "button");
      p.tabIndex = 0;
      p.setAttribute("aria-label", "插入 " + text(code));
      p.title = "点击插入到上方路径输入框";
    }
  }

  /* 6. JSON 文本辅助按钮（去重 + 记录示例） */
  function enhanceJsonBoxes() {
    var list = document.querySelectorAll('#root section[id^="tool-"] textarea');
    for (var i = 0; i < list.length; i++) {
      var ta = list[i];
      var box = ta.parentElement;
      if (!box) continue;
      if (box.querySelector(":scope > .xn-json-tools")) continue;
      var sec = secOf(ta);
      if (!sec) continue;
      if (!(sec.id in SAMPLES)) SAMPLES[sec.id] = ta.value;

      var row = document.createElement("div");
      row.className = "xn-json-tools";
      row.dataset.xnSec = sec.id;

      var fmt = document.createElement("button");
      fmt.type = "button";
      fmt.dataset.xnAct = "fmt";
      fmt.textContent = "整理 JSON";
      fmt.setAttribute("aria-label", "整理 JSON 缩进");
      fmt.title = "自动缩进，方便核对结构";

      var reset = document.createElement("button");
      reset.type = "button";
      reset.dataset.xnAct = "reset";
      reset.textContent = "重置示例";
      reset.setAttribute("aria-label", "恢复示例 JSON");

      var msg = document.createElement("span");
      msg.className = "xn-json-msg";
      msg.setAttribute("aria-live", "polite");

      row.appendChild(fmt);
      row.appendChild(reset);
      row.appendChild(msg);
      box.appendChild(row);
    }
  }

  /* 7. 事件委托：入口卡 / 语法 chip / JSON 辅助按钮 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var card = t.closest('#root a[href^="#/"]');
    if (card) {
      e.preventDefault();
      var id = (card.getAttribute("href") || "").replace(/^#\//, "");
      var sec = document.getElementById("tool-" + id);
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(id);
      }
      return;
    }

    var tok = t.closest(".xn-token");
    if (tok) {
      var host = secOf(tok);
      var input = host && host.querySelector('input[type="text"]');
      if (input) {
        var v = tok.dataset.xnTok || "";
        if (v === "（空）") setNative(input, "");
        else setNative(input, (input.value || "") + v);
        input.focus();
      }
      return;
    }

    var act = t.closest(".xn-json-tools button[data-xn-act]");
    if (act) {
      var row = act.closest(".xn-json-tools");
      var area = row && row.parentElement && row.parentElement.querySelector("textarea");
      if (!area) return;
      var out = row.querySelector(".xn-json-msg");
      if (act.dataset.xnAct === "reset") {
        var sid = row.dataset.xnSec || "";
        if (sid in SAMPLES) setNative(area, SAMPLES[sid]);
        if (out) out.textContent = "";
        return;
      }
      var raw = area.value.trim();
      if (!raw) { if (out) out.textContent = "请先粘贴 JSON 文本"; return; }
      try {
        setNative(area, JSON.stringify(JSON.parse(raw), null, 2));
        if (out) {
          out.textContent = "已整理";
          out.style.color = "#0f766e";
          setTimeout(function () { if (out) out.textContent = ""; }, 2400);
        }
      } catch (err) {
        if (out) {
          out.textContent = "JSON 格式有误：" + String(err.message || "").slice(0, 42);
          out.style.color = "#b91c1c";
        }
      }
    }
  }

  function onKey(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var t = e.target;
    if (t && t.classList && t.classList.contains("xn-token")) {
      e.preventDefault();
      onClick({ target: t });
    }
  }

  /* 8. 统计 chip / 校验状态 */
  function markStats() {
    var list = document.querySelectorAll('#root section[id^="tool-"] div, #root section[id^="tool-"] p, #root section[id^="tool-"] span');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.children.length) continue;
      if (el.closest(".xn-json-tools") || el.closest("button") || el.closest(".xn-json-nav")) continue;
      var t = text(el);
      if (!t || t.length > 40) continue;
      if (/命中\s*\d|共\s*\d+\s*个匹配|^[\[{]\s*\d+\s*项\s*[\]}]$/.test(t)) el.classList.add("xn-stat");
      if (t === "无错误" || /^通过/.test(t)) {
        el.classList.add("xn-status", "xn-status-ok");
      } else if (/错误|失败|不通过/.test(t)) {
        el.classList.add("xn-status", "xn-status-bad");
      }
    }
    var pres = document.querySelectorAll('#root section[id^="tool-"] pre');
    for (var j = 0; j < pres.length; j++) {
      if (!pres[j].getAttribute("aria-live")) pres[j].setAttribute("aria-live", "polite");
    }
  }

  /* 9. 使用说明卡 */
  function markUsage() {
    var hs = document.querySelectorAll("#root h2");
    for (var i = 0; i < hs.length; i++) {
      if (text(hs[i]) !== "使用说明") continue;
      var card = hs[i].closest("div.rounded-lg") || hs[i].parentElement;
      if (card) card.classList.add("xn-usage");
      break;
    }
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      markCards();
      buildNav();
      enhanceSwitches();
      enhanceModes();
      enhanceTokens();
      enhanceJsonBoxes();
      markStats();
      markUsage();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", function () { setTimeout(syncStates, 60); }, true);
    window.addEventListener("resize", function () { markCards(); });
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
