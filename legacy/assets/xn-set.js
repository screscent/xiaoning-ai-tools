/* 小凝工具站 · sets 工具集页增强 xn-set v1
 * 能力：工具标签 44h/aria-current；下拉与搜索 52h；卡片与按钮打标；统计数字放大；回到顶部。
 * 注入：sets/*.html（head 追加 CSS、body 末尾追加本脚本）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_SET__) return;
  window.__XN_SET__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markTabs() {
    each(document.querySelectorAll("nav.tabs a"), function (a) {
      if (!vis(a)) return;
      var on = a.classList.contains("on");
      setA(a, "aria-current", on ? "page" : "false");
      if (!a.getAttribute("data-xn-tab")) {
        setA(a, "aria-label", "切换到：" + clean(a.textContent));
        setA(a, "data-xn-tab", "1");
      }
    });
  }

  function markFields() {
    var pick = document.getElementById("pick");
    if (pick) { if (!pick.getAttribute("aria-label")) setA(pick, "aria-label", "选择工具"); }
    var q = document.getElementById("q");
    if (q) { if (!q.getAttribute("aria-label")) setA(q, "aria-label", "搜索工具"); }
    each(document.querySelectorAll("button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("primary") && !b.getAttribute("data-xn-btn")) {
        setA(b, "aria-label", clean(b.textContent) + "（主操作）");
        setA(b, "data-xn-btn", "1");
      }
    });
  }

  function markStats() {
    each(document.querySelectorAll("#istats, #ostats"), function (s) { if (vis(s)) add(s, "xn-set-stat"); });
    each(document.querySelectorAll(".card .open"), function (o) {
      var href = o.closest("a") && o.closest("a").getAttribute("href");
      if (href && !o.getAttribute("data-xn-open")) {
        setA(o, "aria-hidden", "true");
        setA(o, "data-xn-open", "1");
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-set-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markTabs(); markFields(); markStats(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 500);
  window.setTimeout(tick, 1500);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
