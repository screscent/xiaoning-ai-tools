/* R1117 测试与质量速查合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnTest) return;
  window.__xnTest = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      var s = TXT(a);
      return (
        p &&
        p.className &&
        p.className.indexOf("overflow-x-auto") >= 0 &&
        p.querySelectorAll("a").length >= 4 &&
        s.length >= 2 &&
        s.length <= 10
      );
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-test-tabs") !== "1") {
      box.setAttribute("data-xn-test-tabs", "1");
      box.classList.add("xn-test-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "测试工具");
    }
    anchors.forEach(function (a) {
      var active = (a.className || "").indexOf("border-slate-900") >= 0;
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  function labelFor(el) {
    var out = [];
    var n = el.parentElement;
    for (var i = 0; i < 3 && n; i++) {
      var kids = [].slice.call(n.querySelectorAll("div,label,span"));
      for (var k = 0; k < kids.length; k++) {
        var x = kids[k];
        if (x === el || x.contains(el)) continue;
        if (x.children.length) continue;
        var s = TXT(x);
        if (!s || s.length < 2 || s.length > 8) continue;
        if (/^\d/.test(s)) continue;
        if (/^(试试|示例|例如)/.test(s)) continue;
        if (/[：:]$/.test(s)) continue;
        out.push(s);
      }
      n = n.parentElement;
    }
    if (!out.length) return "";
    out.sort(function (a, b) { return a.length - b.length; });
    return out[0];
  }

  function controls() {
    var list = [].slice.call(document.querySelectorAll("#root input:not([type=checkbox]):not([type=radio]), #root textarea, #root select"));
    list.forEach(function (el) {
      if (!VIS(el)) return;
      if (el.getAttribute("aria-label")) return;
      var l = labelFor(el);
      if (!l && el.placeholder) l = el.placeholder.split(/[，,。]/)[0].replace(/^输入/, "");
      if (l) el.setAttribute("aria-label", l);
    });
  }

  function chips() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    var found = [];
    btns.forEach(function (b) {
      var s = TXT(b);
      if (!s || s.length > 10) return;
      if (/^(复制|清空|删除|关闭)/.test(s)) return;
      var r = b.getBoundingClientRect();
      if (r.height > 52) return;
      b.classList.add("xn-test-chip");
      var label = "填入示例：" + s;
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
      found.push(b);
    });
    if (found.length) {
      var box = found[0].parentElement;
      if (box && box.getAttribute("data-xn-test-chips") !== "1") {
        box.setAttribute("data-xn-test-chips", "1");
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "示例，点击填入输入框");
      }
    }
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^复制/.test(s)) return;
      b.classList.add("xn-test-copy");
      var label = s + "，复制到剪贴板";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
    });
  }

  function clears() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var title = b.getAttribute("title") || "";
      var s = TXT(b);
      var r = b.getBoundingClientRect();
      if (!/清空/.test(title) && !(s === "" && r.width > 0 && r.width <= 30)) return;
      b.classList.add("xn-test-clear");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空输入");
      if (!b.getAttribute("title")) b.setAttribute("title", "清空输入");
    });
  }

  function results() {
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (!/border-(emerald|amber|rose)-100/.test(d.className || "")) return;
      if (d.getBoundingClientRect().height < 120) return;
      d.classList.add("xn-test-col");
      var head = d.firstElementChild;
      if (head && head.children.length) head.classList.add("xn-test-col-head");
      [].slice.call(d.querySelectorAll("li > span")).forEach(function (sp) {
        if (sp.children.length) return;
        if (!/^\d{1,3}$/.test(TXT(sp))) return;
        if (sp.getBoundingClientRect().width > 28) return;
        sp.classList.add("xn-test-badge");
      });
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2")).forEach(function (h) {
      [].slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && /^\s*工具[A-F]\s+/.test(node.textContent)) {
          node.textContent = node.textContent.replace(/^\s*工具[A-F]\s+/, "");
        }
      });
    });
  }

  function run() {
    tabs();
    controls();
    chips();
    copies();
    clears();
    results();
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
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
