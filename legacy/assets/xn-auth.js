/* R1214 Token 与鉴权自查合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(JWT 解码|标准声明解释|Authorization 头|Cookie 属性自查|权限范围|存储)$/;
  var HASHES = {
    "JWT 解码": "#/jwt",
    "标准声明解释": "#/claims",
    "Authorization 头": "#/headers",
    "Cookie 属性自查": "#/cookie",
    "权限范围": "#/scope",
    "存储": "#/storage"
  };
  var ACTIONS = /^(解码|清空|解析|生成请求头|检查风险|分析)$/;

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-auth-tabs")) {
      holder.classList.add("xn-auth-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "鉴权工具切换");
    }
    var hash = location.hash || "#/jwt";
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var name = txt(a);
      var target = HASHES[name] || (a.getAttribute("href") || "");
      var on = target && hash.indexOf(target) === 0;
      a.classList.add("xn-auth-tab");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b)) continue;
      var s = txt(b);
      if (ACTIONS.test(s)) {
        if (!b.classList.contains("xn-auth-action")) b.classList.add("xn-auth-action");
        if (b.dataset.xnAuth !== "1") {
          b.dataset.xnAuth = "1";
          b.style.setProperty("min-height", "44px", "important");
          b.style.setProperty("font-size", "14px", "important");
        }
      } else if (/^复制结果$/.test(s)) {
        if (!b.classList.contains("xn-auth-small")) b.classList.add("xn-auth-small");
        if (b.dataset.xnAuth !== "1") {
          b.dataset.xnAuth = "1";
          b.style.setProperty("min-height", "40px", "important");
          b.style.setProperty("font-size", "13px", "important");
        }
      }
    }
  }

  function fields() {
    var tas = root.querySelectorAll("textarea");
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      if (ta.dataset.xnAuth === "1") continue;
      ta.dataset.xnAuth = "1";
      var big = ta.getBoundingClientRect().height > 90;
      ta.style.setProperty("font-size", "16px", "important");
      ta.style.setProperty("min-height", big ? "120px" : "80px", "important");
      ta.style.setProperty("line-height", "1.7", "important");
      ta.style.setProperty("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "important");
    }
    var ins = root.querySelectorAll("input[type=text],input[type=number]");
    for (var j = 0; j < ins.length; j++) {
      if (ins[j].dataset.xnAuth === "1") continue;
      ins[j].dataset.xnAuth = "1";
      ins[j].style.setProperty("font-size", "16px", "important");
      ins[j].style.setProperty("min-height", "48px", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var k = 0; k < sels.length; k++) {
      if (sels[k].dataset.xnAuth === "1") continue;
      sels[k].dataset.xnAuth = "1";
      sels[k].style.setProperty("font-size", "16px", "important");
      sels[k].style.setProperty("min-height", "48px", "important");
    }
    var labels = root.querySelectorAll("label");
    for (var m = 0; m < labels.length; m++) {
      var lb = labels[m];
      var cb = lb.querySelector("input[type=checkbox]");
      if (!cb) continue;
      lb.classList.add("xn-auth-check");
      if (lb.dataset.xnAuth !== "1") {
        lb.dataset.xnAuth = "1";
        lb.style.setProperty("min-height", "44px", "important");
      }
      cb.style.setProperty("width", "18px", "important");
      cb.style.setProperty("height", "18px", "important");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnAuth === "1") continue;
      a.dataset.xnAuth = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); actions(); fields(); back(); } catch (e) {}
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
