/* R1234 提交信息与变更日志合集：吸顶工具条 / 入口卡语义 / 类型芯片 / 尺寸增强
   仅改样式与语义，不改 React 状态与生成逻辑 */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  var SECTIONS = [
    ["tool-commit", "01", "提交信息"],
    ["tool-types", "02", "类型速查"],
    ["tool-changelog", "03", "变更日志"],
    ["tool-lint", "04", "commitlint"],
    ["tool-pr", "05", "PR 模板"],
    ["tool-branch", "06", "分支命名"]
  ];
  var CARD_MAP = {
    "#/commit": "tool-commit",
    "#/types": "tool-types",
    "#/changelog": "tool-changelog",
    "#/lint": "tool-lint",
    "#/pr": "tool-pr",
    "#/branch": "tool-branch"
  };
  var bar = null;

  function hero() {
    var h = root.querySelector("section");
    if (h) h.classList.add("xn-commit-hero");
    return h;
  }

  /* 1. 吸顶工具条 */
  function buildBar() {
    if (bar && document.body.contains(bar)) return bar;
    var h = hero();
    if (!h) return null;
    bar = document.createElement("nav");
    bar.className = "xn-commit-bar";
    bar.setAttribute("aria-label", "页面内工具导航");
    var label = document.createElement("span");
    label.className = "xn-commit-bar-label";
    label.textContent = "工具";
    bar.appendChild(label);
    SECTIONS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-target", s[0]);
      var no = document.createElement("span");
      no.className = "xn-commit-bar-no";
      no.textContent = s[1];
      b.appendChild(no);
      b.appendChild(document.createTextNode(s[2]));
      b.addEventListener("click", function () { jump(s[0]); });
      bar.appendChild(b);
    });
    h.insertAdjacentElement("afterend", bar);
    return bar;
  }

  function jump(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
  }

  /* 2. 入口卡：路由串改人话 + 当前项 */
  function cards() {
    var h = hero();
    if (!h) return;
    [].slice.call(h.querySelectorAll("a[href^='#/'] span")).forEach(function (s) {
      if (txt(s).indexOf("#/") === 0) s.textContent = "打开工具 →";
    });
  }

  function spy() {
    var y = window.scrollY + 120;
    var cur = null;
    SECTIONS.forEach(function (s) {
      var el = document.getElementById(s[0]);
      if (el && el.offsetTop <= y) cur = s[0];
    });
    if (bar) {
      [].slice.call(bar.querySelectorAll("button")).forEach(function (b) {
        if (b.getAttribute("data-target") === cur) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }
    var h = hero();
    if (h) {
      [].slice.call(h.querySelectorAll("a[href^='#/']")).forEach(function (a) {
        if (CARD_MAP[a.getAttribute("href")] === cur) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
  }

  /* 3. 类型芯片：单选语义 */
  function chips() {
    var types = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore"];
    var group = [];
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (types.indexOf(txt(b)) >= 0) {
        b.classList.add("xn-commit-type");
        b.setAttribute("type", "button");
        group.push(b);
      }
    });
    if (!group.length) return;
    var wrap = group[0].parentElement;
    if (wrap) {
      wrap.classList.add("xn-commit-chips");
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", "提交类型（单选）");
    }
    group.forEach(function (b) {
      var on = /(^|\s)(bg-blue-50|border-blue-500)(\s|$)/.test(b.className);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
    });
  }

  /* 4. 区块编号徽标 */
  function numbers() {
    [].slice.call(root.querySelectorAll("section[id] > div:first-child span")).forEach(function (s) {
      if (!/^\d{2}$/.test(txt(s))) return;
      if (!s.classList.contains("xn-commit-num")) s.classList.add("xn-commit-num");
    });
  }

  /* 5. 示例胶囊 / 返回 / 输入尺寸 */
  function tweaks() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (txt(b).indexOf("试一试示例") === 0) b.classList.add("xn-commit-sample");
    });
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 4px", "important");
    });
    [].slice.call(root.querySelectorAll("input:not([type='checkbox']):not([type='radio']):not([type='file']):not([type='range']),select")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    try {
      buildBar();
      cards();
      chips();
      numbers();
      tweaks();
      spy();
    } catch (e) {}
  }

  var tick = false;
  window.addEventListener("scroll", function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { tick = false; spy(); });
  }, { passive: true });
  root.addEventListener("click", function () { [80, 360, 900].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 150); }, true);
  root.addEventListener("change", function () { setTimeout(run, 150); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 80); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
