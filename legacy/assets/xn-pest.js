/* 家庭防虫与灭鼠合集页增强（仅 mkzkx3rxwr 引用） */
(function () {
  "use strict";
  if (window.__XN_PEST__) return;
  window.__XN_PEST__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ---------- 占位标题 ---------- */
  var TOOL_NO = { E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        continue;
      }
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        var nt = (n.nodeValue || "").trim();
        var nm = /^工具([EF])(\s*)(.*)$/.exec(nt);
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 顶部工具切换当前态 ---------- */
  function markSwitcher() {
    var h2 = document.querySelector("#root h2");
    if (!h2) return;
    var title = txt(h2).replace(/^工具 \d{2}\s*/, "").replace(/^工具[EF]\s*/, "").trim();
    if (!title) return;
    /* 顶部切换卡：文本以工具名开头 */
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = txt(b);
      if (!/^(蚊虫防护|蟑蚁清巢|老鼠封堵|白蚁防治|工具\s?0?[56]|工具[EF])/.test(t)) continue;
      var name = t.replace(/^工具\s?0?\d\s*/, "").replace(/^工具[EF]\s*/, "");
      var on = name.indexOf(title) === 0;
      b.classList.add("xn-pest-tab");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* ---------- 关键数字 ---------- */
  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root strong, #root b, #root p");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      el.classList.remove("xn-pest-pct", "xn-pest-hours");
      if (/^\d+(\.\d+)?%[–-]\d+(\.\d+)?%$/.test(t)) el.classList.add("xn-pest-pct");
      else if (/^有效约 \d+[–-]\d+ 小时$/.test(t)) el.classList.add("xn-pest-hours");
    }
  }

  /* ---------- 回到工具切换 ---------- */
  function addBackTop() {
    if (document.getElementById("xn-pest-top")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "xn-pest-top";
    b.setAttribute("aria-label", "回到顶部切换工具");
    b.textContent = "↑ 切换工具";
    b.onclick = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    document.body.appendChild(b);
    function sync() {
      b.classList.toggle("is-show", window.scrollY > 600);
    }
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markSwitcher();
    markNumbers();
    addBackTop();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 200);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
