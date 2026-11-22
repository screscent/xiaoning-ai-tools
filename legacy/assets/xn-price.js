/* R1208 折扣计算与批量到手价合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(折扣计算|批量到手价)$/;
  var ACTIONS = /^(计算|复制结果|重置)$/;

  function tabs() {
    var all = root.querySelectorAll("button");
    var bs = [];
    var i;
    for (i = 0; i < all.length; i++) if (TABS.test(txt(all[i]))) bs.push(all[i]);
    if (!bs.length) return;
    var holder = bs[0].parentElement;
    if (holder && !holder.classList.contains("xn-price-tabs")) {
      holder.classList.add("xn-price-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "折扣工具切换");
    }
    for (i = 0; i < bs.length; i++) {
      var b = bs[i];
      var on = /(^|\s)bg-blue-6/.test(b.className);
      b.classList.add("xn-price-tab");
      b.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-price-action")) b.classList.add("xn-price-action");
      if (b.dataset.xnPrice !== "1") {
        b.dataset.xnPrice = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var sels = root.querySelectorAll("select");
    for (var i = 0; i < sels.length; i++) {
      if (sels[i].dataset.xnPrice === "1") continue;
      sels[i].dataset.xnPrice = "1";
      sels[i].style.setProperty("font-size", "16px", "important");
      sels[i].style.setProperty("min-height", "48px", "important");
    }
    var nums = root.querySelectorAll("input[type=number]");
    for (var j = 0; j < nums.length; j++) {
      if (nums[j].dataset.xnPrice === "1") continue;
      nums[j].dataset.xnPrice = "1";
      nums[j].style.setProperty("font-size", "20px", "important");
      nums[j].style.setProperty("min-height", "48px", "important");
      nums[j].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var tas = root.querySelectorAll("textarea");
    for (var k = 0; k < tas.length; k++) {
      if (tas[k].dataset.xnPrice === "1") continue;
      tas[k].dataset.xnPrice = "1";
      tas[k].style.setProperty("font-size", "16px", "important");
      tas[k].style.setProperty("min-height", "160px", "important");
      tas[k].style.setProperty("line-height", "1.7", "important");
      tas[k].style.setProperty("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "important");
    }
    var sws = root.querySelectorAll("button.h-6.w-11");
    for (var m = 0; m < sws.length; m++) {
      var sw = sws[m];
      if (!sw.classList.contains("xn-price-switch")) sw.classList.add("xn-price-switch");
      sw.setAttribute("role", "switch");
      var off = /(^|\s)bg-gray-300(\s|$)/.test(sw.className);
      var next = off ? "false" : "true";
      if (sw.getAttribute("aria-checked") !== next) sw.setAttribute("aria-checked", next);
      if (!sw.getAttribute("aria-label")) sw.setAttribute("aria-label", "是否含税");
      sw.style.setProperty("width", "44px", "important");
      sw.style.setProperty("height", "24px", "important");
      sw.style.setProperty("min-height", "24px", "important");
      sw.style.setProperty("max-height", "24px", "important");
    }
  }

  function money() {
    var nodes = root.querySelectorAll("div,span,p,td,strong,b");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      if (!/^¥\s?[\d,]+(\.\d+)?$/.test(txt(e))) continue;
      if (!e.classList.contains("xn-price-money")) e.classList.add("xn-price-money");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnPrice === "1") continue;
      a.dataset.xnPrice = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); fields(); money(); back(); } catch (e) {}
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
