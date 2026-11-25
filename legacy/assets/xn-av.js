/* 小凝工具站 · 影音与字幕速查增强 xn-av v1
 * 能力：6 个工具卡 76h/aria-current(按 hash)/去 #/ 路由；下拉 48 + 语义 aria；
 *       结果数字 11-13 → 12.5-15；LUFS/dBTP 胶囊；复制 40 具名；回到顶部。
 * 注入：legacy/npijbf2aq6.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_AV__) return;
  window.__XN_AV__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function stripRoute(root) {
    Array.prototype.forEach.call(root.querySelectorAll("#root h2"), function (h) {
      Array.prototype.forEach.call(h.querySelectorAll("span"), function (s) {
        if (/^#\/\S+$/.test((s.textContent || "").trim())) {
          s.style.display = "none";
          s.setAttribute("aria-hidden", "true");
          if (s.textContent) s.textContent = "";
        }
      });
      var t = (h.textContent || "").replace(/\s+/g, " ").trim();
      var c = t.replace(/\s*#\/\S+$/, "").trim();
      if (!c || c === t) return;
      if (h.children.length === 0) {
        h.textContent = c;
        return;
      }
      Array.prototype.forEach.call(h.childNodes, function (n) {
        if (n.nodeType === 3 && /#\/\S+/.test(n.nodeValue || "")) {
          n.nodeValue = (n.nodeValue || "").replace(/\s*#\/\S+/g, "");
        }
      });
    });
  }

  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root a"), function (a) {
      return vis(a) && a.getBoundingClientRect().height > 60 && a.getBoundingClientRect().height < 100;
    });
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-av-tab")) a.classList.add("xn-av-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var spans = Array.prototype.filter.call(a.querySelectorAll("span"), function (s) { return clean(s.textContent).length > 0; });
      var name = spans[0] ? clean(spans[0].textContent) : clean(a.textContent);
      var sub = spans[1] ? clean(spans[1].textContent) : "";
      var aria = name + (sub ? "：" + sub : "");
      if (aria && a.getAttribute("aria-label") !== aria) a.setAttribute("aria-label", aria);
    });
  }

  var SELECT_MAP = [
    { key: "字幕速查", names: ["字幕格式", "源帧率"] },
    { key: "音频速查", names: ["音频用途"] },
    { key: "视频速查", names: ["发布平台", "视频分辨率"] },
    { key: "录音与降噪", names: ["录音场景"] }
  ];

  function markSelects() {
    var sels = Array.prototype.filter.call(document.querySelectorAll("#root select"), vis);
    sels.forEach(function (s) {
      var aria = "";
      var prev = s.previousElementSibling;
      if (prev) aria = clean(prev.textContent).replace(/[：:]\s*$/, "");
      if (!aria || aria.length > 16) {
        var lab = s.closest("label");
        if (lab) aria = clean(lab.textContent).replace(/[：:]\s*$/, "").slice(0, 16);
      }
      if (!aria) {
        var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), vis);
        var title = h2 ? clean(h2.textContent) : "";
        SELECT_MAP.forEach(function (m) {
          if (!aria && title.indexOf(m.key) === 0) {
            var used = Array.prototype.indexOf.call(document.querySelectorAll("#root select"), s);
            var name = m.names[used];
            if (name) aria = name;
          }
        });
      }
      if (aria && s.getAttribute("aria-label") !== aria) s.setAttribute("aria-label", aria);
    });
  }

  function headingBefore(b) {
    var n = b;
    for (var depth = 0; depth < 5 && n; depth++) {
      var prev = n.previousElementSibling;
      while (prev) {
        if (prev.tagName === "H3") return clean(prev.textContent).replace(/[·\s]+$/, "");
        var h = prev.querySelector && prev.querySelector("h3");
        if (h) return clean(h.textContent).replace(/[·\s]+$/, "");
        prev = prev.previousElementSibling;
      }
      n = n.parentElement;
    }
    return "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent) !== "复制") return;
      if (!b.classList.contains("xn-av-copy")) b.classList.add("xn-av-copy");
      var h = headingBefore(b);
      var aria = h ? "复制" + h : "复制当前小节";
      if (aria.length > 26) aria = aria.slice(0, 26);
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-av-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      stripRoute(document);
      markTabs();
      markSelects();
      markButtons();
      ensureTop();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.addEventListener("hashchange", tick);
  document.addEventListener("click", function () { window.setTimeout(tick, 160); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 100);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
