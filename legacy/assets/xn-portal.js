/* 小凝工具站 · 门户增强 xn-portal v1（渐进增强，不改数据与链接）
 * 能力：搜索防抖 / 分类按钮 aria-pressed 与数字徽标 / 友好计数 / 空结果提示 /
 *      清空搜索 / 「/」聚焦与 Esc 清空 / 分组标题随结果收起 / 回到顶部。
 * 注入：legacy/index.html 的 </body> 前追加 <script src="./assets/xn-portal.js" defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PORTAL__) return;
  window.__XN_PORTAL__ = true;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var q = document.querySelector("#q");
    if (!q) return;

    var cnt = document.querySelector("#cnt");
    var tops = document.querySelectorAll(".top");
    var searchTop = tops[0] || null;
    var chipTop = tops[1] || null;
    if (searchTop) searchTop.classList.add("xn-p-search");
    if (chipTop) chipTop.classList.add("xn-p-chips");

    var cards = [].slice.call(document.querySelectorAll(".card"));
    var btns = [].slice.call(document.querySelectorAll(".chipbtn"));
    var groups = [].slice.call(document.querySelectorAll("main .group"));
    var main = document.querySelector("main");

    /* 清掉页面内联脚本的旧绑定，由本增强接管（静态逻辑保留作降级） */
    q.oninput = null;
    btns.forEach(function (b) { b.onclick = null; });

    /* 分类按钮：拆出数字徽标 + aria-pressed（幂等） */
    btns.forEach(function (b) {
      if (!b.dataset.xnInit) {
        var t = (b.textContent || "").trim();
        var m = t.match(/^(.*?)\s*(\d+)$/);
        if (m) {
          b.textContent = "";
          var s = document.createElement("span");
          s.textContent = m[1];
          var n = document.createElement("b");
          n.className = "xn-p-n";
          n.textContent = m[2];
          b.appendChild(s);
          b.appendChild(n);
        }
        b.dataset.xnInit = "1";
      }
      b.setAttribute("aria-pressed", b.classList.contains("on") ? "true" : "false");
    });

    /* 空结果提示 */
    var empty = document.querySelector(".xn-p-empty");
    if (!empty && main) {
      empty = document.createElement("div");
      empty.className = "xn-p-empty";
      empty.setAttribute("role", "status");
      empty.innerHTML = "<b>没有找到匹配的工具</b><span>试试更短的关键词，或点「全部」查看完整列表</span>";
      main.appendChild(empty);
    }

    /* 清空搜索按钮 */
    if (searchTop && !searchTop.querySelector(".xn-p-clear")) {
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "xn-p-clear";
      clear.setAttribute("aria-label", "清空搜索");
      clear.title = "清空搜索";
      clear.textContent = "\u00d7";
      clear.addEventListener("click", function () {
        q.value = "";
        apply();
        q.focus();
      });
      searchTop.appendChild(clear);
    }

    if (cnt) cnt.setAttribute("aria-live", "polite");

    /* 子工具序号：与合集页内「工具一~六」顺序一致 */
    cards.forEach(function (c) {
      var links = c.querySelectorAll(".subs a");
      for (var i = 0; i < links.length; i++) {
        if (!links[i].dataset.no) links[i].dataset.no = ("0" + (i + 1)).slice(-2);
      }
    });

    var cat = "";
    var timer = null;

    function syncGroups() {
      groups.forEach(function (g) {
        var grid = g.nextElementSibling;
        var anyVisible = false;
        if (grid) {
          cards.forEach(function (c) {
            if (grid.contains(c) && c.style.display !== "none") anyVisible = true;
          });
        }
        g.style.display = anyVisible ? "" : "none";
      });
    }

    function apply() {
      var kw = (q.value || "").trim().toLowerCase();
      var n = 0;
      cards.forEach(function (c) {
        var hit = (!cat || c.dataset.cat === cat) && (!kw || (c.dataset.search || "").toLowerCase().indexOf(kw) >= 0);
        c.style.display = hit ? "" : "none";
        if (hit) n++;
      });
      if (cnt) cnt.textContent = "共 " + cards.length + " 个工具 · 当前显示 " + n + " 个";
      if (empty) empty.classList.toggle("show", n === 0);
      syncGroups();
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(apply, 110);
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          var on = x === b;
          x.classList.toggle("on", on);
          x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        cat = b.dataset.cat || "";
        apply();
      });
    });

    q.addEventListener("input", schedule);
    q.addEventListener("search", apply);

    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        q.focus();
        q.select();
      } else if (e.key === "Escape" && document.activeElement === q && q.value) {
        q.value = "";
        apply();
      }
    });

    /* 回到顶部 */
    if (!document.querySelector("#xn-p-top")) {
      var top = document.createElement("button");
      top.type = "button";
      top.id = "xn-p-top";
      top.setAttribute("aria-label", "回到顶部");
      top.title = "回到顶部";
      top.addEventListener("click", function () {
        try { window.scrollTo({ top: 0, behavior: "smooth" }); }
        catch (err) { window.scrollTo(0, 0); }
      });
      document.body.appendChild(top);
      var onScroll = function () { top.classList.toggle("show", window.scrollY > 640); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    apply();
  });
})();
