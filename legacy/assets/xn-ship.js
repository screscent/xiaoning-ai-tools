/* R1212 快递运费与包裹成本合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(首重续重运费|体积重与抛比|保价与理赔|退换与寄回成本|时效赔付|合并寄送)$/;
  var HASHES = {
    "首重续重运费": "#/freight",
    "体积重与抛比": "#/volumetric",
    "保价与理赔": "#/insured",
    "退换与寄回成本": "#/return",
    "时效赔付": "#/delay",
    "合并寄送": "#/merge"
  };
  var ACTIONS = /^(计算|复制结果)$/;

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-ship-tabs")) {
      holder.classList.add("xn-ship-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "物流工具切换");
    }
    var hash = location.hash || "#/freight";
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var name = txt(a);
      var target = HASHES[name] || (a.getAttribute("href") || "");
      var on = target && hash.indexOf(target) === 0;
      a.classList.add("xn-ship-tab");
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
      if (!b.classList.contains("xn-ship-action")) b.classList.add("xn-ship-action");
      if (b.dataset.xnShip !== "1") {
        b.dataset.xnShip = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var ns = root.querySelectorAll("input[type=number]");
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].dataset.xnShip === "1") continue;
      ns[i].dataset.xnShip = "1";
      ns[i].style.setProperty("font-size", "20px", "important");
      ns[i].style.setProperty("min-height", "48px", "important");
      ns[i].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var j = 0; j < sels.length; j++) {
      if (sels[j].dataset.xnShip === "1") continue;
      sels[j].dataset.xnShip = "1";
      sels[j].style.setProperty("font-size", "16px", "important");
      sels[j].style.setProperty("min-height", "48px", "important");
    }
    var sws = root.querySelectorAll("button.h-6.w-11");
    for (var k = 0; k < sws.length; k++) {
      var sw = sws[k];
      if (!sw.classList.contains("xn-ship-switch")) sw.classList.add("xn-ship-switch");
      sw.setAttribute("role", "switch");
      var off = /(^|\s)bg-gray-300(\s|$)/.test(sw.className);
      var next = off ? "false" : "true";
      if (sw.getAttribute("aria-checked") !== next) sw.setAttribute("aria-checked", next);
      if (!sw.getAttribute("aria-label")) {
        var row = sw.parentElement ? sw.parentElement.parentElement : null;
        var label = row ? txt(row) : "";
        sw.setAttribute("aria-label", (label.slice(0, 24) || "选项开关"));
      }
      sw.style.setProperty("width", "44px", "important");
      sw.style.setProperty("height", "24px", "important");
      sw.style.setProperty("min-height", "24px", "important");
      sw.style.setProperty("max-height", "24px", "important");
    }
  }

  function values() {
    var nodes = root.querySelectorAll("div,span,p,dd,td");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      var s = txt(e);
      if (!/^(¥[\d,.]+|\d+(\.\d+)?\s?(kg|小时|%|倍|件|天))$/.test(s)) continue;
      var row = e.parentElement;
      if (row && !row.classList.contains("xn-ship-row")) row.classList.add("xn-ship-row");
      if (!e.classList.contains("xn-ship-value")) e.classList.add("xn-ship-value");
    }
  }

  function strip() {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var s = n.nodeValue;
      if (!s) continue;
      var next = s.replace(/^工具[A-Z]\s*/, "").replace(/（#\/[a-z]+(、#\/[a-z]+)*）/g, "");
      if (next !== s) n.nodeValue = next;
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回/.test(txt(a)) || a.dataset.xnShip === "1") continue;
      a.dataset.xnShip = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); fields(); values(); strip(); back(); } catch (e) {}
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
