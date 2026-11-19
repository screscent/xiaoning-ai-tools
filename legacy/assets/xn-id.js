/* 标识符与密钥生成合集页增强（仅 2qcjfcqqxb 引用）
 * - 数量/词数/随机长度快捷值；ULID 时间戳「现在」
 * - 生成按钮上方当前设置摘要（数量 + 选项 + 勾选项）
 * - 熵值数字加强、每行复制按钮补 aria
 */
(function () {
  "use strict";
  if (window.__XN_ID__) return;
  window.__XN_ID__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function inputBy(prefix) {
    return [].slice.call(document.querySelectorAll("#root input")).filter(function (i) {
      return (i.getAttribute("aria-label") || "").indexOf(prefix) === 0;
    })[0];
  }

  var PRESETS = [
    { re: /^生成数量/, vals: [1, 5, 10, 20, 50], unit: "" },
    { re: /^词数/, vals: [3, 4, 6, 8], unit: "" },
    { re: /^随机长度/, vals: [5, 10, 16, 32], unit: "" }
  ];

  function addChips(input) {
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].re.test(label)) { rule = PRESETS[i]; break; }
    if (!rule) return;
    var field = input.parentElement;
    if (!field || field.querySelector(".xn-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v + rule.unit;
      b.onclick = function () { setInput(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    field.appendChild(wrap);
    input.addEventListener("input", function () { sync(input, wrap, rule); });
    sync(input, wrap, rule);
  }

  function sync(input, wrap, rule) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === rule.vals[i]);
    });
  }

  /* ULID 时间戳：加「现在」快捷 */
  function enhanceTimestamp() {
    var inp = inputBy("时间戳");
    if (!inp) return;
    var field = inp.parentElement;
    var host = field && field.parentElement;
    if (!host || host.querySelector(".xn-now")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "xn-now";
    b.textContent = "现在";
    b.title = "填入当前毫秒时间戳";
    b.style.cssText = "display:inline-flex;align-self:flex-start;width:auto;margin-top:6px;min-height:28px;padding:2px 12px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;color:#475569;font-size:12.5px;cursor:pointer";
    b.onclick = function () { setInput(inp, Date.now()); setTimeout(updateAll, 40); };
    host.appendChild(b);
  }

  /* 每行复制按钮补 aria */
  function fixRowCopy() {
    [].slice.call(document.querySelectorAll("#root li")).forEach(function (li) {
      var b = li.querySelector("button");
      if (b && !txt(b) && !b.getAttribute("aria-label")) {
        b.setAttribute("aria-label", "复制这一条");
        b.title = "复制这一条";
      }
    });
  }

  /* 熵值 */
  function markEntropy() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root p")).forEach(function (el) {
      if (el.children.length) return;
      if (/^约\s?[\d,]+(\.\d+)?\s?bit(\s?\/\s?条)?$/.test(txt(el))) el.classList.add("xn-chip-val");
    });
  }

  /* 当前设置摘要 */
  function updateBar() {
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "生成"; })[0];
    if (!btn) return;
    var bar = document.querySelector("#root .xn-setbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      var row = btn.parentElement;
      var cs = window.getComputedStyle(row);
      var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
      if (flexRow && row.parentElement) row.parentElement.insertBefore(bar, row);
      else row.insertBefore(bar, btn);
    }
    var parts = [];
    var cnt = inputBy("生成数量");
    if (cnt && cnt.value) parts.push(cnt.value + " 条");
    var words = inputBy("词数");
    if (words && words.value) parts.push(words.value + " 词");
    var sel = document.querySelector("#root select");
    if (sel && sel.selectedIndex >= 0) parts.push(sel.options[sel.selectedIndex].text);
    var sel2 = document.querySelectorAll("#root select")[1];
    if (sel2 && sel2.selectedIndex >= 0) parts.push(sel2.options[sel2.selectedIndex].text);
    [].slice.call(document.querySelectorAll('#root input[type=checkbox]')).forEach(function (c) {
      if (c.checked && parts.length < 4) {
        var lab = (c.getAttribute("aria-label") || "已勾选").replace(/（.*?）/g, "");
        if (/^是$/.test(lab)) lab = "随机数字";
        parts.push(lab);
      }
    });
    var rand = inputBy("随机长度");
    if (rand && rand.value && parts.length < 4) parts.push("随机长 " + rand.value);
    var ts = inputBy("时间戳");
    if (ts && ts.value && ts.value !== "0" && parts.length < 4) parts.push("指定时间戳");
    var html = '<span class="xn-setlabel">当前设置</span>';
    if (!parts.length) html += '<span class="xn-setnote">调整数量与选项后点击生成</span>';
    else html += parts.map(function (p) { return "<b>" + esc(String(p).slice(0, 20)) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  /* 标题归一 */
  function fixTitles() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      var t = txt(h);
      if (/^工具[A-Z]\s*/.test(t)) h.textContent = t.replace(/^工具[A-Z]\s*/, "");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixTitles();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    enhanceTimestamp();
    updateBar();
    fixRowCopy();
    markEntropy();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
