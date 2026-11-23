/* xn-colorlab.js · 颜色名称与明暗对比：标题归一 / 工具切换语义 / 常用色 / HEX 同步 / 配色对（幂等） */
(function () {
  "use strict";
  if (window.__XN_COLORLAB__) return;
  window.__XN_COLORLAB__ = 1;

  var CN = ["一", "二"];
  var CIRCLE = ["①", "②"];
  var COLORS = [
    { n: "红", v: "#EF4444" }, { n: "橙", v: "#F97316" }, { n: "黄", v: "#FACC15" },
    { n: "绿", v: "#22C55E" }, { n: "青", v: "#06B6D4" }, { n: "蓝", v: "#3B82F6" },
    { n: "紫", v: "#8B5CF6" }, { n: "粉", v: "#EC4899" }, { n: "棕", v: "#92400E" },
    { n: "灰", v: "#9CA3AF" }, { n: "黑", v: "#111827" }, { n: "白", v: "#FFFFFF" }
  ];
  var PAIRS = [
    { t: "黑底白字", fg: "#111111", bg: "#FFFFFF" },
    { t: "白底黑字", fg: "#FFFFFF", bg: "#111111" },
    { t: "蓝底白字", fg: "#2563EB", bg: "#FFFFFF" },
    { t: "黄底黑字", fg: "#FDE047", bg: "#111111" },
    { t: "灰底白字", fg: "#475569", bg: "#F8FAFC" }
  ];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function colorInputs() {
    return [].slice.call(document.querySelectorAll('#root input[type="color"]'));
  }

  /* 1. 标题归一 */
  function normalizeHeading() {
    var h2 = document.querySelector("#root h2");
    if (!h2) return;
    var t = text(h2);
    var m = /^([①②③④⑤⑥])\s*(.+)$/.exec(t);
    if (!m) return;
    var i = "①②③④⑤⑥".indexOf(m[1]);
    var want = "工具" + (CN[i] || (i + 1)) + " · " + m[2].trim();
    if (t !== want) h2.textContent = want;
  }

  /* 2. 工具切换：编号与 aria */
  function enhanceTabs() {
    var btns = document.querySelectorAll("#root button");
    var idx = 0;
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = text(b);
      if (t !== "颜色名称" && t !== "明暗对比") continue;
      b.setAttribute("data-xn-num", CIRCLE[idx] || "");
      b.setAttribute("aria-pressed", /bg-gray-900/.test(b.className) ? "true" : "false");
      idx++;
    }
  }

  function syncTabs() {
    var btns = document.querySelectorAll('#root button[data-xn-num]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", /bg-gray-900/.test(btns[i].className) ? "true" : "false");
    }
  }

  /* 3. 颜色名称：常用色 */
  function enhanceColorPresets() {
    var hex = document.querySelector('#root input[aria-label="十六进制 HEX"]');
    if (!hex) return;
    var c0 = colorInputs()[0];
    if (c0 && !c0.getAttribute("aria-label")) c0.setAttribute("aria-label", "取色器：点击选择颜色");
    var box = hex.parentElement;
    if (!box || box.querySelector(":scope > .xn-color-presets")) return;
    var row = document.createElement("div");
    row.className = "xn-color-presets";
    for (var i = 0; i < COLORS.length; i++) {
      (function (c) {
        var b = document.createElement("button");
        b.type = "button";
        var dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = c.v;
        b.appendChild(dot);
        b.appendChild(document.createTextNode(c.n));
        b.dataset.xnColor = c.v;
        b.setAttribute("aria-label", "填入" + c.n + " " + c.v);
        row.appendChild(b);
      })(COLORS[i]);
    }
    box.appendChild(row);
  }

  /* 4. 明暗对比：HEX 输入 + 配色对 + 交换 */
  function enhanceContrast() {
    var cs = colorInputs();
    if (cs.length < 2) return;
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i];
      if (c.dataset.xnHex) continue;
      c.dataset.xnHex = "1";
      var wrap = c.parentElement;
      if (wrap && !c.getAttribute("aria-label")) {
        var lab = wrap.querySelector("label");
        c.setAttribute("aria-label", lab ? text(lab) + "取色器" : "颜色取色器");
      }
      if (!wrap) continue;
      var row = document.createElement("div");
      row.className = "xn-hex-row";
      var inp = document.createElement("input");
      inp.type = "text";
      inp.className = "xn-hex-input";
      inp.value = c.value;
      inp.setAttribute("aria-label", (wrap.querySelector("label") ? text(wrap.querySelector("label")) : "颜色") + " HEX，可粘贴色值");
      inp.setAttribute("placeholder", "#RRGGBB");
      (function (inp, c) {
        inp.addEventListener("input", function () {
          var v = inp.value.trim();
          if (/^#?[0-9a-f]{6}$/i.test(v)) setNative(c, v.charAt(0) === "#" ? v : "#" + v);
        });
      })(inp, c);
      row.appendChild(inp);
      wrap.appendChild(row);
    }

    var grid = cs[0].parentElement;
    while (grid && !grid.contains(cs[1])) grid = grid.parentElement;
    if (!grid || grid.querySelector(":scope > .xn-pair-presets")) return;
    var pairRow = document.createElement("div");
    pairRow.className = "xn-pair-presets";
    for (var j = 0; j < PAIRS.length; j++) {
      (function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = p.t;
        b.dataset.xnFg = p.fg;
        b.dataset.xnBg = p.bg;
        b.setAttribute("aria-label", "切换为" + p.t);
        pairRow.appendChild(b);
      })(PAIRS[j]);
    }
    var swap = document.createElement("button");
    swap.type = "button";
    swap.className = "xn-swap";
    swap.textContent = "交换前景/背景";
    swap.setAttribute("aria-label", "交换前景色与背景色");
    pairRow.appendChild(swap);
    grid.appendChild(pairRow);
  }

  /* 5. HEX 输入与取色器同步 */
  function syncHex() {
    var rows = document.querySelectorAll(".xn-hex-row");
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var inp = row.querySelector("input");
      var c = row.parentElement ? row.parentElement.querySelector('input[type="color"]') : null;
      if (inp && c && document.activeElement !== inp && inp.value.toLowerCase() !== c.value.toLowerCase()) {
        inp.value = c.value;
      }
    }
  }

  /* 6. 复制按钮语义 */
  function markCopy() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (!/^复制/.test(text(b))) continue;
      if (b.getAttribute("aria-label")) continue;
      var host = b.parentElement && b.parentElement.parentElement;
      var ctx = host ? text(host).replace(text(b), "").replace(/\s+/g, " ").trim() : "";
      var m = /(HEX|RGB|HSL)/.exec(ctx);
      if (m) ctx = m[1] + " 色值";
      else {
        ctx = ctx.replace(/#[0-9A-Fa-f]{3,8}[\s\S]*$/, "").trim().slice(0, 10);
        if (!ctx) ctx = "色值";
      }
      b.setAttribute("aria-label", "复制 " + ctx);
    }
  }

  /* 6b. 开/关 分段语义 */
  function enhanceToggle() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = text(b);
      if (t !== "开" && t !== "关") continue;
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "显示 RGB / HSL：" + t);
      b.setAttribute("aria-pressed", /bg-white/.test(b.className) && !/text-gray-500/.test(b.className) ? "true" : "false");
    }
  }

  function syncToggle() {
    var btns = document.querySelectorAll('#root button[aria-label^="显示 RGB / HSL"]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", /bg-white/.test(btns[i].className) && !/text-gray-500/.test(btns[i].className) ? "true" : "false");
    }
  }

  /* 7. 事件委托 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var sw = t.closest(".xn-color-presets button");
    if (sw) {
      var c = colorInputs()[0];
      if (c) {
        setNative(c, sw.dataset.xnColor);
        setTimeout(function () {
          var q = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return text(b) === "查询颜色名称"; })[0];
          if (q) q.click();
        }, 120);
      }
      return;
    }

    var pair = t.closest(".xn-pair-presets button:not(.xn-swap)");
    if (pair) {
      var cs = colorInputs();
      if (cs.length >= 2) {
        setNative(cs[0], pair.dataset.xnFg);
        setNative(cs[1], pair.dataset.xnBg);
      }
      return;
    }

    if (t.closest(".xn-pair-presets .xn-swap")) {
      var list = colorInputs();
      if (list.length >= 2) {
        var a = list[0].value, b = list[1].value;
        setNative(list[0], b);
        setNative(list[1], a);
      }
      return;
    }

    if (t.closest('#root button[data-xn-num]')) setTimeout(syncTabs, 60);
    if (t.closest('#root button[aria-label^="显示 RGB / HSL"]')) setTimeout(syncToggle, 60);
  }

  function enhanceAll() {
    try {
      normalizeHeading();
      enhanceTabs();
      enhanceColorPresets();
      enhanceContrast();
      enhanceToggle();
      syncHex();
      markCopy();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
