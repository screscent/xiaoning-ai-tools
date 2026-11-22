/* R1209 工作日与假期天数合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ACTIONS = /^(复制结果|添加记录|删除|清空)$/;

  function nav() {
    var links = [];
    var all = root.querySelectorAll("a");
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && !/返回工具集/.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-work-nav")) {
      holder.classList.add("xn-work-nav");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "考勤工具切换");
    }
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      a.setAttribute("role", "tab");
      var on = a.getAttribute("aria-current") === "page";
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-work-action")) b.classList.add("xn-work-action");
      if (b.dataset.xnWork !== "1") {
        b.dataset.xnWork = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
    var els = root.querySelectorAll("div,button,summary,h3");
    for (var j = 0; j < els.length; j++) {
      var e = els[j];
      if (!/^使用说明/.test(txt(e)) || e.children.length > 2) continue;
      if (!e.classList.contains("xn-work-guide")) e.classList.add("xn-work-guide");
      e.style.setProperty("min-height", "44px", "important");
    }
  }

  function fields() {
    var ds = root.querySelectorAll("input[type=date],input[type=month]");
    for (var i = 0; i < ds.length; i++) {
      if (ds[i].dataset.xnWork === "1") continue;
      ds[i].dataset.xnWork = "1";
      ds[i].style.setProperty("font-size", "16px", "important");
      ds[i].style.setProperty("min-height", "48px", "important");
    }
    var ns = root.querySelectorAll("input[type=number]");
    for (var j = 0; j < ns.length; j++) {
      if (ns[j].dataset.xnWork === "1") continue;
      ns[j].dataset.xnWork = "1";
      ns[j].style.setProperty("font-size", "20px", "important");
      ns[j].style.setProperty("min-height", "48px", "important");
      ns[j].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var k = 0; k < sels.length; k++) {
      if (sels[k].dataset.xnWork === "1") continue;
      sels[k].dataset.xnWork = "1";
      sels[k].style.setProperty("font-size", "16px", "important");
      sels[k].style.setProperty("min-height", "48px", "important");
    }
    var labels = root.querySelectorAll("label");
    for (var m = 0; m < labels.length; m++) {
      var lb = labels[m];
      var cb = lb.querySelector("input[type=checkbox]");
      if (!cb) continue;
      lb.classList.add("xn-work-check");
      if (lb.dataset.xnWork !== "1") {
        lb.dataset.xnWork = "1";
        lb.style.setProperty("min-height", "44px", "important");
      }
      cb.style.setProperty("width", "18px", "important");
      cb.style.setProperty("height", "18px", "important");
    }
  }

  function nums() {
    var nodes = root.querySelectorAll("div,span,p,strong,b");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs < 24) continue;
      var s = txt(e);
      if (!/^[\d.,%+\/]+$/.test(s) && s !== "够用" && s !== "不够") continue;
      if (!e.classList.contains("xn-work-num")) e.classList.add("xn-work-num");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnWork === "1") continue;
      a.dataset.xnWork = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { nav(); actions(); fields(); nums(); back(); } catch (e) {}
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
