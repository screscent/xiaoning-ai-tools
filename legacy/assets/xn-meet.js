/* R1240 会议排期与时段合集：tabs / 复制 / 计数 / 标题清理（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function tabs() {
    var list = [].slice.call(root.querySelectorAll("button[role='tab']")).filter(vis);
    list.forEach(function (b) {
      b.setAttribute("type", "button");
      var on = b.getAttribute("aria-selected") === "true";
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function copies() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!/^复制结果$/.test(txt(b))) return;
      b.classList.add("xn-meet-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制当前工具结果");
    });
  }

  function counts() {
    [].slice.call(root.querySelectorAll("div")).forEach(function (d) {
      if (d.children.length > 1) return;
      var s = txt(d);
      if (/^共发现\s*\d+\s*组冲突$/.test(s)) d.classList.add("xn-meet-count");
    });
  }

  function headings() {
    [].slice.call(root.querySelectorAll("h2")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^\s*工具[A-Z]\s+/.test(s)) h.textContent = s.replace(/^\s*工具[A-Z]\s+/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='time']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    try { tabs(); copies(); counts(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
