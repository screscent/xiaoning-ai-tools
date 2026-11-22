/* R1221 URL 清理与参数合集：语义与尺寸增强（事件驱动，替换旧全文档 MutationObserver） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TAB = /^(追踪参数清理|参数解析|链接重建|分享前检查|UTM 链接构建|追踪识别)$/;
  var ROUTE = /^#\/[\w-]+$/;

  function tabs() {
    var list = [].slice.call(root.querySelectorAll("button")).filter(function (b) {
      return vis(b) && TAB.test(txt(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) {
      if (!bar.classList.contains("xn-url-tabs")) bar.classList.add("xn-url-tabs");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "链接工具切换");
    }
    list.forEach(function (b) {
      b.classList.add("xn-url-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-6/.test(b.className) || /(^|\s)bg-green-6/.test(b.className);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      if (b.getAttribute("role") === "switch") {
        b.classList.add("xn-url-switch");
        b.removeAttribute("aria-pressed");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? txt(b.parentElement) : "").replace(/开关|切换/g, "").replace(/[#＃]+$/, "").trim();
          b.setAttribute("aria-label", label || "切换选项");
        }
        b.style.setProperty("height", "24px", "important");
        b.style.setProperty("min-height", "24px", "important");
        b.style.setProperty("max-height", "24px", "important");
        return;
      }
      if (/^清理追踪参数$/.test(txt(b))) { b.classList.add("xn-url-primary"); b.setAttribute("type", "button"); }
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      t.classList.add("xn-url-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
      t.style.setProperty("min-height", "200px", "important");
    });
  }

  function routes() {
    [].slice.call(root.querySelectorAll("span, div, code")).forEach(function (e) {
      if (!e.children.length && ROUTE.test(txt(e))) e.classList.add("xn-url-route");
    });
  }

  function back() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnUrl === "1") return;
      a.dataset.xnUrl = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    });
  }

  function run() {
    try { tabs(); routes(); buttons(); fields(); back(); } catch (e) {}
  }

  run();
  [250, 700, 1600].forEach(function (ms) { setTimeout(run, ms); });

  var timer = null;
  var schedule = function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 250);
  };
  root.addEventListener("click", schedule, true);
  root.addEventListener("input", schedule, true);
  root.addEventListener("change", schedule, true);
  window.addEventListener("load", function () { setTimeout(run, 400); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
