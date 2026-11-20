/* R1140 JSON Schema 与校验合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnJson) return;
  window.__xnJson = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 6 个工具卡：3+3 布局 + 卡片语义 */
  function cards() {
    var grid = null;
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (grid) return;
      if (!/grid/.test(d.className)) return;
      if (d.children.length !== 6) return;
      var ok = [].slice.call(d.children).every(function (c) {
        return c.tagName === "A" && /^0[1-6]/.test(TXT(c));
      });
      if (ok) grid = d;
    });
    if (grid) {
      grid.setAttribute("data-xn-json-grid", "1");
      [].slice.call(grid.children).forEach(function (a) {
        a.classList.add("xn-json-card");
        var name = TXT(a).replace(/^0\d\s*/, "").split(/\s{1,}/)[0];
        if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "跳到工具：" + TXT(a).slice(0, 24));
        a.setAttribute("title", TXT(a).slice(0, 40));
      });
    }
  }

  /* 按钮分级 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "生成 Schema" || s === "开始校验" || s === "生成示例数据" || s === "生成 TS 类型" || s === "生成模拟数据" || s === "生成字段说明") {
        b.classList.add("xn-json-primary");
      } else if (s === "重置") {
        b.classList.add("xn-json-secondary");
      } else if (s === "复制") {
        b.classList.add("xn-json-copy");
      }
    });
  }

  /* 开关行（推断必填 / 格式化输出）44 触达 */
  function switches() {
    [].slice.call(document.querySelectorAll("#root label, #root div")).forEach(function (d) {
      if (!VIS(d)) return;
      if (d.hasAttribute("data-xn-json-switch")) return;
      var s = TXT(d);
      if (!/^(推断必填|格式化输出)/.test(s) || s.length > 12) return;
      if (H(d) > 70 || H(d) < 22) return;
      d.setAttribute("data-xn-json-switch", "1");
    });
  }

  /* 返回工具集 → 40px 按钮 */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-json-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 标题里的内部代号（工具E / 工具F）→ 展示层剥离 */
  function strip() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具[A-Z]\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    cards();
    actions();
    switches();
    back();
    strip();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
