/* 居家安全自查合集页增强（仅 2q8fbuqqxb 引用）
 * - 隐藏导航路由提示
 * - 每个分组加「全选本组 / 清空本组」
 */
(function () {
  "use strict";
  if (window.__XN_HOME__) return;
  window.__XN_HOME__ = true;

  function txt(el) { return (el.textContent || "").trim(); }

  function hideRouteHints() {
    [].slice.call(document.querySelectorAll('#root nav a span')).forEach(function (s) {
      if (/^#\/[\w-]+$/.test(txt(s))) s.remove();
    });
  }

  function sectionOf(countEl) {
    var n = countEl;
    for (var i = 0; i < 6 && n; i++, n = n.parentElement) {
      var boxes = n.querySelectorAll('#root button[role="checkbox"], button[role="checkbox"]');
      if (boxes.length >= 2 && /^\d+\/\d+$/.test(txt(countEl))) return { root: n, boxes: boxes };
    }
    return null;
  }

  function state(boxes) {
    var done = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].getAttribute("aria-checked") === "true") done++;
    return { done: done, total: boxes.length };
  }

  function ensureToggle(countEl) {
    var info = sectionOf(countEl);
    if (!info || !info.root) return;
    if (info.root.querySelector(".xn-group-btn")) return;
    var host = countEl.parentElement;
    if (!host) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "xn-group-btn";
    btn.onclick = function () {
      var st = state(info.boxes);
      var selectAll = st.done < st.total;
      [].slice.call(info.boxes).forEach(function (b, i) {
        var on = b.getAttribute("aria-checked") === "true";
        if (selectAll ? !on : on) setTimeout(function () { b.click(); }, i * 30);
      });
      setTimeout(updateAll, info.boxes.length * 30 + 120);
    };
    host.appendChild(btn);
    btn.__countEl = countEl;
  }

  function syncToggles() {
    [].slice.call(document.querySelectorAll("#root .xn-group-btn")).forEach(function (btn) {
      var info = sectionOf(btn.__countEl);
      if (!info) return;
      var st = state(info.boxes);
      var label = st.done < st.total ? "全选本组" : "清空本组";
      if (txt(btn) !== label) btn.textContent = label;
      btn.title = label + "（" + st.done + "/" + st.total + "）";
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    hideRouteHints();
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (el) {
      if (el.children.length) return;
      if (/^\d+\/\d+$/.test(txt(el))) ensureToggle(el);
    });
    syncToggles();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-checked"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
