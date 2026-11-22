/* R1207 密码强度检测与随机生成合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(强度检测|随机密码)$/;
  var ACTIONS = /^(示例密码|复制报告|生成|复制)$/;

  function tabs() {
    var all = root.querySelectorAll("button");
    var bs = [];
    var i;
    for (i = 0; i < all.length; i++) if (TABS.test(txt(all[i]))) bs.push(all[i]);
    if (!bs.length) return;
    var holder = bs[0].parentElement;
    if (holder && !holder.classList.contains("xn-pwd-tabs")) {
      holder.classList.add("xn-pwd-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "密码工具切换");
    }
    for (i = 0; i < bs.length; i++) {
      var b = bs[i];
      var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className);
      b.classList.add("xn-pwd-tab");
      b.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
    }
  }

  function quick() {
    var all = root.querySelectorAll("button");
    var pills = [];
    var i;
    for (i = 0; i < all.length; i++) if (vis(all[i]) && /^\d{1,2}$/.test(txt(all[i]))) pills.push(all[i]);
    if (!pills.length) return;
    var holder = pills[0].parentElement;
    if (holder && holder.getAttribute("role") !== "radiogroup") {
      holder.setAttribute("role", "radiogroup");
      holder.setAttribute("aria-label", "密码长度预设");
    }
    for (i = 0; i < pills.length; i++) {
      var p = pills[i];
      p.classList.add("xn-pwd-quick");
      p.setAttribute("role", "radio");
      var next = /(^|\s)bg-blue-5/.test(p.className) ? "true" : "false";
      if (p.getAttribute("aria-checked") !== next) p.setAttribute("aria-checked", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b)) continue;
      if (ACTIONS.test(txt(b))) {
        if (!b.classList.contains("xn-pwd-action")) b.classList.add("xn-pwd-action");
        if (b.dataset.xnPwd !== "1") {
          b.dataset.xnPwd = "1";
          b.style.setProperty("min-height", "44px", "important");
          b.style.setProperty("font-size", "14px", "important");
        }
      }
    }
    var all = root.querySelectorAll("div,button,summary,h3");
    for (var j = 0; j < all.length; j++) {
      var e = all[j];
      if (txt(e) !== "使用说明" || e.children.length > 1) continue;
      if (!e.classList.contains("xn-pwd-guide")) e.classList.add("xn-pwd-guide");
      e.style.setProperty("min-height", "44px", "important");
    }
  }

  function fields() {
    var inp = root.querySelector("input[type=password]");
    if (inp && inp.dataset.xnPwd !== "1") {
      inp.dataset.xnPwd = "1";
      inp.style.setProperty("font-size", "18px", "important");
      inp.style.setProperty("min-height", "52px", "important");
      var wrap = inp.parentElement;
      var eye = wrap ? wrap.querySelector("button") : null;
      if (eye) {
        eye.classList.add("xn-pwd-eye");
        eye.style.setProperty("min-width", "44px", "important");
        eye.style.setProperty("min-height", "44px", "important");
        eye.style.setProperty("right", "4px", "important");
      }
    }
    var ranges = root.querySelectorAll("input[type=range]");
    for (var i = 0; i < ranges.length; i++) {
      ranges[i].style.setProperty("min-height", "32px", "important");
    }
    var labels = root.querySelectorAll("label");
    for (var j = 0; j < labels.length; j++) {
      var lb = labels[j];
      var cb = lb.querySelector("input[type=checkbox]");
      if (!cb) continue;
      lb.classList.add("xn-pwd-checkrow");
      if (lb.dataset.xnPwd !== "1") {
        lb.dataset.xnPwd = "1";
        lb.style.setProperty("min-height", "44px", "important");
      }
      cb.style.setProperty("width", "18px", "important");
      cb.style.setProperty("height", "18px", "important");
      var boxes = lb.querySelectorAll("div");
      for (var k = 0; k < boxes.length; k++) {
        var bx = boxes[k];
        if (/h-3\.5/.test(bx.className) || /w-3\.5/.test(bx.className)) {
          bx.classList.add("xn-pwd-box");
          bx.style.setProperty("width", "18px", "important");
          bx.style.setProperty("height", "18px", "important");
        }
      }
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnPwd === "1") continue;
      a.dataset.xnPwd = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); quick(); actions(); fields(); back(); } catch (e) {}
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
