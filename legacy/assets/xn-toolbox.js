/* xn-toolbox.js · 在线小工具合集：模式编号归一 / aria-pressed / 清空与子类打标（幂等） */
(function () {
  if (window.__XN_TOOLBOX__) return;
  window.__XN_TOOLBOX__ = 1;

  var root = null;
  var NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function label(text) {
    // 「工具A 字数统计」→「① 字数统计」
    var m = /^工具([A-Z])\s*(.*)$/.exec(text);
    if (!m) return text;
    var idx = m[1].charCodeAt(0) - 65;
    return (NUM[idx] || m[1]) + " " + m[2];
  }

  function decorate() {
    if (!root) return;
    // 模式按钮（识别三类：原占位名 / 已归一 ①~⑧ / 已打标 px-mode）
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var raw = (b.textContent || "").replace(/\s+/g, " ").trim();
      var isMode = b.classList.contains("px-mode") || /^工具[A-F]\s/.test(raw) || /^[①②③④⑤⑥⑦⑧]\s/.test(raw);
      if (isMode) {
        if (/^工具[A-F]\s/.test(raw)) {
          var text = label(raw);
          if (b.getAttribute("data-xn-name") !== text) {
            b.setAttribute("data-xn-name", text);
            b.textContent = text;
          }
        }
        if (!b.classList.contains("px-mode")) b.classList.add("px-mode");
        var active = /text-blue-600|border-blue-600/.test(b.className);
        var want = active ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
        continue;
      }
      if (raw === "清空") {
        if (!b.classList.contains("px-reset")) b.classList.add("px-reset");
      }
      // 单位子类 chip：长度/重量/温度 等，38h
      if (/^(长度|重量|温度|面积|体积|速度)$/.test(raw) && !b.classList.contains("px-chip")) {
        b.classList.add("px-chip");
      }
      if (!b.getAttribute("aria-label") && raw) b.setAttribute("aria-label", raw);
    }
    // h2 编号归一
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var h = h2s[j];
      var t = (h.textContent || "").replace(/\s+/g, " ").trim();
      if (/^工具[A-F]\s/.test(t)) {
        var nt = label(t);
        if (h.getAttribute("data-xn-name") !== nt) { h.setAttribute("data-xn-name", nt); h.textContent = nt; }
      }
    }
  }

  function start() {
    if (!pick()) { setTimeout(start, 300); return; }
    decorate();
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    // 兜底：SPA 批量重渲染时 observer 可能漏拍，定时幂等校正
    setInterval(decorate, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
