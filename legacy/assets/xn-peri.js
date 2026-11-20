/* R1120 数码外设选购合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnPeri) return;
  window.__xnPeri = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function shortLabel(a) {
    /* 快照里有响应式双标签（短/长），按当前视口取可见的那个作为 aria-label */
    var spans = [].slice.call(a.querySelectorAll("span")).filter(function (s) {
      return !s.children.length && TXT(s).length >= 2 && !/^h-|^w-|rounded-full/.test(s.className || "");
    });
    if (!spans.length) return TXT(a);
    for (var i = 0; i < spans.length; i++) {
      if (getComputedStyle(spans[i]).display !== "none") return TXT(spans[i]);
    }
    return TXT(spans[0]);
  }

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      return p && p.className && p.className.indexOf("grid-cols-3") >= 0 && p.querySelectorAll("a").length >= 4 && TXT(a).length <= 20;
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-peri-tabs") !== "1") {
      box.setAttribute("data-xn-peri-tabs", "1");
      box.classList.add("xn-peri-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "数码外设工具");
    }
    anchors.forEach(function (a) {
      var label = shortLabel(a);
      var active = (a.className || "").indexOf("text-zinc-900") >= 0;
      a.classList.add("xn-peri-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function accent(b) {
    var c = b.className || "";
    if (/emerald/.test(c)) return "emerald";
    if (/rose/.test(c)) return "rose";
    if (/amber/.test(c)) return "amber";
    if (/sky|blue/.test(c)) return "sky";
    return "indigo";
  }

  function opts() {
    var groups = {};
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (!s || s.length > 30 || /^复制/.test(s)) return;
      var r = b.getBoundingClientRect();
      if (r.height < 30 || r.height > 70 || r.width < 40) return;
      var p = b.parentElement;
      (groups[p.className || ""] = groups[p.className || ""] || { p: p, list: [] }).list.push(b);
    });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      if (g.list.length < 2) return;
      var hasState = g.list.some(function (b) { return b.hasAttribute("aria-pressed"); });
      if (!hasState) return;
      g.list.forEach(function (b) {
        if (!b.hasAttribute("aria-pressed")) {
          var c = b.className || "";
          var on = /bg-(indigo|emerald|rose|amber|sky|blue)-50/.test(c) || /ring-1/.test(c);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        }
        b.classList.add("xn-peri-opt");
        b.setAttribute("data-xn-accent", accent(b));
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
      });
      if (g.p.getAttribute("data-xn-peri-group") !== "1") {
        g.p.setAttribute("data-xn-peri-group", "1");
        g.p.setAttribute("role", "group");
        g.p.setAttribute("aria-label", "选项");
      }
    });
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^复制/.test(s)) return;
      b.classList.add("xn-peri-copy");
      var label = s + "，复制到剪贴板";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2")).forEach(function (h) {
      [].slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && /^\s*工具[A-Z]\s+/.test(node.textContent)) {
          node.textContent = node.textContent.replace(/^\s*工具[A-Z]\s+/, "");
        }
      });
    });
  }

  function run() {
    tabs();
    opts();
    copies();
    headings();
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
  setTimeout(run, 1500);
})();
