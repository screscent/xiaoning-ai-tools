/* 家庭维修与工具速查合集页增强（仅 2q8ftcqqxb 引用） */
(function () {
  "use strict";
  if (window.__XN_REPAIR__) return;
  window.__XN_REPAIR__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function route() {
    var h = (location.hash || "").replace(/^#/, "");
    return h || "/";
  }

  /* ---------- 1. tab ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll("a")).filter(function (a) { return /^#\//.test(a.getAttribute("href") || ""); });
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs")) wrap.classList.add("xn-tabs");
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + route();
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 2. 搜索计数与空状态 ---------- */
  function itemCount() {
    return [].slice.call(document.querySelectorAll("#root li.group")).filter(visible).length;
  }
  function markSearch() {
    var input = document.querySelector("#root #quick-search");
    if (!input) return;
    var row = input.parentElement ? input.parentElement.parentElement : null;
    if (!row || !row.parentElement) return;
    var count = row.parentElement.querySelector(".xn-search-count");
    if (!count || !count.isConnected) {
      count = document.createElement("div");
      count.className = "xn-search-count";
      row.parentElement.insertBefore(count, row.nextSibling);
    }
    var empty = row.parentElement.querySelector(".xn-empty");
    var q = (input.value || "").trim();
    var n = itemCount();
    if (!q) {
      if (count.textContent) count.textContent = "";
      count.style.display = "none";
      if (empty) empty.style.display = "none";
      return;
    }
    count.style.display = "";
    var msg = "筛选「" + q + "」：找到 " + n + " 项";
    if (count.__xnMsg !== msg) {
      count.__xnMsg = msg;
      count.innerHTML = "筛选「" + q.replace(/[<>&]/g, "") + "」：找到 <b>" + n + "</b> 项";
    }
    if (!empty || !empty.isConnected) {
      empty = document.createElement("div");
      empty.className = "xn-empty";
      empty.textContent = "没有匹配项，换个关键词试试；也可以清空搜索查看全部。";
      count.parentElement.insertBefore(empty, count.nextSibling);
    }
    empty.style.display = n === 0 ? "" : "none";
  }

  /* ---------- 3. 复制按钮 ---------- */
  function itemName(li) {
    var s = li.querySelector('span[class*="text-[13px]"]');
    if (s && txt(s)) return txt(s);
    var spans = li.querySelectorAll("span");
    for (var i = 0; i < spans.length; i++) {
      var t = txt(spans[i]);
      if (t && t !== "必备" && t !== "建议" && t !== "可选" && t.length <= 24) return t;
    }
    return "";
  }
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var t = txt(b);
      if (/^复制全部/.test(t)) {
        if (!b.classList.contains("xn-copy-all")) b.classList.add("xn-copy-all");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制当前标签全部内容");
        return;
      }
      var li = b.closest("li.group");
      if (li) {
        if (!b.classList.contains("xn-item-copy")) b.classList.add("xn-item-copy");
        var name = itemName(li);
        var aria = name ? "复制「" + name + "」" : "复制本条";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.getAttribute("title")) b.setAttribute("title", aria);
        return;
      }
      if (/^复制$/.test(t)) {
        if (!b.classList.contains("xn-section-copy")) b.classList.add("xn-section-copy");
        var p = b, h3 = null;
        for (var i = 0; i < 3 && p; i++) {
          if (p.parentElement && p.parentElement.querySelector && p.parentElement.querySelector("h3")) { h3 = p.parentElement.querySelector("h3"); break; }
          p = p.parentElement;
        }
        var sa = h3 ? "复制「" + txt(h3) + "」清单" : "复制本节";
        if (b.getAttribute("aria-label") !== sa) b.setAttribute("aria-label", sa);
        return;
      }
      /* CopyButton 图标按钮：无文字、aria-label 为空 */
      var isCopy = b.getAttribute("data-code-inspect-component") === "CopyButton" || b.getAttribute("aria-label") === "";
      if (!isCopy && t) return;
      if (!isCopy) return;
      if (!b.classList.contains("xn-item-copy")) b.classList.add("xn-item-copy");
      var nm = "";
      var q = b.parentElement;
      for (var k = 0; k < 4 && q && !nm; k++) {
        var spans = q.querySelectorAll("span");
        for (var j = 0; j < spans.length; j++) {
          var st = txt(spans[j]);
          if (st && st !== "必备" && st !== "建议" && st !== "可选" && st.length <= 30) { nm = st; break; }
        }
        q = q.parentElement;
      }
      var ca = nm ? "复制「" + nm + "」" : "复制本条内容";
      if (b.getAttribute("aria-label") !== ca) b.setAttribute("aria-label", ca);
      if (!b.getAttribute("title")) b.setAttribute("title", ca);
    });
  }

  /* ---------- 4. 标签与计数 ---------- */
  function markTags() {
    var spans = document.querySelectorAll("#root span");
    for (var i = 0; i < spans.length; i++) {
      var el = spans[i];
      var t = txt(el);
      if (t === "必备" && !el.classList.contains("xn-tag-must")) {
        el.classList.add("xn-tag", "xn-tag-must");
      } else if (t === "建议" && !el.classList.contains("xn-tag-rec")) {
        el.classList.add("xn-tag", "xn-tag-rec");
      } else if (t === "可选" && !el.classList.contains("xn-tag-opt")) {
        el.classList.add("xn-tag", "xn-tag-opt");
      } else if (/^\d+\s*项$/.test(t) && !el.classList.contains("xn-count") && el.children.length === 0) {
        el.classList.add("xn-count");
      }
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markSearch();
    markCopy();
    markTags();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
    document.addEventListener("input", function (e) {
      if (e.target && e.target.id === "quick-search") schedule();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
