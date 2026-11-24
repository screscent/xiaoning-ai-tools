/* 小凝工具站 · 界面提示文案增强 xn-copyui v1
 * 能力：工具卡 aria-label/中文副标题/滚动高亮；隐藏路由小药丸；标题去工具E/F；
 *       主/次按钮分类；开关 role/aria 与热区；回到顶部。
 * 注入：legacy/m9jvqmue9a.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_COPYUI__) return;
  window.__XN_COPYUI__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = [
    { id: "tool-empty", name: "空状态文案", desc: "列表为空时" },
    { id: "tool-error", name: "错误页文案", desc: "出错与重试" },
    { id: "tool-loading", name: "加载中文案", desc: "等待与进度" },
    { id: "tool-success", name: "成功反馈文案", desc: "操作完成" },
    { id: "tool-tone", name: "文案体检", desc: "字数与语气" },
    { id: "tool-onboarding", name: "引导文案组合", desc: "三步上手" }
  ];

  function realCards() {
    return Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis).filter(function (a) {
      return !/^\/[a-z]+$/.test((a.textContent || "").trim());
    });
  }

  function markCards() {
    var cards = realCards();
    cards.forEach(function (a, i) {
      var meta = TOOLS[i];
      if (!meta) return;
      var label = meta.name + "：" + meta.desc;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      /* 第二行原为 /empty 之类路由，替换为中文说明 */
      var lines = Array.prototype.slice.call(a.children);
      var sub = lines[lines.length - 1];
      if (sub && sub !== lines[0] && /^\//.test((sub.textContent || "").trim())) {
        if (sub.textContent !== meta.desc) sub.textContent = meta.desc;
      }
    });
  }

  /* 隐藏区块标题右侧的 /empty 路由小药丸 */
  function hideRoutePills() {
    Array.prototype.forEach.call(document.querySelectorAll("#root a"), function (a) {
      var t = (a.textContent || "").trim();
      if (/^\/[a-z]+$/.test(t)) {
        a.style.display = "none";
        a.setAttribute("aria-hidden", "true");
      }
    });
  }

  function fixTitle() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!text) return;
      if (/^生成/.test(text)) {
        b.classList.add("xn-cw-primary");
        if (b.getAttribute("aria-label") !== text) b.setAttribute("aria-label", text);
      } else if (/^(复制|清空)/.test(text)) {
        b.classList.add("xn-cw-secondary");
        if (b.getAttribute("aria-label") !== text) b.setAttribute("aria-label", text);
      }
    });
  }

  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      var label = b.getAttribute("aria-label");
      if (!label) {
        var wrap = b.closest("div");
        var txt = wrap ? (wrap.parentElement && wrap.parentElement.textContent ? wrap.parentElement.textContent : wrap.textContent) : "";
        var name = (txt || "").replace(/\s+/g, "").slice(0, 16);
        if (name) b.setAttribute("aria-label", name);
      }
      if (!b.hasAttribute("aria-checked")) {
        var on = /bg-(violet|purple|indigo|blue)-600/.test(b.className || "");
        b.setAttribute("aria-checked", on ? "true" : "false");
      }
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = (inp.getAttribute("type") || "text").toLowerCase();
      if (/^(text|search|url|email|tel)$/.test(type)) inp.classList.add("xn-cw-inp");
    });
  }

  function markHint() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (/^输入有变化/.test(t) && !el.classList.contains("xn-cw-hint")) el.classList.add("xn-cw-hint");
    });
  }

  function syncCurrent() {
    var line = 150;
    var idx = -1;
    TOOLS.forEach(function (meta, i) {
      var sec = document.getElementById(meta.id);
      if (sec && sec.getBoundingClientRect().top <= line) idx = i;
    });
    if (idx < 0) idx = 0;
    var cards = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    var cards = realCards();
    cards.forEach(function (a, i) {
      if (i === idx) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-cw-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      fixTitle();
      hideRoutePills();
      markCards();
      markButtons();
      markSwitch();
      markInputs();
      markHint();
      syncCurrent();
      ensureTop();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 80);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    syncCurrent();
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
