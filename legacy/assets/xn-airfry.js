/* R1315 空气炸锅与微波炉用时换算合集 · xn-airfry.js
   标题归一 / 导航编号 / 输入可读名 / 复制与重置可读名 */
(function () {
  if (window.__XN_FRY__) return;
  window.__XN_FRY__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^工具([A-F])\s*[·:：-]?\s*(.*)$/);
      if (m) {
        var next = "工具" + CN[LETTER[m[1]]] + " · " + m[2].trim();
        if (h.textContent !== next) h.textContent = next;
        h.classList.add("xn-fry-tool");
        return;
      }
      var mm = t.match(/^[①-⑥]\s*(.+)$/);
      if (mm) {
        var idx = NUMS.indexOf(t.charAt(0));
        var n2 = "工具" + CN[Math.max(0, idx)] + " · " + mm[1].trim();
        if (h.textContent !== n2) h.textContent = n2;
        h.classList.add("xn-fry-tool");
      }
    });
  }

  /* ---- 导航：两套响应式文案都加编号 ---- */
  function enhanceNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    links.forEach(function (a, i) {
      var spans = Array.prototype.slice.call(a.querySelectorAll("span")).filter(function (s) { return s.textContent.trim(); });
      var longLabel = "";
      spans.forEach(function (s) {
        var raw = s.textContent.trim().replace(/^[①-⑥]\s*/, "");
        if (!longLabel && !/sm:hidden/.test(s.className)) longLabel = raw;
        var want = NUMS[i] + " " + raw;
        if (s.textContent !== want) s.textContent = want;
      });
      if (!longLabel) longLabel = (a.textContent || "").replace(/^[①-⑥]\s*/, "").trim();
      var al = "工具" + CN[i] + " " + longLabel;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 输入 aria：标题（单位） ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (inp) {
      if (inp.getAttribute("data-xn-aria") === "1") return;
      var unit = inp.getAttribute("aria-label") || "";
      var label = inp.closest("label");
      var title = "";
      if (label) {
        title = (label.textContent || "").trim().split(/[0-9０-９]/)[0].replace(/[：:\s]+$/, "").trim();
      }
      if (!title) {
        var fallback = { "℃": "温度", "分钟": "时间", "克": "重量", "瓦": "功率" };
        title = fallback[unit] || "";
      }
      var al = title ? title + "（" + unit + "）" : null;
      if (al && inp.getAttribute("aria-label") !== al) inp.setAttribute("aria-label", al);
      inp.setAttribute("data-xn-aria", "1");
    });
  }

  /* ---- 清理开发者用语 ---- */
  function cleanCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root li, #root p, #root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = el.textContent;
      if (t.indexOf("直接访问深链") < 0) return;
      var n = t.replace("或直接访问深链", "或直接打开对应标签").replace("直接访问深链", "直接打开对应标签");
      if (n !== t) el.textContent = n;
    });
  }

  /* ---- 复制 / 恢复默认 ---- */
  function enhanceButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (/一键复制/.test(t)) {
        b.classList.add("xn-fry-copy");
        if (b.getAttribute("aria-label") !== "复制换算结果") b.setAttribute("aria-label", "复制换算结果");
        b.style.setProperty("min-height", "44px", "important");
      }
      if (/恢复默认/.test(t) && b.getAttribute("aria-label") !== "恢复默认参数") {
        b.setAttribute("aria-label", "恢复默认参数");
      }
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceNav();
      enhanceInputs();
      enhanceButtons();
      cleanCopy();
    } catch (e) {}
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = null;
      run();
    }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest("a") || t.closest("button") || t.closest("label"))) {
      window.setTimeout(schedule, 140);
      window.setTimeout(schedule, 520);
    }
  });

  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].type === "childList" && muts[i].addedNodes.length) { schedule(); return; }
    }
  });
  try {
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(run, 1200);
})();
