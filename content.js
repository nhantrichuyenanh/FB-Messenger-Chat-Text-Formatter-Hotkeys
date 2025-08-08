(() => {
  const WRAP = {
    b: "*",        // bold
    i: "_",        // italic
    s: "~",        // strikethrough
    m: "`",        // monospace
    cb: "```"      // codeblock
  };

  function isEditable(el) {
    return el && (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT");
  }

  function findWordBounds(text, offset) {
    let start = offset;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    let end = offset;
    while (end < text.length && !/\s/.test(text[end])) end++;
    return [start, end];
  }

  function toggleWrap(wrapper) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    let range = sel.getRangeAt(0);

    if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
      const node = range.startContainer;
      const text = node.textContent;
      const offset = range.startOffset;

      const [wStart, wEnd] = findWordBounds(text, offset);
      if (wStart !== wEnd) {
        range = document.createRange();
        range.setStart(node, wStart);
        range.setEnd(node, wEnd);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    const selectedText = range.toString();
    if (!selectedText) return;

    const wLen = wrapper.length;
    let newText;

    if (
      selectedText.startsWith(wrapper) &&
      selectedText.endsWith(wrapper) &&
      selectedText.length >= 2 * wLen
    ) {
      // remove wrapping
      newText = selectedText.slice(wLen, selectedText.length - wLen);
    } else {
      // add wrapping
      newText = wrapper + selectedText + wrapper;
    }

    document.execCommand("delete", false, null);
    document.execCommand("insertText", false, newText);
  }

  function insertCodeBlock() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    let range = sel.getRangeAt(0);

    if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
      const node = range.startContainer;
      const text = node.textContent;
      const offset = range.startOffset;

      const [wStart, wEnd] = findWordBounds(text, offset);
      if (wStart !== wEnd) {
        range = document.createRange();
        range.setStart(node, wStart);
        range.setEnd(node, wEnd);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    const selectedText = range.toString() || "";
    const blockText = `\n${WRAP.cb}\n${selectedText}\n${WRAP.cb}\n`;

    document.execCommand("delete", false, null);
    document.execCommand("insertText", false, blockText);
  }

  function clearAllFormatting() {
    const active = document.activeElement;
    if (!isEditable(active)) return;

    const text = active.innerText || active.value || "";

    const symbols = Object.values(WRAP)
      .map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
      .join("|");

    const clean = text.replace(new RegExp(`(${symbols})`, "g"), "");

    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(active);
    sel.removeAllRanges();
    sel.addRange(range);

    document.execCommand("insertText", false, clean);
  }

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (!isEditable(active)) return;

    const isMac = navigator.platform.includes("Mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;

    const key = e.key.toLowerCase();

    // Space or \
    if (!e.shiftKey && (key === " " || key === "\\")) {
      e.preventDefault();
      clearAllFormatting();
      return;
    }

    // B, I, S, M
    if (!e.shiftKey && WRAP[key]) {
      e.preventDefault();
      toggleWrap(WRAP[key]);
      return;
    }

    // Shift + C
    if (e.shiftKey && key === "c") {
      e.preventDefault();
      insertCodeBlock();
      return;
    }

  }, true);
})();