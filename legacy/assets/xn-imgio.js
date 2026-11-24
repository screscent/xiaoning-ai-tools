/* R1317 图片转 DataURL 与压缩合集 · xn-imgio.js
   工具编号 / 标题归一 / 预设与操作语义 / 示例图一键载入 / 文案清理 */
(function () {
  if (window.__XN_IMGIO__) return;
  window.__XN_IMGIO__ = true;

  var NUMS = ["①", "②"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 工具切换 ---- */
  function enhanceNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    var hash = (location.hash || "#/dataurl").replace("#", "");
    links.forEach(function (a, i) {
      var src = a.getAttribute("data-xn-label");
      if (!src) {
        src = a.textContent.trim().replace(/^[①-⑥]\s*/, "");
        a.setAttribute("data-xn-label", src);
      }
      var want = NUMS[i] + " " + src;
      if (a.textContent.trim() !== want) a.textContent = want;
      var href = (a.getAttribute("href") || "").replace("#", "");
      var active = href === hash || /bg-(blue|indigo)-600/.test(a.className);
      if (active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var al = "工具" + (i === 0 ? "一" : "二") + " " + src;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^[①②]\s*(.+)$/);
      if (!m) return;
      var idx = t.charAt(0) === "①" ? 0 : 1;
      var next = "工具" + (idx === 0 ? "一" : "二") + " · " + m[1].trim();
      if (h.textContent !== next) h.textContent = next;
      h.classList.add("xn-io-tool");
    });
  }

  /* ---- 预设 chip ---- */
  function enhancePresets() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (!/^(60%|80%|90%|WebP|JPEG)$/.test(t)) return;
      b.classList.add("xn-io-chip");
      var active = /bg-(blue|indigo)-600/.test(b.className);
      var pressed = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = /%$/.test(t) ? "压缩质量 " + t : "输出格式 " + t;
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 操作按钮 ---- */
  function enhanceActions() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (!/^(重置|复制结果|下载 \.txt|复制对比数据|下载压缩图)$/.test(t)) return;
      b.classList.add("xn-io-action");
      var map = {
        "重置": "重置当前工具参数",
        "复制结果": "复制转换结果",
        "下载 .txt": "下载结果文本",
        "复制对比数据": "复制压缩对比数据",
        "下载压缩图": "下载压缩后的图片"
      };
      if (b.getAttribute("aria-label") !== map[t]) b.setAttribute("aria-label", map[t]);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 示例图（工具一） ---- */
  function addSample() {
    var inp = Array.prototype.slice.call(document.querySelectorAll('#root input[type="file"]')).filter(visible)[0];
    if (!inp) return;
    var host = inp.parentElement;
    if (!host) return;
    if (host.querySelector(".xn-io-sample")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "xn-io-sample";
    btn.textContent = "载入示例图片（640×420）";
    btn.setAttribute("aria-label", "载入示例图片便于试算");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var c = document.createElement("canvas");
      c.width = 640;
      c.height = 420;
      var ctx = c.getContext("2d");
      var g = ctx.createLinearGradient(0, 0, 640, 420);
      g.addColorStop(0, "#6366f1");
      g.addColorStop(1, "#0891b2");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 420);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText("SAMPLE 640×420", 120, 220);
      c.toBlob(function (blob) {
        try {
          var file = new File([blob], "sample.png", { type: "image/png" });
          var dt = new DataTransfer();
          dt.items.add(file);
          inp.files = dt.files;
          inp.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (err) {}
      }, "image/png");
    });
    host.appendChild(btn);
  }

  /* ---- 清理深链文案 ---- */
  function cleanCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root li, #root p, #root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = el.textContent;
      if (t.indexOf("深链") < 0) return;
      var n = t.replace(/或直接访问深链（如[^）]*）/g, "或直接打开对应标签").replace(/直接访问深链（如[^）]*）/g, "直接打开对应标签");
      if (n !== t) el.textContent = n;
    });
  }

  function run() {
    try {
      enhanceNav();
      normalizeHeadings();
      enhancePresets();
      enhanceActions();
      addSample();
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
    if (t && t.closest && (t.closest("a") || t.closest("button") || t.closest("label") || t.closest("input"))) {
      window.setTimeout(schedule, 160);
      window.setTimeout(schedule, 560);
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
