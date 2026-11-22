/* R1211 昵称与英文名生成合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(昵称|账号|英文名|品牌|长度|英文名含义)$/;
  var ACTIONS = /^(换一批|复制全部|复制结果)$/;

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-nick-tabs")) {
      holder.classList.add("xn-nick-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "起名工具切换");
    }
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var on = /(^|\s)bg-blue-500(\s|$)/.test(a.className);
      a.classList.add("xn-nick-tab");
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
      if (!b.classList.contains("xn-nick-action")) b.classList.add("xn-nick-action");
      if (b.dataset.xnNick !== "1") {
        b.dataset.xnNick = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function rows() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || ACTIONS.test(txt(b))) continue;
      if (!/(^|\s)w-full(\s|$)/.test(b.className)) continue;
      if (!b.classList.contains("xn-nick-row")) b.classList.add("xn-nick-row");
      if (b.dataset.xnNick !== "1") {
        b.dataset.xnNick = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("padding", "8px 12px", "important");
      }
    }
  }

  function fields() {
    var sels = root.querySelectorAll("select");
    for (var i = 0; i < sels.length; i++) {
      if (sels[i].dataset.xnNick === "1") continue;
      sels[i].dataset.xnNick = "1";
      sels[i].style.setProperty("font-size", "16px", "important");
      sels[i].style.setProperty("min-height", "48px", "important");
    }
    var ins = root.querySelectorAll("input[type=text]");
    for (var j = 0; j < ins.length; j++) {
      if (ins[j].dataset.xnNick === "1") continue;
      ins[j].dataset.xnNick = "1";
      ins[j].style.setProperty("font-size", "16px", "important");
      ins[j].style.setProperty("min-height", "48px", "important");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnNick === "1") continue;
      a.dataset.xnNick = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); rows(); fields(); back(); } catch (e) {}
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
