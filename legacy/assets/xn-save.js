/* R1241 储蓄目标与计算历史合集：tabs / 开关 / 操作按钮语义（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function tabs() {
    var bs = [].slice.call(root.querySelectorAll("button")).filter(function (b) {
      return vis(b) && /^(储蓄目标|计算历史)$/.test(txt(b));
    });
    if (!bs.length) return;
    var wrap = bs[0].parentElement;
    if (wrap) {
      wrap.setAttribute("role", "tablist");
      wrap.setAttribute("aria-label", "理财工具切换");
    }
    bs.forEach(function (b) {
      b.classList.add("xn-save-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-emerald-500(\s|$)/.test(b.className);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function switches() {
    [].slice.call(root.querySelectorAll("button[role='switch']")).forEach(function (b) {
      if (!b.getAttribute("aria-label")) {
        var wrap = b.parentElement;
        var lab = wrap ? wrap.querySelector("div") : null;
        var title = lab ? lab.querySelector("div") : null;
        if (title) b.setAttribute("aria-label", txt(title).slice(0, 24));
      }
    });
  }

  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var s = txt(b);
      if (s === "复制结果" || s === "清空") {
        b.classList.add("xn-save-act");
        b.setAttribute("type", "button");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s === "复制结果" ? "复制计算结果" : "清空当前输入");
        return;
      }
      if (s === "删除") {
        b.classList.add("xn-save-del");
        b.setAttribute("type", "button");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "删除这条计算记录");
        return;
      }
      if (s === "复制全部记录" || s === "清空全部") {
        b.classList.add("xn-save-wide");
        b.setAttribute("type", "button");
      }
    });
  }

  function headings() {
    [].slice.call(root.querySelectorAll("h2")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^[\u2460-\u2473]\s*/.test(s)) h.textContent = s.replace(/^[\u2460-\u2473]\s*/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='number']")).forEach(function (i) {
      var w = i.parentElement;
      if (!w) return;
      var spans = [].slice.call(w.querySelectorAll("span"));
      var hasLeft = spans.some(function (sp) { return txt(sp) === "¥"; });
      var hasRight = spans.some(function (sp) { return /^(%|元|年|月)$/.test(txt(sp)); });
      if (hasLeft) i.style.setProperty("padding-left", "34px", "important");
      if (hasRight) i.style.setProperty("padding-right", "34px", "important");
      var al = (i.getAttribute("aria-label") || "").trim();
      if (!al || /^[¥%]$/.test(al)) {
        var lab = w.parentElement ? w.parentElement.querySelector("label") : null;
        if (!lab) lab = w.previousElementSibling;
        if (lab) i.setAttribute("aria-label", txt(lab));
      }
    });
    [].slice.call(root.querySelectorAll("select")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    try { tabs(); switches(); actions(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
