/* R1217 Base64URL 与 HMAC 哈希合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(Base64URL|HMAC 哈希)$/;
  var ACTIONS = /^(编码|清空|计算|复制结果)$/;

  function tabs() {
    var all = root.querySelectorAll("button");
    var bs = [];
    var i;
    for (i = 0; i < all.length; i++) if (vis(all[i]) && TABS.test(txt(all[i]))) bs.push(all[i]);
    if (!bs.length) return;
    var holder = bs[0].parentElement;
    if (holder && !holder.classList.contains("xn-b64-tabs")) {
      holder.classList.add("xn-b64-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "编码工具切换");
    }
    for (i = 0; i < bs.length; i++) {
      var b = bs[i];
      var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className);
      b.classList.add("xn-b64-tab");
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
      if (!b.classList.contains("xn-b64-action")) b.classList.add("xn-b64-action");
      if (b.dataset.xnB64 !== "1") {
        b.dataset.xnB64 = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var tas = root.querySelectorAll("textarea");
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      if (ta.dataset.xnB64 === "1") continue;
      ta.dataset.xnB64 = "1";
      var big = ta.getBoundingClientRect().height > 90;
      ta.style.setProperty("font-size", "16px", "important");
      ta.style.setProperty("min-height", big ? "120px" : "90px", "important");
      ta.style.setProperty("line-height", "1.7", "important");
      ta.style.setProperty("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "important");
    }
    var ins = root.querySelectorAll("input[type=text]");
    for (var j = 0; j < ins.length; j++) {
      if (ins[j].dataset.xnB64 === "1") continue;
      ins[j].dataset.xnB64 = "1";
      ins[j].style.setProperty("font-size", "16px", "important");
      ins[j].style.setProperty("min-height", "48px", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var k = 0; k < sels.length; k++) {
      if (sels[k].dataset.xnB64 === "1") continue;
      sels[k].dataset.xnB64 = "1";
      sels[k].style.setProperty("font-size", "16px", "important");
      sels[k].style.setProperty("min-height", "48px", "important");
    }
    var sws = root.querySelectorAll("button.h-6.w-11");
    for (var m = 0; m < sws.length; m++) {
      var sw = sws[m];
      if (!sw.classList.contains("xn-b64-switch")) sw.classList.add("xn-b64-switch");
      sw.setAttribute("role", "switch");
      var off = /(^|\s)bg-gray-300(\s|$)/.test(sw.className);
      var next = off ? "false" : "true";
      if (sw.getAttribute("aria-checked") !== next) sw.setAttribute("aria-checked", next);
      if (!sw.getAttribute("aria-label")) {
        var raw = sw.parentElement ? txt(sw.parentElement) : "";
        var label = raw.split(/默认|输出前|按 MIME/)[0] || raw.slice(0, 14);
        sw.setAttribute("aria-label", label.slice(0, 16) || "选项开关");
      }
      sw.style.setProperty("width", "44px", "important");
      sw.style.setProperty("height", "24px", "important");
      sw.style.setProperty("min-height", "24px", "important");
      sw.style.setProperty("max-height", "24px", "important");
    }
  }

  function stats() {
    var rows = root.querySelectorAll("div.flex.justify-between");
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!vis(r) || r.children.length !== 2) continue;
      if (!/字符数|字节数|位数/.test(txt(r))) continue;
      var v = r.children[1];
      if (!v.classList.contains("xn-b64-stat")) v.classList.add("xn-b64-stat");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnB64 === "1") continue;
      a.dataset.xnB64 = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); fields(); stats(); back(); } catch (e) {}
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
