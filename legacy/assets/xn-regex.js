/* R1273 正则测试与替换合集（m9la4sue9a）· 人用友好层
 * - 顶部导航吸顶 + 滚动高亮
 * - 标志位补 aria-pressed/名称，常用正则卡补读屏名称
 * - 标题编号归一；结果区字号由 CSS 统一
 */
(function () {
  "use strict";
  if (window.__XN_REGEX__) return;
  window.__XN_REGEX__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;
  var raf = false;

  var LETTER = { A: "01", B: "02", C: "03", D: "04", E: "05", F: "06" };

  function syncNav() {
    var links = document.querySelectorAll("#root .rl-nav a");
    var secs = document.querySelectorAll('#root section.rx-card[id^="tool-"]');
    if (!links.length || !secs.length) return;
    var y = window.scrollY + 130;
    var cur = secs[0];
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top + window.scrollY <= y) cur = secs[i];
    }
    for (var j = 0; j < links.length; j++) {
      var id = (links[j].getAttribute("href") || "").replace("#/", "");
      if (cur && cur.id === "tool-" + id) setAttr(links[j], "aria-current", "page");
      else links[j].removeAttribute("aria-current");
    }
  }

  function onScroll() {
    if (raf) return;
    raf = true;
    requestAnimationFrame(function () { raf = false; syncNav(); });
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 顶部导航 */
      var nav = root.querySelector("nav");
      if (nav) add(nav, "rl-nav");

      /* 2) 标题编号归一 */
      var h2s = root.querySelectorAll(".rx-h2");
      for (var i = 0; i < h2s.length; i++) {
        var raw = txt(h2s[i]);
        var m = raw.match(/^工具\s*([A-F])\s*(.*)$/);
        if (!m) continue;
        var rest = (m[2] || "").replace(/^[·:：\s]+/, "");
        var t = "工具 " + LETTER[m[1]] + (rest ? " · " + rest : "");
        if (t !== raw) h2s[i].textContent = t;
      }

      /* 3) 标志位 */
      var flags = root.querySelectorAll(".rx-flag");
      for (var f = 0; f < flags.length; f++) {
        var fl = flags[f];
        var on = fl.classList.contains("rx-flag-on");
        setAttr(fl, "aria-pressed", on ? "true" : "false");
        var key = fl.querySelector("b") ? txt(fl.querySelector("b")) : "";
        var name = fl.querySelector("span") ? txt(fl.querySelector("span")) : "";
        var aria = key ? key + " " + name : name;
        if (aria) { setAttr(fl, "aria-label", aria); fl.title = aria; }
      }

      /* 4) 常用正则卡读屏名称 */
      var presets = root.querySelectorAll(".rx-preset");
      for (var p = 0; p < presets.length; p++) {
        var pr = presets[p];
        if (pr.getAttribute("aria-label")) continue;
        var nmEl = pr.querySelector("b, .rx-preset-name, strong");
        var nm = nmEl ? txt(nmEl) : txt(pr).slice(0, 12);
        if (nm) setAttr(pr, "aria-label", "填入常用正则：" + nm);
      }

      /* 5) 工具卡（供 CSS 使用） */
      var cards = root.querySelectorAll("section");
      for (var c = 0; c < cards.length; c++) {
        if (/^tool-/.test(cards[c].id || "")) add(cards[c], "rx-card");
      }
      syncNav();
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", function () { setTimeout(syncNav, 120); setTimeout(syncNav, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); setTimeout(syncNav, 400); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 160);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
