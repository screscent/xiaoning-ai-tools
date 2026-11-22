/* R1226 宠物出行与寄养合集：芯片与结果金额增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function chips() {
    [].slice.call(root.querySelectorAll("button[aria-pressed]")).forEach(function (b) {
      if (!vis(b)) return;
      var label = b.getAttribute("aria-label") || "";
      if (!/^附加服务/.test(label) && !/^＋/.test(txt(b))) return;
      b.classList.add("xn-pet-chip");
    });
  }

  function money() {
    [].slice.call(root.querySelectorAll("span,div,b,strong")).forEach(function (e) {
      if (e.children.length) return;
      var s = txt(e);
      if (!/^¥\s?\d/.test(s)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs < 18) e.classList.add("xn-pet-money");
    });
  }

  function results() {
    [].slice.call(root.querySelectorAll("div")).forEach(function (e) {
      if (e.classList.contains("xn-pet-result")) return;
      var s = txt(e);
      if (!/(费用估算|费用与对比|费用对比)/.test(s)) return;
      if (s.length > 1400) return;
      e.classList.add("xn-pet-result");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("select")).forEach(function (s) {
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    try { chips(); money(); results(); fields(); } catch (e) {}
  }

  root.addEventListener("click", function () { setTimeout(run, 80); setTimeout(run, 360); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
