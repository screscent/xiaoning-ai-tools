/* CSV 合并拆分与结构统计合集页增强（仅 2qe6kzqqxb 引用）
 * - 上传区：放大、拖拽读文件、显示已选文件名、提示文案
 * - 每份行数快捷值（1/2/5/10/50），按列模式自动隐藏
 * - 合并/拆分动作行上方当前设置摘要（行数/段数/分隔符/表头/拆分方式）
 * - 统计数字 22px；表头开关补 role/aria 与点击热区
 */
(function () {
  "use strict";
  if (window.__XN_CSV__) return;
  window.__XN_CSV__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function selectByText(sel, val) {
    var proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    proto.set.call(sel, val);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 合并拆分页的文件读入 ---------- */
  function setTextarea(ta, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    proto.set.call(ta, v);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function readIntoText(file, ta) {
    if (!file || !ta) return;
    var r = new FileReader();
    r.onload = function () { setTextarea(ta, String(r.result || "")); setTimeout(updateAll, 80); };
    r.readAsText(file);
  }

  function enhanceMergeUpload() {
    var tas = [].slice.call(document.querySelectorAll("#root textarea")).filter(function (t) {
      return /多段/.test(t.getAttribute("aria-label") || "") && t.getBoundingClientRect().height > 0;
    });
    var ta = tas[0];
    if (!ta) return;
    var host = ta.parentElement;
    if (!host || host.querySelector(".xn-fileload")) return;

    var wrap = document.createElement("label");
    wrap.className = "xn-fileload";
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt,text/csv,text/plain";
    input.style.display = "none";
    var cap = document.createElement("span");
    cap.textContent = "选择 CSV 文件并读入上方文本框";
    wrap.appendChild(input);
    wrap.appendChild(cap);
    var note = document.createElement("span");
    note.className = "xn-upload-hint";
    note.textContent = "也可以把 .csv / .txt 文件直接拖到文本框里";
    host.appendChild(wrap);
    host.appendChild(note);

    input.addEventListener("change", function () {
      if (input.files && input.files[0]) readIntoText(input.files[0], ta);
    });
    wrap.addEventListener("dragover", function (e) { e.preventDefault(); wrap.classList.add("xn-drop-hot"); });
    wrap.addEventListener("dragleave", function () { wrap.classList.remove("xn-drop-hot"); });
    wrap.addEventListener("drop", function (e) {
      e.preventDefault();
      wrap.classList.remove("xn-drop-hot");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) readIntoText(e.dataTransfer.files[0], ta);
    });
    if (!ta.dataset.xnDrop) {
      ta.dataset.xnDrop = "1";
      ta.addEventListener("dragover", function (e) { e.preventDefault(); ta.classList.add("xn-drop-hot"); });
      ta.addEventListener("dragleave", function () { ta.classList.remove("xn-drop-hot"); });
      ta.addEventListener("drop", function (e) {
        e.preventDefault();
        ta.classList.remove("xn-drop-hot");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) readIntoText(e.dataTransfer.files[0], ta);
      });
    }
  }

  /* ---------- 上传区 ---------- */
  function nativeFileInput() {
    return [].slice.call(document.querySelectorAll("#root input[type=file]")).filter(function (i) {
      return !i.closest(".xn-fileload");
    })[0];
  }

  function enhanceUpload() {
    var inp = nativeFileInput();
    if (!inp) return;
    var label = inp.closest("label");
    if (!label) return;
    label.setAttribute("aria-label", "上传 CSV 文件");
    var host = label.parentElement;
    if (!host || host.querySelector(".xn-upload-hint")) return;

    var hint = document.createElement("span");
    hint.className = "xn-upload-hint";
    hint.textContent = "支持 .csv / .txt，也可把文件拖到这里";
    host.appendChild(hint);

    label.addEventListener("dragover", function (e) {
      e.preventDefault();
      label.classList.add("xn-drop-hot");
    });
    label.addEventListener("dragleave", function () {
      label.classList.remove("xn-drop-hot");
    });
    label.addEventListener("drop", function (e) {
      e.preventDefault();
      label.classList.remove("xn-drop-hot");
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      try {
        var dt = new DataTransfer();
        dt.items.add(files[0]);
        inp.files = dt.files;
        inp.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (err) {}
      setTimeout(updateAll, 80);
    });
    inp.addEventListener("change", function () { setTimeout(showFileName, 30); });
    showFileName();
  }

  function showFileName() {
    var inp = nativeFileInput();
    if (!inp) return;
    var label = inp.closest("label");
    var host = label && label.parentElement;
    if (!host) return;
    var tag = host.querySelector(".xn-file-name");
    var name = inp.files && inp.files[0] ? inp.files[0].name : "";
    if (!name) {
      if (tag) tag.remove();
      return;
    }
    if (!tag) {
      tag = document.createElement("span");
      tag.className = "xn-file-name";
      host.insertBefore(tag, host.querySelector(".xn-upload-hint"));
    }
    tag.textContent = "已选择：" + name;
  }

  /* ---------- 每份行数快捷值 ---------- */
  var ROW_PRESETS = [1, 2, 5, 10, 50];

  function splitMode() {
    var sel = [].slice.call(document.querySelectorAll("#root select")).filter(function (s) {
      return s.getAttribute("aria-label") === "拆分方式";
    })[0];
    return sel ? (sel.value || "") : "";
  }

  function rowInput() {
    var inp = [].slice.call(document.querySelectorAll("#root input")).filter(function (i) {
      return /^每份行数/.test(i.getAttribute("aria-label") || "");
    })[0];
    return inp;
  }

  function addRowChips() {
    var inp = rowInput();
    if (!inp) return;
    var colMode = /col/i.test(splitMode()) || inp.type === "text";
    var field = inp.parentElement;
    var host = field && field.parentElement;
    if (!field || !host) return;
    var wrap = field.querySelector(".xn-chips") || host.querySelector(".xn-chips");
    if (colMode) {
      if (wrap) wrap.remove();
      inp.setAttribute("aria-label", "列名或列序号");
      return;
    }
    inp.setAttribute("aria-label", "每份行数");
    if (wrap) { syncRowChips(inp, wrap); return; }
    wrap = document.createElement("div");
    wrap.className = "xn-chips";
    ROW_PRESETS.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v + " 行";
      b.onclick = function () { setInput(inp, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    (host.classList && host.classList.contains("relative") ? host.parentElement : host).appendChild(wrap);
    inp.addEventListener("input", function () { syncRowChips(inp, wrap); });
    syncRowChips(inp, wrap);
  }

  function syncRowChips(inp, wrap) {
    var cur = parseFloat(inp.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === ROW_PRESETS[i]);
    });
  }

  /* ---------- 表头开关可访问性 ---------- */
  function fixSwitch() {
    var sw = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      var c = (b.className || "").toString();
      return /w-11/.test(c) && /h-6/.test(c) && !txt(b);
    })[0];
    if (!sw) return;
    var on = /bg-blue-500|bg-blue-600/.test((sw.className || "").toString());
    sw.setAttribute("role", "switch");
    sw.setAttribute("aria-label", "首行作为表头");
    sw.setAttribute("aria-checked", on ? "true" : "false");
    sw.classList.add("xn-switch");
    sw.title = on ? "首行作为表头（已开启）" : "首行作为表头（已关闭）";
  }

  /* ---------- 当前设置摘要 ---------- */
  function delimText() {
    var sel = [].slice.call(document.querySelectorAll("#root select")).filter(function (s) {
      return s.getAttribute("aria-label") === "分隔符";
    })[0];
    if (!sel) return "";
    var t = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : "";
    var m = t.match(/[（(]\s*(.+?)\s*[)）]/);
    if (!m) return t;
    return m[1].replace("Tab", "Tab");
  }

  function updateBar() {
    var act = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return /^(合并|拆分)$/.test(txt(b));
    });
    if (!act.length) return;
    var row = act[0].parentElement;
    if (!row) return;
    var bar = document.querySelector("#root .xn-setbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      row.parentElement.insertBefore(bar, row);
    }
    var ta = document.querySelector("#root textarea");
    var val = ta ? ta.value : "";
    var lines = val ? val.replace(/\r?\n$/, "").split(/\r?\n/).length : 0;
    var segs = val ? val.split(/^\s*---\s*$/m).length : 0;
    var parts = [];
    if (val) parts.push(lines + " 行");
    if (val) parts.push(segs + " 段");
    var d = delimText();
    if (d) parts.push("分隔符 " + d);
    var sw = document.querySelector("#root button.xn-switch");
    if (sw) parts.push("表头 " + (sw.getAttribute("aria-checked") === "true" ? "开" : "关"));
    var inp = rowInput();
    if (inp && inp.value) {
      var col = /col/i.test(splitMode()) || inp.type === "text";
      parts.push(col ? "按列 " + inp.value : "每份 " + inp.value + " 行");
    }
    var html = '<span class="xn-setlabel">当前设置</span>';
    if (!parts.length) html += '<span class="xn-setnote">粘贴 CSV 或选择文件后开始</span>';
    else html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  /* ---------- 统计数字 ---------- */
  function markStats() {
    var grids = [].slice.call(document.querySelectorAll("#root .grid"));
    grids.forEach(function (g) {
      var c = (g.className || "").toString();
      if (!/text-center/.test(c)) return;
      [].slice.call(g.querySelectorAll(".text-lg")).forEach(function (el) {
        el.classList.add("xn-stat");
      });
    });
    [].slice.call(document.querySelectorAll("#root pre")).forEach(function (p) {
      p.classList.add("xn-pre");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    enhanceMergeUpload();
    enhanceUpload();
    fixSwitch();
    addRowChips();
    updateBar();
    markStats();
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
