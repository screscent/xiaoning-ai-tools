/* R1213 装修材料用量合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(涂料用量|瓷砖块数|地板用量|壁纸卷数|损耗补货|预算分配)$/;
  var HASHES = {
    "涂料用量": "#/paint",
    "瓷砖块数": "#/tile",
    "地板用量": "#/floor",
    "壁纸卷数": "#/wallpaper",
    "损耗补货": "#/waste",
    "预算分配": "#/budget"
  };
  var ACTIONS = /^(计算|复制|重置)$/;

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-reno-tabs")) {
      holder.classList.add("xn-reno-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "装修工具切换");
    }
    var hash = location.hash || "#/paint";
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var name = txt(a);
      var target = HASHES[name] || (a.getAttribute("href") || "");
      var on = target && hash.indexOf(target) === 0;
      a.classList.add("xn-reno-tab");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-reno-action")) b.classList.add("xn-reno-action");
      if (b.dataset.xnReno !== "1") {
        b.dataset.xnReno = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var ns = root.querySelectorAll("input[type=number]");
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].dataset.xnReno === "1") continue;
      ns[i].dataset.xnReno = "1";
      ns[i].style.setProperty("font-size", "20px", "important");
      ns[i].style.setProperty("min-height", "48px", "important");
      ns[i].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var j = 0; j < sels.length; j++) {
      if (sels[j].dataset.xnReno === "1") continue;
      sels[j].dataset.xnReno = "1";
      sels[j].style.setProperty("font-size", "16px", "important");
      sels[j].style.setProperty("min-height", "48px", "important");
    }
  }

  function strip() {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var s = n.nodeValue;
      if (!s || s.indexOf("工具") < 0) continue;
      var next = s.replace(/工具[A-Z]\s*/g, "");
      if (next !== s) n.nodeValue = next;
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/工具箱|返回/.test(txt(a)) || a.dataset.xnReno === "1") continue;
      a.dataset.xnReno = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); fields(); strip(); back(); } catch (e) {}
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
  window.addEventListener("hashchange", schedule);
  window.addEventListener("load", function () { setTimeout(run, 400); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
