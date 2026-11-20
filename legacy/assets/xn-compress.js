/* R1105 图片压缩与批量处理合集 — 人用友好增强（幂等）
   1. 6 tab：容器类、当前态
   2. 质量/最长边/格式芯片语义与分组
   3. 主操作/下载/重新选择命名
   4. 压缩前后结果：数值分级
   不改 React 逻辑。 */
(function () {
  if (window.__xnCmp) return;
  window.__xnCmp = 1;

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function vis(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function txt(el) {
    return (el.textContent || "").trim().replace(/\s+/g, " ");
  }
  function add(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }
  function setAttr(el, k, v) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root);
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box) add(box, "xn-cmp-tabs");
    anchors.forEach(function (a) {
      if ((a.className || "").indexOf("bg-blue-50") >= 0) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function chips(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var aria = b.getAttribute("aria-label") || "";
      var m = /^(质量|最长边|输出格式)：/.exec(aria);
      if (!m) return;
      add(b, "xn-cmp-chip");
      var group = b.parentElement;
      if (group) {
        add(group, "xn-cmp-chips");
        setAttr(group, "role", "group");
        setAttr(group, "aria-label", m[1] + "选项");
        var box = group.parentElement;
        if (box && /grid/.test(box.className || "")) add(box, "xn-cmp-params");
        else if (box && box.parentElement && /grid/.test(box.parentElement.className || "")) add(box.parentElement, "xn-cmp-params");
      }
    });
  }

  function results(root) {
    q("h3", root).forEach(function (h) {
      if (txt(h) !== "压缩前") return;
      var card = h.parentElement;
      var grid = card && card.parentElement;
      if (!grid) return;
      add(grid, "xn-cmp-result");
      q("dl > div", grid).forEach(function (row) {
        var dt = row.querySelector("dt");
        var dd = row.querySelector("dd");
        if (!dt || !dd) return;
        var k = txt(dt);
        if (k === "压缩率") add(dd, "xn-cmp-rate");
        else if (k === "体积") add(dd, "xn-cmp-vol");
      });
    });
  }

  function actions(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (/^(开始压缩|批量压缩|开始处理)$/.test(t)) {
        add(b, "xn-cmp-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t + "（本地处理，不上传）");
      } else if (/^(下载压缩图片|下载全部|批量下载)$/.test(t)) {
        add(b, "xn-cmp-download");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "下载压缩后的图片");
      } else if (t === "重新选择" || t === "重新选择图片") {
        add(b, "xn-cmp-reselect");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "重新选择图片");
        if (!b.getAttribute("title")) b.setAttribute("title", "重新选择图片");
      }
    });
    q("label", root).forEach(function (l) {
      var forId = l.getAttribute("for");
      if (!forId) return;
      var input = document.getElementById(forId);
      if (input && input.type === "file") add(l, "xn-cmp-drop");
    });
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      if (/^先点击上方虚线区域/.test(txt(d))) add(d, "xn-cmp-hint");
    });
    q("summary", root).forEach(function (s) {
      if (txt(s).indexOf("使用说明") === 0 && !s.getAttribute("aria-label")) {
        s.setAttribute("aria-label", "展开使用说明");
      }
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-compress", "1");
      tabs(root);
      chips(root);
      results(root);
      actions(root);
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 90);
  }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("hashchange", function () { setTimeout(enhance, 180); });
    setTimeout(enhance, 700);
    setTimeout(enhance, 1800);
    setInterval(schedule, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
