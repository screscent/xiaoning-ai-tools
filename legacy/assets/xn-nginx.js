/* R1277 Nginx 配置合集（sfb4eqy97s）· 人用友好层
 * - 导航 44px / aria-current；隐藏重复的小号导航项
 * - 片段卡：代码 13px、说明表 13、复制 40px + 具名
 * - 搜索计数/空状态/清空；并发与上游控件放大；工具 06 归一
 */
(function () {
  "use strict";
  if (window.__XN_NGINX__) return;
  window.__XN_NGINX__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var applying = false;

  var CHIPS = /^(反向代理|WebSocket|负载均衡|日志|HTTPS|缓存|gzip 压缩|静态站点 \/ SPA|限流|跨域|轮询|权重|ip_hash)$/;

  function searchInput() { return document.querySelector("#root input.nx-search"); }

  function ensureHint() {
    var inp = searchInput();
    if (!inp) return null;
    var box = inp.closest("div.relative") || inp.parentElement;
    var outer = box && box.parentElement;
    if (!box || !outer) return null;
    var hint = outer.querySelector(".nx-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "nx-hint";
      outer.insertBefore(hint, box.nextSibling);
    }
    return hint;
  }

  function updateHint() {
    var inp = searchInput();
    var hint = ensureHint();
    if (!inp || !hint) return;
    if (!vis(inp)) { hint.style.display = "none"; return; }
    hint.style.display = "";
    var n = 0;
    var hs = document.querySelectorAll("#root section h3");
    for (var i = 0; i < hs.length; i++) if (vis(hs[i])) n += 1;
    var q = (inp.value || "").trim();
    var body = q ? "匹配 <b>" + n + "</b> 项（关键词：" + q.replace(/[&<>"]/g, "") + "）" : "共 <b>" + n + "</b> 项 · 输入关键词即时过滤";
    if (q && n === 0) body = '<span class="nx-empty">没有匹配内容，试试 proxy_pass / gzip / 跨域</span>';
    var html = "<span>" + body + "</span>" + (q ? '<button type="button" class="nx-clear">清空</button>' : "");
    if (hint.innerHTML !== html) {
      hint.innerHTML = html;
      var clr = hint.querySelector(".nx-clear");
      if (clr) clr.onclick = function () {
        var live = searchInput();
        if (!live) return;
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(live, "");
        live.dispatchEvent(new Event("input", { bubbles: true }));
        try { live.focus(); } catch (e) {}
        setTimeout(updateHint, 120);
        setTimeout(updateHint, 400);
      };
    }
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 导航 */
      var navs = root.querySelectorAll("nav a");
      for (var i = 0; i < navs.length; i++) {
        var a = navs[i];
        if (/^Nginx 配置合集$/.test(txt(a)) || a.getBoundingClientRect().height < 28) { add(a, "sv-nav-mini"); continue; }
        if (/emerald-400|emerald-500|text-emerald-300/.test(String(a.className))) setAttr(a, "aria-current", "page");
        else a.removeAttribute("aria-current");
      }

      /* 2) 标题归一 */
      var h2s = root.querySelectorAll("section h2");
      for (var h = 0; h < h2s.length; h++) {
        var raw = txt(h2s[h]);
        var m = raw.match(/^工具\s*([A-F])\s*(.*)$/);
        if (!m) continue;
        var t = "工具 0" + (m[1].charCodeAt(0) - 64) + " · " + (m[2] || "").replace(/^[·:：\s]+/, "");
        if (t !== raw) h2s[h].textContent = t;
      }

      /* 3) 片段卡 / 复制按钮 */
      var btns = root.querySelectorAll("section button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt);
        if (/^(复制片段|复制配置|复制结果)$/.test(label)) {
          add(bt, "sv-copy");
          setAttr(bt, "aria-label", label);
          var card = bt.closest("div.rounded-lg, div.rounded-xl, div.rounded-2xl") || bt.parentElement;
          if (card) {
            add(card, "sv-snip");
            var h3 = card.querySelector("h3");
            if (h3) {
              add(h3.parentElement, "sv-snip-head");
              setAttr(bt, "aria-label", "复制片段：" + txt(h3));
            }
            var inner = card.querySelectorAll("code");
            for (var ic = 0; ic < inner.length; ic++) add(inner[ic], "sv-code");
          }
        }
        if (/^恢复默认$/.test(label)) add(bt, "sv-mini");
        if (CHIPS.test(label.replace(/\s+/g, " "))) {
          add(bt, "sv-chip");
          setAttr(bt, "aria-pressed", /emerald-500|emerald-400|bg-emerald/.test(String(bt.className)) ? "true" : "false");
        }
      }

      /* 4) 搜索 */
      var search = root.querySelector('input[placeholder*="过滤"], input[placeholder*="搜索"]');
      if (search) {
        add(search, "nx-search");
        updateHint();
      }

      /* 4.1) 代码块字号 */
      var codes = root.querySelectorAll("section code, section li code");
      for (var ci = 0; ci < codes.length; ci++) {
        if ((codes[ci].textContent || "").length > 20) add(codes[ci], "sv-code");
      }

      /* 5) 常见坑提示 */
      var ps = root.querySelectorAll("section div, section p");
      for (var p = 0; p < ps.length; p++) {
        var tx = txt(ps[p]);
        if (tx.length > 12 && tx.length < 300 && /常见坑提示|⚠|^注意/.test(tx)) {
          if (!ps[p].parentElement || !ps[p].parentElement.closest(".sv-warn")) add(ps[p], "sv-warn");
        }
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); setTimeout(apply, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  document.addEventListener("input", function () { setTimeout(updateHint, 100); }, true);
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
