/* R1098 Linux 运维速查合集 — 人用友好增强（幂等）
   1. 工具编号徽标（01 → 工具 01）
   2. tab 分组语义与 aria
   3. 场景胶囊 aria 与选中态
   4. 复制按钮可读化、危险标签、结果计数 ARIA
   5. 空状态「试一个示例」+ 键盘 / 聚焦
   6. 修正「3 个工具」文案为 6 个
   不改 React 状态，只补语义、样式钩子与引导。 */
(function () {
  if (window.__xnLinux) return;
  window.__xnLinux = 1;

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function vis(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function txt(el) {
    return (el.textContent || "").trim().replace(/\s+/g, " ");
  }
  function add(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }
  function setAttr(el, k, v) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }
  function inputEl() {
    return q("input[type=text]").filter(vis)[0] || q("input[type=text]")[0];
  }

  /* 1. 工具编号 */
  function toolNo(root) {
    q("span", root).forEach(function (s) {
      if (s.children.length) return;
      if (s.className.indexOf("tracking-widest") < 0) return;
      var t = txt(s);
      if (!/^\d{2}$/.test(t)) return;
      add(s, "xn-tool-no");
      s.textContent = "工具 " + t;
    });
  }

  /* 2. tab */
  function tabs(root) {
    var nav = q("nav", root)[0];
    if (nav) {
      add(nav, "xn-nav");
      setAttr(nav, "aria-label", "工具切换");
    }
    q('nav a[href^="#/"]', root).forEach(function (a) {
      add(a, "xn-tab");
      if (!a.getAttribute("aria-label")) setAttr(a, "aria-label", txt(a));
    });
  }

  /* 3. 胶囊 */
  function chips(root) {
    q("button", root).forEach(function (b) {
      if (b.className.indexOf("rounded-full") < 0) return;
      if (b.closest("nav")) return;
      var t = txt(b);
      if (!t || t.length > 18) return;
      if (b.getBoundingClientRect().height > 70) return;
      add(b, "xn-chip");
      if (!b.getAttribute("aria-label")) setAttr(b, "aria-label", "填入 " + t);
      setAttr(b, "title", "点击填入「" + t + "」");
    });
    // 分组名
    ["常见分类", "常见取值", "热门端口", "常见服务"].forEach(function (label) {
      q("span,div,p", root).forEach(function (e) {
        if (e.children.length) return;
        if (txt(e) !== label) return;
        var p = e.parentElement;
        if (!p || p.getAttribute("data-xn-group") === "1") return;
        setAttr(p, "role", "group");
        setAttr(p, "aria-label", label);
        setAttr(p, "data-xn-group", "1");
        add(e, "xn-group-label");
      });
    });
  }

  /* 4. 复制 / 危险 / 计数 */
  function misc(root) {
    q('button[aria-label="复制"],button[aria-label="复制全部"]', root).forEach(function (b) {
      add(b, "xn-copy");
      if (!txt(b)) add(b, "xn-copy--icon");
      if (!b.getAttribute("title")) setAttr(b, "title", "复制到剪贴板");
    });
    q("li span", root).forEach(function (s) {
      if (s.className.indexOf("bg-rose-50") >= 0) add(s, "xn-danger");
    });
    q("span,div", root).forEach(function (e) {
      if (e.children.length) return;
      if (!/^\d+ 条$/.test(txt(e))) return;
      add(e, "xn-count");
      setAttr(e, "aria-live", "polite");
      setAttr(e, "role", "status");
    });
  }

  /* 5. 空状态引导 */
  function empty(root) {
    q("main div", root).forEach(function (box) {
      if (box.className.indexOf("border-dashed") < 0) return;
      if (box.getAttribute("data-xn-empty") === "1") return;
      if (!vis(box)) return;
      if (txt(box).indexOf("尚未输入关键词") < 0) return;
      setAttr(box, "data-xn-empty", "1");
      add(box, "xn-empty");

      var hint = document.createElement("p");
      hint.className = "xn-empty-hint";
      hint.textContent = "小提示：按 / 键可随时回到输入框，Esc 清空";
      box.appendChild(hint);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-empty-try";
      btn.textContent = "试一个示例";
      btn.setAttribute("aria-label", "填入一个示例关键词");
      btn.addEventListener("click", function () {
        var sec = box.closest("section") || root;
        var chip = q(".xn-chip", sec).filter(vis)[0];
        if (chip) chip.click();
      });
      box.appendChild(btn);
    });
  }

  /* 6. 文案修正 */
  function copyFix(root) {
    q("span,div,p", root).forEach(function (e) {
      if (e.children.length) return;
      if (e.textContent === "3 个工具 · 全部本地计算") {
        e.textContent = "6 个工具 · 全部本地计算";
      }
    });
    // 说明段落里的「三个工具」在带图标的容器内，按文本节点替换
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (n) {
      if (n.nodeValue && n.nodeValue.indexOf("三个工具") >= 0) {
        n.nodeValue = n.nodeValue.replace(/三个工具/g, "六个工具");
      }
    });
  }

  /* 7. 端口卡 / chmod 结构钩子 */
  function blocks(root) {
    q("article", root).forEach(function (a) {
      if (a.querySelector(".bg-slate-900")) add(a, "xn-port-art");
    });
    var chmod = q("h2", root).filter(function (h) {
      return txt(h).indexOf("chmod") >= 0;
    })[0];
    if (chmod) {
      var sec = chmod.closest("section");
      if (sec) {
        q("div", sec).forEach(function (d) {
          var c = d.className || "";
          if (c.indexOf("uppercase") >= 0 && c.indexOf("tracking-wider") >= 0) add(d, "xn-thead");
          if (c.indexOf("sm:grid-cols-[92px") >= 0 && c.indexOf("hidden") < 0) add(d, "xn-trow");
        });
        q("span", sec).forEach(function (s) {
          var c = s.className || "";
          if (c.indexOf("h-6") >= 0 && c.indexOf("w-6") >= 0) add(s, "xn-bit");
          if (c.indexOf("bg-slate-100") >= 0 && c.indexOf("font-mono") >= 0) add(s, "xn-perm-num");
        });
        q("button", sec).forEach(function (b) {
          var ps = b.querySelectorAll("p");
          if (ps.length < 2) return;
          var a = (ps[0].textContent || "").trim();
          var bits = (ps[1].textContent || "").trim();
          if (!/^[0-7]{3,4}$/.test(a)) return;
          if (!/^[-rwx]{9}$/.test(bits)) return;
          add(b, "xn-perm-card");
          var g = b.parentElement;
          if (g && g.children.length >= 2) add(g, "xn-perm-grid");
        });
      }
    }
  }

  /* 8. 选中态同步 */
  function syncActive(root) {
    var i = inputEl();
    var v = i ? (i.value || "").trim() : "";
    var tokens = v ? v.split(/\s+/) : [];
    q(".xn-chip", root).forEach(function (c) {
      var t = txt(c);
      var on = v && (t === v || tokens.indexOf(t) >= 0);
      setAttr(c, "data-xn-active", on ? "1" : "0");
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-linux", "1");
      toolNo(root);
      tabs(root);
      chips(root);
      misc(root);
      empty(root);
      copyFix(root);
      blocks(root);
      syncActive(root);
      var i = inputEl();
      if (i) {
        add(i, "xn-input");
        if (!i.getAttribute("aria-label")) {
          setAttr(i, "aria-label", i.getAttribute("placeholder") || "输入关键词");
        }
      }
    } catch (e) {
      /* 静默，避免影响原功能 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 90);
  }

  function bind() {
    var root = document.getElementById("root");
    if (!root) {
      setTimeout(bind, 300);
      return;
    }
    enhance();
    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    }
    document.addEventListener("input", function (e) {
      if (e.target && e.target.tagName === "INPUT") {
        syncActive(root);
        schedule();
      }
    }, true);
    window.addEventListener("hashchange", function () {
      setTimeout(enhance, 160);
    });
    document.addEventListener("keydown", function (e) {
      var a = document.activeElement;
      var typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT");
      if (e.key === "/" && !typing) {
        var i = inputEl();
        if (i) {
          e.preventDefault();
          i.focus();
          i.select();
        }
      } else if (e.key === "Escape" && typing && a.tagName === "INPUT") {
        var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(a, "");
        a.dispatchEvent(new Event("input", { bubbles: true }));
        a.blur();
      }
    });
    setInterval(schedule, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
