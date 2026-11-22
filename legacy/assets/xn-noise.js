/* R1215 噪音分贝与听力保护速查：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(分贝对照|听力安全时长|家电噪音|隔音与耳塞|剂量|全屋排查)$/;
  var HASHES = {
    "分贝对照": "#/db",
    "听力安全时长": "#/hearing",
    "家电噪音": "#/appliance",
    "隔音与耳塞": "#/insulate",
    "剂量": "#/dose",
    "全屋排查": "#/homescan"
  };
  var ACTIONS = /^(对照 \/ 评估|计算 \/ 评估|查询 \/ 评估|评估 \/ 选型|排查 \/ 评估|复制结果)$/;
  var APPLIANCE = /^(空调|洗衣机|吸尘器|风扇|冰箱|吹风机)\s?\d+.*dB$/;
  var SOURCE = /^(交通|邻居|家电|施工)$/;

  function isOn(el) {
    var bg = getComputedStyle(el).backgroundColor;
    return bg !== "rgb(255, 255, 255)" && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
  }

  function tabs() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-noise-tabs")) {
      holder.classList.add("xn-noise-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "噪音工具切换");
    }
    var hash = location.hash || "#/db";
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var name = txt(a);
      var target = HASHES[name] || (a.getAttribute("href") || "");
      var on = target && hash.indexOf(target) === 0;
      a.classList.add("xn-noise-tab");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function groups() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b)) continue;
      var s = txt(b);
      var isApp = APPLIANCE.test(s);
      var isSrc = SOURCE.test(s);
      if (!isApp && !isSrc) continue;
      b.classList.add("xn-noise-preset");
      b.setAttribute("role", "radio");
      var next = isOn(b) ? "true" : "false";
      if (b.getAttribute("aria-checked") !== next) b.setAttribute("aria-checked", next);
      var holder = b.parentElement;
      if (holder && holder.getAttribute("role") !== "radiogroup") {
        holder.setAttribute("role", "radiogroup");
        holder.setAttribute("aria-label", isApp ? "家电噪音预设" : "噪音来源");
      }
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !ACTIONS.test(txt(b))) continue;
      if (!b.classList.contains("xn-noise-action")) b.classList.add("xn-noise-action");
      if (b.dataset.xnNoise !== "1") {
        b.dataset.xnNoise = "1";
        b.style.setProperty("min-height", "44px", "important");
        b.style.setProperty("font-size", "14px", "important");
      }
    }
  }

  function fields() {
    var ns = root.querySelectorAll("input[type=number]");
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].dataset.xnNoise === "1") continue;
      ns[i].dataset.xnNoise = "1";
      ns[i].style.setProperty("font-size", "20px", "important");
      ns[i].style.setProperty("min-height", "48px", "important");
      ns[i].style.setProperty("font-variant-numeric", "tabular-nums", "important");
    }
    var sels = root.querySelectorAll("select");
    for (var j = 0; j < sels.length; j++) {
      if (sels[j].dataset.xnNoise === "1") continue;
      sels[j].dataset.xnNoise = "1";
      sels[j].style.setProperty("font-size", "16px", "important");
      sels[j].style.setProperty("min-height", "48px", "important");
    }
  }

  function labels() {
    var nodes = root.querySelectorAll("div,span,p");
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (e.children.length || !vis(e)) continue;
      var s = txt(e);
      if (/^\d{2,3}$/.test(s) && parseFloat(getComputedStyle(e).fontSize) >= 24) {
        if (!e.classList.contains("xn-noise-big")) e.classList.add("xn-noise-big");
      }
      if (/^(安全|注意|危险|有害)$/.test(s) && parseFloat(getComputedStyle(e).fontSize) <= 13) {
        if (!e.classList.contains("xn-noise-badge")) e.classList.add("xn-noise-badge");
      }
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/工具箱|返回工具集/.test(txt(a)) || a.dataset.xnNoise === "1") continue;
      a.dataset.xnNoise = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { tabs(); groups(); actions(); fields(); labels(); back(); } catch (e) {}
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
