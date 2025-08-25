import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useTheme } from "../../../context/ThemeContext";
import Toolbar from "./Toolbar";
import Modal from "../../Admin/Modal/Modal";
import { toast } from "react-hot-toast";
import InlineSpinner from "../../LoadingAnimation/InlineSpinner";

import commonStyles from "./RichTextEditor.module.css";
import lightStyles from "./RichTextEditor.light.module.css";
import darkStyles from "./RichTextEditor.dark.module.css";

const MediaLibrary = dynamic(() => import("../MediaLibrary/MediaLibrary"), {
  ssr: false,
});

const RichTextEditor = ({ value, onChange }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeText, setCodeText] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Removed Grammar Check state

  // View Source
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sourceText, setSourceText] = useState("");

  // Removed Tone Adjuster state

  // Reusable Blocks & Snippets
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const BUILTIN_BLOCKS = [
    {
      id: "disclaimer",
      name: "Disclaimer",
      html: "<blockquote><strong>Disclaimer:</strong> The views expressed are my own and do not represent my employer.</blockquote>",
    },
    {
      id: "cta-contact",
      name: "CTA: Contact",
      html: '<div class="cta"><h3>Work with me</h3><p>Interested in collaborating? <a href="/contact">Get in touch</a>.</p></div>',
    },
    {
      id: "note",
      name: "Note",
      html: '<div class="note">💡 <strong>Note:</strong> Remember to update dependencies regularly.</div>',
    },
  ];
  const [customSnippets, setCustomSnippets] = useState([]);
  const [newSnippetName, setNewSnippetName] = useState("");
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, id: null });
  const confirmBtnRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `${commonStyles.editor} ${themeStyles.editor}`,
      },
    },
  });

  // Load custom snippets from DB
  const fetchSnippets = async () => {
    setIsLoadingSnippets(true);
    try {
      const res = await fetch("/api/admin/snippets");
      const data = await res.json();
      if (data.success) {
        setCustomSnippets(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch snippets", e);
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  useEffect(() => {
    if (isSnippetsOpen) {
      fetchSnippets();
    }
  }, [isSnippetsOpen]);

  const saveNewSnippet = async (name, html) => {
    const toastId = toast.loading("Saving snippet...");
    try {
      const res = await fetch("/api/admin/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      toast.success("Snippet saved!", { id: toastId });
      setCustomSnippets((prev) => [data.data, ...prev]);
      setNewSnippetName("");
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

  const confirmDeleteSnippet = (id) => {
    setDeleteState({ open: true, id });
  };

  const onConfirmDelete = async () => {
    const id = deleteState.id;
    const toastId = toast.loading("Deleting snippet...");
    try {
      const res = await fetch(`/api/admin/snippets?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Snippet deleted.", { id: toastId });
      setCustomSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setDeleteState({ open: false, id: null });
    }
  };

  // Removed Grammar/Tone handler functions

  const convertMarkdownToHtml = useMemo(() => {
    // Minimal, safe-ish Markdown to HTML for common cases
    return (md) => {
      if (!md) return "";
      let html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      // fenced code blocks ```lang\ncode\n```
      html = html.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (m, lang, code) =>
          `\n<pre><code class="language-${lang || "text"}">${code.replace(/\n/g, "\n")}</code></pre>\n`,
      );
      // headings #, ##, ###
      html = html
        .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
        .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
        .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
      // bold **text** and italic *text*
      html = html
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      // inline code `code`
      html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
      // lists - item
      html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
        const items = block
          .trim()
          .split(/\n/)
          .map((li) => li.replace(/^-\s+/, ""));
        return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
      });
      // paragraphs
      html = html
        .split(/\n{2,}/)
        .map((p) =>
          /<h\d|<ul|<pre/.test(p) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`,
        )
        .join("");
      return html;
    };
  }, []);

  return (
    <div
      className={`${commonStyles.editorContainer} ${themeStyles.editorContainer}`}
    >
      <Toolbar editor={editor} />
      <div className={`${commonStyles.rowEnd} ${commonStyles.myXs} ${commonStyles.gapSm}`}>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => setIsMediaOpen(true)}
        >
          Insert Media
        </button>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => setIsCodeOpen(true)}
        >
          Insert Code
        </button>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => setIsMarkdownOpen(true)}
        >
          Import Markdown
        </button>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => {
            setSourceText(editor.getHTML());
            setIsSourceOpen(true);
          }}
        >
          View Source
        </button>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => setIsSnippetsOpen(true)}
        >
          Blocks & Snippets
        </button>
        <button
          type="button"
          className={commonStyles.toolbarButton}
          onClick={() => setIsFindOpen(true)}
        >
          Find & Replace
        </button>
        {/* Removed Grammar Check and Adjust Tone buttons */}
      </div>
      <EditorContent editor={editor} />

      <Modal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        title="Insert Media"
      >
        <MediaLibrary
          onSelect={(asset) => {
            if (editor) {
              editor
                .chain()
                .focus()
                .setImage({ src: asset.url, alt: asset.altText || "" })
                .run();
            }
            setIsMediaOpen(false);
          }}
          isModal
        />
      </Modal>

      {/* Blocks & Snippets */}
      <Modal
        isOpen={isSnippetsOpen}
        onClose={() => setIsSnippetsOpen(false)}
        title="Blocks & Snippets"
      >
        <div className={`${commonStyles.grid} ${commonStyles.gapMd}`}>
          <section>
            <h4 className={commonStyles.myXs}>Built-in Blocks</h4>
            <div className={`${commonStyles.row} ${commonStyles.wrap} ${commonStyles.gapSm}`}>
              {BUILTIN_BLOCKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={commonStyles.toolbarButton}
                  onClick={() => {
                    if (editor)
                      editor.chain().focus().insertContent(b.html).run();
                    setIsSnippetsOpen(false);
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h4 className={commonStyles.myXs}>My Snippets</h4>
            {isLoadingSnippets ? (
              <p className={commonStyles.row + " " + commonStyles.alignCenter + " " + commonStyles.gapXs}>
                <InlineSpinner sizePx={16} />
                <span>Loading snippets…</span>
              </p>
            ) : customSnippets.length === 0 ? (
              <p className={commonStyles.muted}>No custom snippets yet.</p>
            ) : null}
            <div className={`${commonStyles.grid} ${commonStyles.gapSm}`}>
              {customSnippets.map((s) => (
                <div
                  key={s._id}
                  className={`${commonStyles.itemBox} ${commonStyles.rowBetween} ${commonStyles.alignCenter}`}
                >
                  <div className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapSm}`}>
                    <strong>{s.name}</strong>
                  </div>
                  <div className={`${commonStyles.row} ${commonStyles.gapXs}`}>
                    <button
                      type="button"
                      className={commonStyles.toolbarButton}
                      onClick={() => {
                        if (editor)
                          editor.chain().focus().insertContent(s.html).run();
                        setIsSnippetsOpen(false);
                      }}
                    >
                      Insert
                    </button>
                    <button
                      type="button"
                      className={commonStyles.toolbarButton}
                      onClick={() => confirmDeleteSnippet(s._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${commonStyles.row} ${commonStyles.gapSm} ${commonStyles.mtSm}`}>
              <input
                type="text"
                placeholder="Snippet name"
                value={newSnippetName}
                onChange={(e) => setNewSnippetName(e.target.value)}
              />
              <button
                type="button"
                className={commonStyles.toolbarButton}
                onClick={() => {
                  if (!editor) return;
                  const sel = window.getSelection && window.getSelection();
                  let selectedHtml = "";
                  try {
                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      const container = document.createElement("div");
                      container.appendChild(range.cloneContents());
                      selectedHtml = container.innerHTML.trim();
                    }
                  } catch {}
                  const toSave = selectedHtml || editor.getHTML();
                  if (!toSave || !newSnippetName.trim()) {
                    toast.error(
                      "Please provide a name and have content selected (or use the whole editor content).",
                    );
                    return;
                  }
                  saveNewSnippet(newSnippetName.trim(), toSave);
                }}
              >
                Save Selection as Snippet
              </button>
            </div>
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={isCodeOpen}
        onClose={() => setIsCodeOpen(false)}
        title="Insert Code Snippet"
      >
        <div className={`${commonStyles.col} ${commonStyles.gapSm}`}>
          <label
            className={`${commonStyles.toolbarButton} ${commonStyles.rowInline} ${commonStyles.alignCenter} ${commonStyles.gapSm}`}
          >
            Language
            <select
              value={codeLang}
              onChange={(e) => setCodeLang(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </label>
          <textarea
            rows={10}
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            placeholder="Paste code here"
            className={commonStyles.codeTextarea}
          />
          <div className={`${commonStyles.rowEnd} ${commonStyles.gapSm}`}>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => {
                setCodeText("");
                setIsCodeOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => {
                if (editor && codeText.trim()) {
                  const safe = codeText
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
                  editor
                    .chain()
                    .focus()
                    .insertContent(`\n<pre><code class="language-${codeLang}">${safe}</code></pre>\n`)
                    .run();
                  toast.success("Code inserted");
                }
                setIsCodeOpen(false);
                setCodeText("");
              }}
            >
              Insert
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMarkdownOpen}
        onClose={() => setIsMarkdownOpen(false)}
        title="Import Markdown"
      >
        <div className={`${commonStyles.col} ${commonStyles.gapSm}`}>
          <textarea
            rows={12}
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
            placeholder="# Heading\n\nWrite Markdown here..."
            className={commonStyles.codeTextarea}
          />
          <div className={`${commonStyles.rowEnd} ${commonStyles.gapSm}`}>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => {
                setMarkdownText("");
                setIsMarkdownOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => {
                if (editor && markdownText.trim()) {
                  const html = convertMarkdownToHtml(markdownText);
                  editor.chain().focus().insertContent(html).run();
                  toast.success("Markdown inserted");
                }
                setIsMarkdownOpen(false);
                setMarkdownText("");
              }}
            >
              Import
            </button>
          </div>
        </div>
      </Modal>

      {/* Find & Replace */}
      <Modal
        isOpen={isFindOpen}
        onClose={() => setIsFindOpen(false)}
        title="Find & Replace"
      >
        <div className={`${commonStyles.grid} ${commonStyles.gapSm}`}>
          <input
            type="text"
            placeholder="Find..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <label className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapXs}`}>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            Case sensitive
          </label>
          <div className={`${commonStyles.rowEnd} ${commonStyles.gapSm}`}>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => setIsFindOpen(false)}
            >
              Close
            </button>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              disabled={!findText}
              onClick={() => {
                if (!editor) return;
                const html = editor.getHTML();
                // Replace text inside text nodes while preserving tags
                const container = document.createElement("div");
                container.innerHTML = html;
                const walker = document.createTreeWalker(
                  container,
                  NodeFilter.SHOW_TEXT,
                );
                const needle = caseSensitive
                  ? findText
                  : findText.toLowerCase();
                let node;
                while ((node = walker.nextNode())) {
                  const original = node.nodeValue || "";
                  const hay = caseSensitive ? original : original.toLowerCase();
                  if (!needle) continue;
                  let idx = hay.indexOf(needle);
                  if (idx === -1) continue;
                  // Build replaced string manually to honor case-sensitivity
                  const parts = [];
                  let last = 0;
                  while (idx !== -1) {
                    parts.push(original.slice(last, idx));
                    parts.push(replaceText);
                    last = idx + needle.length;
                    const nextHay = caseSensitive
                      ? original
                      : original.toLowerCase();
                    idx = nextHay.indexOf(needle, last);
                  }
                  parts.push(original.slice(last));
                  node.nodeValue = parts.join("");
                }
                const nextHtml = container.innerHTML;
                editor.commands.setContent(nextHtml, false);
                setIsFindOpen(false);
              }}
            >
              Replace All
            </button>
          </div>
        </div>
      </Modal>

      {/* View Source Modal */}
      <Modal
        isOpen={isSourceOpen}
        onClose={() => setIsSourceOpen(false)}
        title="Edit HTML Source"
      >
        <div className={`${commonStyles.col} ${commonStyles.gapSm}`}>
          <textarea
            rows={15}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="HTML content..."
            className={commonStyles.codeTextarea}
          />
          <div className={`${commonStyles.rowEnd} ${commonStyles.gapSm}`}>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => setIsSourceOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={commonStyles.toolbarButton}
              onClick={() => {
                if (editor && sourceText.trim()) {
                  editor.commands.setContent(sourceText, false);
                }
                setIsSourceOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Snippet Confirmation */}
      <Modal
        isOpen={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null })}
        title="Delete Snippet"
        onConfirm={onConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        initialFocusRef={confirmBtnRef}
      >
        <p>This action will permanently delete this snippet. Continue?</p>
      </Modal>
    </div>
  );
};

export default RichTextEditor;
