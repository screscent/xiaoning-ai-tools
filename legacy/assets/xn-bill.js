/* R1216 账单分摊与折扣计算合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(账单分摊|折扣计算)$/;
  var PILLS = /^(0%|10%|15%|18%|20%|自定义)$/;
  var ACTIONS = /^(复制结果|清空)$/;

  function isOn(el) {
    var bg = getComputedStyle(el).backgroundColor;
    return bg !== "rgb(255, 255, 255)" && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && bg !== "oklch(0.967 0.003 264.542)";
  }

  function tabs() {
    var all = root.querySelectorAll("button");
    var bs = [];
    var i;
    for (i = 0; i < all.length; i++) if (vis(all[i]) && TABS.test(txt(all[i]))) bs.push(all[i]);
    if (!bs.length) return;
    var holder = bs[0].parentElement;
    if (holder && !holder.classList.contains("xn-bill-tabs")) {
      holder.classList.add("xn-bill-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "账单工具切换");
    }
    for (i = 0; i < bs.length; i++) {
      var b = bs[i];
      var on = /(^|\s)bg-teal-500(\s|$)/.test(b.className);
      b.classList.add("xn-bill-tab");
      b.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
    }
  }

  function pills() {
    var all = root.querySelectorAll("button");
    var ps = [];
    var i;
    for (i = 0; i < all.length; i++) if (vis(all[i]) && PILLS.test(txt(all[i]))) ps.push(all[i]);
    if (!ps.length) return;
    var holder = ps[0].parentElement;
    if (holder && holder.getAttribute("role") !== "radiogroup") {
      holder.setAttribute("role", "radiogroup");
      holder.setAttribute("aria-label", "小费比例");
    }
    for (i = 0; i < ps.length; i++) {
      var p = ps[i];
      var on = /(^|\s)bg-teal-500(\s|$)/.test(p.className);
      p.classList.add("xn-bill-pill");
      p.setAttribute("role", "radio");
      var next = on ? "true" : "false";
      if (p.getAttribute("aria-checked") !== next) p.setAttribute("aria-checked", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-bill-action")) b.classList.add("xn-bill-action");
      if (b.dataset.xnBill !== "1") {
        b.dataset.xnBill = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var ns = root.querySelectorAll("input[type=number]");
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].dataset.xnBill === "1") continue;
      ns[i].dataset.xnBill = "1";
      ns[i].style.setProperty("font-size", "20px", "important");
      ns[i].style.setProperty("min-height", "48px", "important");
      ns[i].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var sws = root.querySelectorAll("button.h-6.w-11");
    for (var j = 0; j < sws.length; j++) {
      var sw = sws[j];
      if (!sw.classList.contains("xn-bill-switch")) sw.classList.add("xn-bill-switch");
      sw.setAttribute("role", "switch");
      var off = /(^|\s)bg-gray-300(\s|$)/.test(sw.className);
      var next = off ? "false" : "true";
      if (sw.getAttribute("aria-checked") !== next) sw.setAttribute("aria-checked", next);
      if (!sw.getAttribute("aria-label")) {
        var row = sw.parentElement ? sw.parentElement.parentElement : null;
        var label = row ? txt(row) : "";
        sw.setAttribute("aria-label", (label.slice(0, 20) || "选项开关"));
      }
      sw.style.setProperty("width", "44px", "important");
      sw.style.setProperty("height", "24px", "important");
      sw.style.setProperty("min-height", "24px", "important");
      sw.style.setProperty("max-height", "24px", "important");
    }
  }

  function money() {
    var nodes = root.querySelectorAll("div,span,p,strong,b");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      var s = txt(e);
      if (!/^¥[\d,]+(\.\d+)?$/.test(s)) continue;
      if (!e.classList.contains("xn-bill-money")) e.classList.add("xn-bill-money");
    }
  }

  function strip() {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var s = n.nodeValue;
      if (!s || s.indexOf("#/") < 0) continue;
      var next = s.replace(/（#\/[a-z]+(、#\/[a-z]+)*）/g, "").replace(/\(#\/[a-z]+(、#\/[a-z]+)*\)/g, "");
      if (next !== s) n.nodeValue = next;
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnBill === "1") continue;
      a.dataset.xnBill = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); pills(); actions(); fields(); money(); strip(); back(); } catch (e) {}
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
