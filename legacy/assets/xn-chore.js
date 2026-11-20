/* R1116 家务分工与轮值合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnChore) return;
  window.__xnChore = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function tabs() {
    var all = [].slice.call(document.querySelectorAll("#root a"));
    var tabAnchors = all.filter(function (a) {
      var p = a.parentElement;
      return (
        p &&
        p.className &&
        p.className.indexOf("overflow-x-auto") >= 0 &&
        p.querySelectorAll("a").length >= 4 &&
        TXT(a).length > 0 &&
        TXT(a).length <= 8
      );
    });
    if (!tabAnchors.length) return;
    var box = tabAnchors[0].parentElement;
    if (box.getAttribute("data-xn-chore-tabs") !== "1") {
      box.setAttribute("data-xn-chore-tabs", "1");
      box.classList.add("xn-chore-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "家务工具");
    }
    tabAnchors.forEach(function (a) {
      var active = (a.className || "").indexOf("border-blue-600") >= 0;
      a.classList.add("xn-chore-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  function labelFor(el) {
    /* 在控件所在字段容器里找 2–8 字的叶子标签，优先最短 */
    var out = [];
    var n = el.parentElement;
    for (var i = 0; i < 3 && n; i++) {
      var kids = [].slice.call(n.querySelectorAll("div,label,span"));
      for (var k = 0; k < kids.length; k++) {
        var x = kids[k];
        if (x === el || x.contains(el)) continue;
        if (x.children.length) continue;
        var s = TXT(x);
        if (s && s.length >= 2 && s.length <= 8 && !/^\d/.test(s)) out.push(s);
      }
      n = n.parentElement;
    }
    if (!out.length) return "";
    out.sort(function (a, b) { return a.length - b.length; });
    return out[0];
  }

  function selectLabel(el) {
    var first = el.options && el.options[0] ? TXT(el.options[0]) : "";
    if (/^(请假|换班)$/.test(first)) return "记录类型";
    if (/^\d{4}-\d{2}-\d{2}$/.test(first)) return "日期";
    if (/^选择成员/.test(first)) return "请假人";
    return "";
  }

  function controls() {
    var list = [].slice.call(document.querySelectorAll("#root select, #root input:not([type]), #root input[type=text], #root input[type=number], #root input[type=date]"));
    list.forEach(function (el) {
      if (!VIS(el)) return;
      if (el.getAttribute("aria-label")) return;
      var l = el.tagName === "SELECT" ? selectLabel(el) : "";
      if (!l) l = labelFor(el);
      if (!l && el.placeholder) l = /例如|搜索/.test(el.placeholder) ? "搜索或输入家务名称" : el.placeholder;
      if (l) el.setAttribute("aria-label", l);
    });
  }

  function copies() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var s = TXT(b);
      if (!/^(复制|一键复制)/.test(s)) return;
      b.classList.add("xn-chore-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s + "，复制到剪贴板");
      if (!b.getAttribute("title")) b.setAttribute("title", s);
    });
  }

  function deletes() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var aria = b.getAttribute("aria-label") || "";
      var s = TXT(b);
      if (aria !== "删除" && s !== "删除" && !(b.querySelector("svg") && aria === "" && s === "")) return;
      if (aria !== "删除") return;
      b.classList.add("xn-chore-del");
      if (b.getAttribute("data-xn-chore-ctx") === "1") return;
      var name = "";
      var row = b.closest("tr");
      var input = row ? row.querySelector('input:not([type]), input[type="text"]') : null;
      if (!input) {
        var n = b.parentElement;
        for (var i = 0; i < 5 && n && !input; i++) {
          input = n.querySelector && n.querySelector('input:not([type]), input[type="text"]');
          n = n.parentElement;
        }
      }
      if (input && input.value) name = input.value.trim();
      var label = name ? "删除家务：" + name : "删除这项家务";
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label);
      b.setAttribute("data-xn-chore-ctx", "1");
    });
  }

  function chips() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    var found = [];
    btns.forEach(function (b) {
      var s = TXT(b);
      if (/^添加/.test(s) && !/^添加「/.test(s)) {
        b.classList.add("xn-chore-add");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s);
      }
      var m = s.match(/^(.{1,12}?)(每日|每周|每月)$/);
      if (!m) return;
      var r = b.getBoundingClientRect();
      if (r.height > 52) return;
      b.classList.add("xn-chore-chip");
      var label = "添加「" + m[1] + "（" + m[2] + "）」到清单";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
      found.push(b);
    });
    if (found.length) {
      var box = found[0].parentElement;
      if (box && box.getAttribute("data-xn-chore-group") !== "1") {
        box.setAttribute("data-xn-chore-group", "1");
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "常见家务，点击加入清单");
      }
    }
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

  function hints() {
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (el) {
      if (el.children.length) return;
      var s = TXT(el);
      if (/^(已输入\s*\d+\s*[人项]|共\s*\d+\s*条)$/.test(s)) el.classList.add("xn-chore-hint");
    });
  }

  function tables() {
    [].slice.call(document.querySelectorAll("#root table")).forEach(function (tb) {
      var ths = [].slice.call(tb.querySelectorAll("thead th")).map(TXT);
      if (ths.indexOf("负责人") >= 0) tb.classList.add("xn-chore-owner");
      var wrap = tb.parentElement;
      if (wrap && wrap.className && wrap.className.indexOf("overflow-x-auto") >= 0 && wrap.getAttribute("data-xn-chore-tbl") !== "1") {
        wrap.setAttribute("data-xn-chore-tbl", "1");
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "表格，可横向滚动");
      }
      if (!ths.length) return;
      [].slice.call(tb.querySelectorAll("tbody tr")).forEach(function (tr, ri) {
        [].slice.call(tr.children).forEach(function (td, ci) {
          var head = ths[ci] || "";
          [].slice.call(td.querySelectorAll("input, select")).forEach(function (el) {
            if (el.getAttribute("aria-label")) return;
            var l = head ? head + "（第" + (ri + 1) + "行）" : (el.placeholder || "");
            if (l) el.setAttribute("aria-label", l);
          });
        });
      });
    });
  }

  function cards() {
    [].slice.call(document.querySelectorAll("#root div.bg-white.rounded-xl")).forEach(function (c) {
      if (c.className.indexOf("min-h-screen") >= 0) return;
      c.classList.add("xn-chore-card");
    });
  }

  function run() {
    tabs();
    cards();
    controls();
    copies();
    deletes();
    chips();
    headings();
    hints();
    tables();
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
