/* 中文简繁转换器页增强（仅 2qepstqqxb 引用）
 * - 修正两个文本域的 aria（原为「0 字符」「转换状态」）
 * - 「填入示例」按钮 + 当前设置摘要
 * - 统计数字 / 对照表字对加强；未收录字补充同形字说明
 */
(function () {
  "use strict";
  if (window.__XN_ZH__) return;
  window.__XN_ZH__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setTextarea(ta, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    proto.set.call(ta, v);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var SAMPLE = "我们的软件发展很快，请点击这里下载文件。";

  function textareas() {
    return [].slice.call(document.querySelectorAll("#root textarea"));
  }

  function fixLabels() {
    var tas = textareas();
    if (tas[0]) tas[0].setAttribute("aria-label", "原文输入");
    if (tas[1]) tas[1].setAttribute("aria-label", "转换结果");
  }

  function addSample() {
    var tas = textareas();
    var ta = tas[0];
    var run = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "开始转换"; })[0];
    if (!ta || !run) return;
    var host = run.parentElement;
    if (!host || document.querySelector("#root .xn-sample")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "xn-sample";
    b.textContent = "填入示例";
    b.setAttribute("aria-label", "填入示例文本");
    b.title = "填入一段示例文本，便于快速试用";
    b.onclick = function () { setTextarea(ta, SAMPLE); setTimeout(updateAll, 60); };
    host.insertBefore(b, run);
  }

  /* 设置卡片改为单列，避免右侧开关挤压说明文字 */
  function stackSwitches() {
    var sw = document.querySelector('#root button[role="switch"]');
    if (!sw) return;
    var grid = sw.parentElement;
    while (grid && !(grid.querySelectorAll('button[role="switch"]').length >= 2 && /grid/.test((grid.className || "").toString()))) {
      grid = grid.parentElement;
    }
    if (grid) grid.classList.add("xn-switch-stack");
  }

  /* 当前设置摘要 */
  function updateBar() {
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "开始转换"; })[0];
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
    var sel = document.querySelector("#root select");
    var dir = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : "";
    var switches = [].slice.call(document.querySelectorAll('#root button[role="switch"]'));
    var punct = switches[0] ? (switches[0].getAttribute("aria-checked") === "true" ? "标点 开" : "标点 关") : "";
    var hi = switches[2] ? (switches[2].getAttribute("aria-checked") === "true" ? "逐字高亮 开" : "逐字高亮 关") : "";
    var parts = [dir, punct, hi].filter(Boolean);
    var html = '<span class="xn-setlabel">当前设置</span>' +
      parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  /* 统计与对照表 */
  function markNumbers() {
    [].slice.call(document.querySelectorAll("#root .grid > div")).forEach(function (card) {
      var t = (card.innerText || "").replace(/\s+/g, " ").trim();
      if (!/^(原文总字符|汉字数|英文字母|数字|标点符号|空白|已转换字数|未收录字)/.test(t)) return;
      [].slice.call(card.querySelectorAll("div, span, b, strong")).forEach(function (el) {
        if (el.children.length) return;
        if (/^\d+$/.test(txt(el))) el.classList.add("xn-num");
      });
    });
    [].slice.call(document.querySelectorAll("#root table tbody tr")).forEach(function (tr) {
      var tds = tr.querySelectorAll("td");
      if (tds.length < 4) return;
      [tds[1], tds[3]].forEach(function (td) {
        if (td && txt(td).length <= 2) td.classList.add("xn-char");
      });
    });
  }

  function addNote() {
    var p = [].slice.call(document.querySelectorAll("#root p, #root div")).filter(function (el) {
      return /^未收录字：/.test((el.innerText || "").trim()) && el.children.length <= 1;
    })[0];
    if (!p || !p.parentElement || p.parentElement.querySelector(".xn-note")) return;
    var n = document.createElement("p");
    n.className = "xn-note";
    n.textContent = "简繁同形字（如「我」「的」）也会计入未收录，属正常现象，不影响转换结果。";
    p.parentElement.insertBefore(n, p.nextSibling);
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixLabels();
    addSample();
    stackSwitches();
    updateBar();
    markNumbers();
    addNote();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-checked"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
