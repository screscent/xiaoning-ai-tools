/* R1219 图片圆角与边框合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(圆角|边框|圆形头像|投影|安全边距)$/;
  var ACTIONS = /^(下载 PNG|重置|下载 PNG（含参考线）|下载 PNG（纯图）)$/;
  var SMALL = /^(实色|透明|PX|MM)$/;
  var active = "圆角";

  function tabLinks() {
    var all = root.querySelectorAll("a");
    var links = [];
    for (var i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    return links;
  }

  function tabs() {
    var links = tabLinks();
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-frame-tabs")) {
      holder.classList.add("xn-frame-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "图片处理工具切换");
    }
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var name = txt(a);
      a.classList.add("xn-frame-tab");
      a.setAttribute("role", "tab");
      var next = name === active ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function drop() {
    var labels = root.querySelectorAll("label");
    for (var i = 0; i < labels.length; i++) {
      var l = labels[i];
      if (!/点击选择图片/.test(txt(l))) continue;
      if (!l.classList.contains("xn-frame-drop")) l.classList.add("xn-frame-drop");
      l.style.setProperty("min-height", "180px", "important");
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b)) continue;
      var s = txt(b);
      if (ACTIONS.test(s)) {
        if (!b.classList.contains("xn-frame-action")) b.classList.add("xn-frame-action");
        if (b.dataset.xnFrame !== "1") {
          b.dataset.xnFrame = "1";
          b.style.setProperty("min-height", "44px", "important");
          b.style.setProperty("font-size", "14px", "important");
        }
      } else if (SMALL.test(s)) {
        if (!b.classList.contains("xn-frame-small")) b.classList.add("xn-frame-small");
        if (b.dataset.xnFrame !== "1") {
          b.dataset.xnFrame = "1";
          b.style.setProperty("min-height", "40px", "important");
        }
      }
    }
  }

  function fields() {
    var ranges = root.querySelectorAll("input[type=range]");
    for (var i = 0; i < ranges.length; i++) ranges[i].style.setProperty("min-height", "32px", "important");
    var colors = root.querySelectorAll("input[type=color]");
    for (var j = 0; j < colors.length; j++) colors[j].style.setProperty("min-height", "48px", "important");
    var ins = root.querySelectorAll("input[type=text]");
    for (var k = 0; k < ins.length; k++) {
      if (ins[k].dataset.xnFrame === "1") continue;
      ins[k].dataset.xnFrame = "1";
      ins[k].style.setProperty("font-size", "16px", "important");
      ins[k].style.setProperty("min-height", "48px", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var m = 0; m < sels.length; m++) {
      if (sels[m].dataset.xnFrame === "1") continue;
      sels[m].dataset.xnFrame = "1";
      sels[m].style.setProperty("font-size", "16px", "important");
      sels[m].style.setProperty("min-height", "48px", "important");
    }
    var nums = root.querySelectorAll("input[type=number]");
    for (var n = 0; n < nums.length; n++) {
      if (nums[n].dataset.xnFrame === "1") continue;
      nums[n].dataset.xnFrame = "1";
      nums[n].style.setProperty("font-size", "20px", "important");
      nums[n].style.setProperty("min-height", "48px", "important");
      nums[n].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnFrame === "1") continue;
      a.dataset.xnFrame = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); drop(); actions(); fields(); back(); } catch (e) {}
  }

  run();
  [250, 700, 1800].forEach(function (ms) { setTimeout(run, ms); });

  root.addEventListener("click", function (ev) {
    var links = tabLinks();
    for (var i = 0; i < links.length; i++) {
      if (links[i] === ev.target || links[i].contains(ev.target)) {
        active = txt(links[i]);
        break;
      }
    }
    setTimeout(run, 250);
  }, true);
  root.addEventListener("input", function () { setTimeout(run, 250); }, true);
  root.addEventListener("change", function () { setTimeout(run, 250); }, true);
  window.addEventListener("load", function () { setTimeout(run, 400); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
