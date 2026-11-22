/* R1210 二维码与条形码识别合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(二维码识别|条形码识别|校验位计算|vCard 名片|WiFi 连接码|容量与版本)$/;
  var ACTIONS = /^(复制|清空|复制结果|清空结果)$/;

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-qr-tabs")) {
      holder.classList.add("xn-qr-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "二维码工具切换");
    }
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var on = /(^|\s)bg-indigo-/.test(a.className);
      a.classList.add("xn-qr-tab");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function drop() {
    var labels = root.querySelectorAll("label");
    for (var i = 0; i < labels.length; i++) {
      var l = labels[i];
      if (!/点击选择图片/.test(txt(l))) continue;
      if (!l.classList.contains("xn-qr-drop")) l.classList.add("xn-qr-drop");
      l.style.setProperty("min-height", "200px", "important");
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-qr-action")) b.classList.add("xn-qr-action");
      if (b.dataset.xnQr !== "1") {
        b.dataset.xnQr = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var ins = root.querySelectorAll("input[type=text]");
    for (var i = 0; i < ins.length; i++) {
      if (ins[i].dataset.xnQr === "1") continue;
      ins[i].dataset.xnQr = "1";
      ins[i].style.setProperty("font-size", "16px", "important");
      ins[i].style.setProperty("min-height", "48px", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var j = 0; j < sels.length; j++) {
      if (sels[j].dataset.xnQr === "1") continue;
      sels[j].dataset.xnQr = "1";
      sels[j].style.setProperty("font-size", "16px", "important");
      sels[j].style.setProperty("min-height", "48px", "important");
    }
    var tas = root.querySelectorAll("textarea");
    for (var k = 0; k < tas.length; k++) {
      if (tas[k].dataset.xnQr === "1") continue;
      tas[k].dataset.xnQr = "1";
      tas[k].style.setProperty("font-size", "16px", "important");
      tas[k].style.setProperty("min-height", "110px", "important");
      tas[k].style.setProperty("line-height", "1.7", "important");
      tas[k].style.setProperty("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "important");
    }
    var labels = root.querySelectorAll("label");
    for (var m = 0; m < labels.length; m++) {
      var lb = labels[m];
      var cb = lb.querySelector("input[type=checkbox]");
      if (!cb) continue;
      lb.classList.add("xn-qr-check");
      if (lb.dataset.xnQr !== "1") {
        lb.dataset.xnQr = "1";
        lb.style.setProperty("min-height", "44px", "important");
      }
      cb.style.setProperty("width", "18px", "important");
      cb.style.setProperty("height", "18px", "important");
    }
  }

  function stripRoutes() {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var s = n.nodeValue;
      if (!s || s.indexOf("#/") < 0) continue;
      var next = s.replace(/（#\/[a-z]+）/g, "").replace(/\(#\/[a-z]+\)/g, "");
      if (next !== s) n.nodeValue = next;
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnQr === "1") continue;
      a.dataset.xnQr = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); drop(); actions(); fields(); stripRoutes(); back(); } catch (e) {}
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
