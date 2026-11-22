/* R1220 自行车骑行与维护合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var NAV = /^\d{2}/;
  var PILLS = /^\d+\s?km$/;
  var SEG = /^(距离 \+ 时间|目标速度反推)$/;

  function nav() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && NAV.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-cycle-tabs")) {
      holder.classList.add("xn-cycle-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "骑行工具切换");
    }
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var on = a.getAttribute("aria-current") === "page";
      a.classList.add("xn-cycle-card");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function segments() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !SEG.test(txt(b))) continue;
      if (!b.classList.contains("xn-cycle-seg")) b.classList.add("xn-cycle-seg");
      b.style.setProperty("min-height", "44px", "important");
      b.style.setProperty("font-size", "14px", "important");
    }
  }

  function pills() {
    var bs = root.querySelectorAll("button");
    var ps = [];
    var i;
    for (i = 0; i < bs.length; i++) if (vis(bs[i]) && PILLS.test(txt(bs[i]))) ps.push(bs[i]);
    if (!ps.length) return;
    var holder = ps[0].parentElement;
    if (holder && holder.getAttribute("role") !== "radiogroup") {
      holder.setAttribute("role", "radiogroup");
      holder.setAttribute("aria-label", "常用距离");
    }
    for (i = 0; i < ps.length; i++) {
      var p = ps[i];
      var on = /border-\[#2563eb\]|bg-\[#eff6ff\]/.test(p.className);
      p.classList.add("xn-cycle-pill");
      p.setAttribute("role", "radio");
      var next = on ? "true" : "false";
      if (p.getAttribute("aria-checked") !== next) p.setAttribute("aria-checked", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b)) continue;
      var s = txt(b);
      if (/^复制结果$/.test(s)) {
        if (!b.classList.contains("xn-cycle-copy")) b.classList.add("xn-cycle-copy");
        if (b.dataset.xnCycle !== "1") {
          b.dataset.xnCycle = "1";
          b.style.setProperty("min-height", "40px", "important");
        }
      }
    }
  }

  function fields() {
    var ns = root.querySelectorAll("input[type=number]");
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].dataset.xnCycle === "1") continue;
      ns[i].dataset.xnCycle = "1";
      ns[i].style.setProperty("font-size", "20px", "important");
      ns[i].style.setProperty("min-height", "48px", "important");
      ns[i].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
  }

  function big() {
    var nodes = root.querySelectorAll("div,span,p,strong,b");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs < 24) continue;
      if (!/^[\d:′″.,\s]+$/.test(txt(e))) continue;
      if (!e.classList.contains("xn-cycle-big")) e.classList.add("xn-cycle-big");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnCycle === "1") continue;
      a.dataset.xnCycle = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { nav(); segments(); pills(); actions(); fields(); big(); back(); } catch (e) {}
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
