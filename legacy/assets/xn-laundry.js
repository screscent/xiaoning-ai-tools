/* R1115 衣物洗护与面料速查合集 — 人用友好增强（幂等）
   1. 页签 aria-current / aria-label 去重
   2. 卡片标题/描述类
   3. 复制按钮 40/44
   4. 移动端符号列表结构化
   不改 React 逻辑。 */
(function () {
  if (window.__xnLaundry) return;
  window.__xnLaundry = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root).filter(vis);
    if (!anchors.length) return;
    add(anchors[0].parentElement, "xn-laundry-tabs");
    anchors.forEach(function (a) {
      add(a, "xn-laundry-card");
      var spans = q("span", a).filter(function (s) { return txt(s); });
      var titleEl = spans.filter(function (s) {
        return /font-semibold|font-bold/.test(s.className || "") && txt(s).length > 1;
      })[0];
      if (!titleEl) {
        titleEl = spans.filter(function (s) { return txt(s).length > 1 && txt(s).length <= 12; })[0] || spans[1] || null;
      }
      var title = titleEl ? txt(titleEl) : txt(a);
      var desc = spans.length ? spans[spans.length - 1] : null;
      if (desc && desc !== titleEl && !desc.children.length && txt(desc).length > 4) add(desc, "xn-laundry-desc");
      if (titleEl) add(titleEl, "xn-laundry-title");
      a.setAttribute("aria-label", title);
      var on = /bg-\[#2563eb\]|bg-blue-600/.test(a.className || "");
      setAttr(a, "aria-current", on ? "page" : "false");
    });
  }

  function copies(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      if (/^复制/.test(txt(b)) || /^复制/.test(b.getAttribute("aria-label") || "")) add(b, "xn-laundry-copy");
    });
  }

  function mobileList(root) {
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      if (!/\bmd:hidden\b/.test(d.className || "")) return;
      add(d, "xn-laundry-list");
      q(":scope > div", d).forEach(function (item) {
        add(item, "xn-laundry-item");
        q("div,span", item).forEach(function (el) {
          if (el.children.length) return;
          var t = txt(el);
          if (!t) return;
          if (t.length <= 8 && !/[。，；]/.test(t)) add(el, "xn-laundry-name");
          else if (t.length > 10) add(el, "xn-laundry-note");
        });
      });
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      tabs(root);
      copies(root);
      mobileList(root);
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() { clearTimeout(timer); timer = setTimeout(enhance, 90); }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("hashchange", function () { setTimeout(enhance, 200); });
    setTimeout(enhance, 800);
    setInterval(schedule, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
