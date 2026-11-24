/* R1309 时区会议换算与时区缩写合集 · xn-clock.js
   编号/aria/tab 语义、复制可读名、缩写搜索、默认值自动换算 */
(function () {
  if (window.__XN_CLOCK__) return;
  window.__XN_CLOCK__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var MODE_NUM = { "会议换算": "①", "时区缩写": "②" };
  var TITLE_MAP = [
    ["会议参数", "工具一 · 会议换算"],
    ["时区缩写速查", "工具二 · 时区缩写速查"]
  ];
  var query = "";
  var ALIAS = {
    "东京": ["jst", "japan", "tokyo"],
    "日本": ["jst", "japan"],
    "上海": ["cst", "china"],
    "中国": ["cst", "china"],
    "香港": ["hkt", "hong kong"],
    "新加坡": ["sgt", "singapore"],
    "伦敦": ["gmt", "bst", "london"],
    "英国": ["gmt", "bst", "london"],
    "纽约": ["est", "edt", "new york", "eastern"],
    "洛杉矶": ["pst", "pdt", "los angeles", "pacific"],
    "美国": ["est", "edt", "pst", "pdt", "cst", "cdt", "mst", "mdt"],
    "印度": ["ist", "india"],
    "韩国": ["kst", "korea"],
    "首尔": ["kst", "korea"],
    "悉尼": ["aest", "aedt", "sydney"],
    "澳大利亚": ["aest", "aedt", "acst", "awst"],
    "新西兰": ["nzst", "nzdt"]
  };

  function matchRow(text, q) {
    if (!q) return true;
    if (text.indexOf(q) >= 0) return true;
    for (var k in ALIAS) {
      if (q.indexOf(k) >= 0 && ALIAS[k].some(function (a) { return text.indexOf(a) >= 0; })) return true;
    }
    return false;
  }

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      for (var i = 0; i < TITLE_MAP.length; i++) {
        if (t.indexOf(TITLE_MAP[i][0]) >= 0 && t.charAt(0) !== "工") {
          h.textContent = TITLE_MAP[i][1];
          h.classList.add("xn-h2-tool");
          return;
        }
      }
      if (t.charAt(0) === "工" && /^工具[一二三四五六]\s*·/.test(t)) h.classList.add("xn-h2-tool");
      var m = t.match(/^[①-⑥]\s*(.+)$/);
      if (m) {
        var idx = NUMS.indexOf(t.charAt(0));
        var base = m[1].trim();
        for (var j = 0; j < TITLE_MAP.length; j++) {
          if (base.indexOf(TITLE_MAP[j][0]) >= 0) base = TITLE_MAP[j][1].replace(/^工具[一二三四五六]\s*·\s*/, "");
        }
        var next = "工具" + ["一", "二", "三", "四", "五", "六"][Math.max(0, idx)] + " · " + base;
        if (h.textContent !== next) h.textContent = next;
        h.classList.add("xn-h2-tool");
      }
    });
  }

  /* ---- 模式按钮：①/② + aria-pressed ---- */
  function enhanceModes() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var raw = b.textContent.trim().replace(/^[①-⑥]\s*/, "");
      if (!MODE_NUM[raw] && raw !== "24 小时制" && raw !== "12 小时制") return;
      var want = MODE_NUM[raw] ? MODE_NUM[raw] + " " + raw : raw;
      if (b.textContent.trim() !== want) b.textContent = want;
      var active = /border-blue-400|bg-blue-50|bg-blue-600/.test(b.className);
      var pressed = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = raw === "24 小时制" || raw === "12 小时制" ? "时间显示制式：" + raw : "切换到" + raw;
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
    });
  }

  /* ---- 复制按钮可读名 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (t !== "复制" && t !== "复制结果") return;
      b.classList.add("xn-copy-btn");
      if (t === "复制结果") {
        if (b.getAttribute("aria-label") !== "复制换算结果") b.setAttribute("aria-label", "复制换算结果");
        return;
      }
      var row = b.parentElement;
      var codeEl = row && row.querySelector('span[class*="font-semibold"]');
      var code = codeEl ? codeEl.textContent.trim() : "";
      var al = code ? "复制 " + code + " 的时区说明" : "复制时区说明";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
    });
  }

  /* ---- 缩写搜索 ---- */
  function abbrList() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("#root .space-y-2"));
    for (var i = 0; i < lists.length; i++) {
      var rows = Array.prototype.slice.call(lists[i].children);
      if (rows.length >= 10 && rows.some(function (r) { return r.querySelector("button"); })) return lists[i];
    }
    return null;
  }

  function applyFilter(list, tools) {
    var rows = Array.prototype.slice.call(list.children);
    var q = query.trim().toLowerCase();
    var hit = 0;
    rows.forEach(function (r) {
      if (!r.getAttribute("data-xn-abbr")) r.setAttribute("data-xn-abbr", (r.textContent || "").trim());
      var text = r.getAttribute("data-xn-abbr").toLowerCase();
      var show = matchRow(text, q);
      if (show) hit++;
      r.style.display = show ? "" : "none";
    });
    var count = tools.querySelector(".xn-abbr-count");
    if (count) count.textContent = q ? "匹配 " + hit + " / 共 " + rows.length + " 个" : "共 " + rows.length + " 个";
  }

  function enhanceAbbr() {
    var list = abbrList();
    if (!list) return;
    var host = list.parentElement;
    var tools = host && host.querySelector(".xn-abbr-tools");
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "xn-abbr-tools";
      var input = document.createElement("input");
      input.type = "search";
      input.className = "xn-abbr-search";
      input.placeholder = "搜索缩写或英文名，如 UTC / JST / Japan（也支持：东京、伦敦）";
      input.setAttribute("aria-label", "搜索时区缩写");
      var count = document.createElement("span");
      count.className = "xn-abbr-count";
      tools.appendChild(input);
      tools.appendChild(count);
      host.insertBefore(tools, list);
      input.value = query;
      input.addEventListener("input", function () {
        query = input.value;
        applyFilter(list, tools);
      });
    }
    applyFilter(list, tools);
  }

  /* ---- 首屏用默认时间自动换算一次 ---- */
  function autoConvert() {
    if (window.__XN_CLOCK_AUTO__) return;
    var btn = Array.prototype.slice.call(document.querySelectorAll("#root button")).filter(visible).filter(function (b) {
      return b.textContent.trim() === "换算";
    })[0];
    if (!btn) return;
    window.__XN_CLOCK_AUTO__ = true;
    window.setTimeout(function () {
      try { btn.click(); } catch (e) {}
    }, 500);
  }

  /* ---- 日期时间/文本输入：内联提权重（页内样式优先级高） ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="datetime-local"], #root input[type="text"]'), function (inp) {
      if (inp.getAttribute("data-xn-style") === "1") return;
      inp.setAttribute("data-xn-style", "1");
      inp.style.setProperty("min-height", "48px", "important");
      inp.style.setProperty("font-size", "15.5px", "important");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceModes();
      enhanceCopy();
      enhanceAbbr();
      enhanceInputs();
      autoConvert();
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
    if (t && t.closest && t.closest("button")) {
      window.setTimeout(schedule, 140);
      window.setTimeout(schedule, 500);
    }
  });

  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].type === "childList" && muts[i].addedNodes.length) { schedule(); return; }
    }
  });
  try {
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true, characterData: true });
  } catch (e) {}
  window.setInterval(run, 1200);
})();
