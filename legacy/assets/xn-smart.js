/* R1218 智能家居设备与耗电合集：语义与触达增强（轻量、事件驱动） */
(function () {
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var TABS = /^(待机耗电|网关协议|传感器布点|场景联动|网络布点)$/;

  function nav() {
    var all = root.querySelectorAll("a");
    var links = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (vis(all[i]) && TABS.test(txt(all[i]))) links.push(all[i]);
    }
    if (!links.length) return;
    var holder = links[0].parentElement;
    if (holder && !holder.classList.contains("xn-smart-tabs")) {
      holder.classList.add("xn-smart-tabs");
      holder.setAttribute("role", "tablist");
      holder.setAttribute("aria-label", "智能家居工具切换");
    }
    for (i = 0; i < links.length; i++) {
      var a = links[i];
      var on = a.getAttribute("aria-current") === "page";
      a.classList.add("xn-smart-tab");
      a.setAttribute("role", "tab");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    }
  }

  function actions() {
    var bs = root.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!vis(b) || !/^(计算|复制结果)$/.test(txt(b))) continue;
      if (!b.classList.contains("xn-smart-action")) b.classList.add("xn-smart-action");
      if (b.dataset.xnSmart !== "1") {
        b.dataset.xnSmart = "1";
        b.style.setProperty("min-height", "48px", "important");
        b.style.setProperty("font-size", "15px", "important");
      }
    }
  }

  function fields() {
    var ins = root.querySelectorAll("input[type=text]");
    for (var i = 0; i < ins.length; i++) {
      var el = ins[i];
      if (!vis(el)) continue;
      if (!/(数量|功耗|占比|电价|功率|面积|距离|人数|台数)/.test((el.id || "") + " " + (el.name || "") + " " + (el.getAttribute("aria-label") || ""))) {
        // 通过所在 label 文案判断是否数值输入
        var lb = el.closest("label");
        var labelText = lb ? txt(lb) : "";
        if (!/(数量|功耗|占比|电价|功率|面积|距离|人数|台数|瓦|度|%|元)/.test(labelText)) continue;
      }
      el.style.setProperty("font-size", "16px", "important");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-variant-numeric", "tabular-nums", "important");
      el.setAttribute("inputmode", "decimal");
    }
  }

  function back() {
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/返回工具集/.test(txt(a)) || a.dataset.xnSmart === "1") continue;
      a.dataset.xnSmart = "1";
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 10px", "important");
      a.style.setProperty("border-radius", "10px", "important");
    }
  }

  function run() {
    try { nav(); actions(); fields(); back(); } catch (e) {}
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
