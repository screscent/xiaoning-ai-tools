/* R1206 TOTP 验证码与备份码合集：语义与触达增强（轻量、事件驱动，不接管 React 状态） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(TOTP 动态码|备份码清单|Base32|TOTP 时间步|恢复码校验)$/;
  var ACTIONS = /^(复制验证码|清空密钥|生成|复制全部|重置已用)$/;
  var SMALL = /^(示例)$/;

  function tabs() {
    var all = root.querySelectorAll("button");
    var bs = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (TABS.test(txt(all[i]))) bs.push(all[i]);
    }
    if (!bs.length) return;
    var holder = bs[0].parentElement;
    if (holder && !holder.classList.contains("xn-totp-tabs")) {
      holder.classList.add("xn-totp-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "TOTP 子工具切换");
    }
    for (i = 0; i < bs.length; i++) {
      var b = bs[i];
      var on = /(^|\s)bg-white(\s|$)/.test(b.className);
      var next = on ? "true" : "false";
      b.classList.add("xn-totp-tab");
      b.setAttribute("role", "tab");
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
    }
  }

  function fields() {
    var tas = root.querySelectorAll("textarea");
    for (var i = 0; i < tas.length; i++) {
      var el = tas[i];
      if (!vis(el) || el.dataset.xnTotp === "1") continue;
      el.dataset.xnTotp = "1";
      var single = el.getBoundingClientRect().height < 60;
      el.style.setProperty("font-size", "16px", "important");
      el.style.setProperty("min-height", single ? "48px" : "96px", "important");
      el.style.setProperty("line-height", "1.6", "important");
      el.style.setProperty("font-family", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var j = 0; j < sels.length; j++) {
      if (!vis(sels[j]) || sels[j].dataset.xnTotp === "1") continue;
      sels[j].dataset.xnTotp = "1";
      sels[j].style.setProperty("font-size", "16px", "important");
      sels[j].style.setProperty("min-height", "48px", "important");
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      var s = txt(b);
      if (ACTIONS.test(s)) {
        if (!b.classList.contains("xn-totp-action")) b.classList.add("xn-totp-action");
        if (b.dataset.xnTotp !== "1") {
          b.dataset.xnTotp = "1";
          b.style.setProperty("min-height", "44px", "important");
          b.style.setProperty("font-size", "15px", "important");
        }
      } else if (SMALL.test(s)) {
        if (!b.classList.contains("xn-totp-small")) b.classList.add("xn-totp-small");
        if (b.dataset.xnTotp !== "1") {
          b.dataset.xnTotp = "1";
          b.style.setProperty("min-height", "40px", "important");
        }
      }
    }
  }

  function codes() {
    var mono = root.querySelectorAll(".font-mono");
    for (var i = 0; i < mono.length; i++) {
      var e = mono[i];
      if (e.children.length || !/^[\d\s]{6,}$/.test(txt(e))) continue;
      if (!e.classList.contains("xn-totp-code")) e.classList.add("xn-totp-code");
    }
    var spans = root.querySelectorAll("span");
    for (var j = 0; j < spans.length; j++) {
      var sp = spans[j];
      if (sp.children.length || !/^\d{6,12}$/.test(txt(sp))) continue;
      if (!sp.classList.contains("xn-totp-bk")) sp.classList.add("xn-totp-bk");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnTotp === "1") continue;
      a.dataset.xnTotp = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); fields(); actions(); codes(); back(); } catch (e) {}
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
