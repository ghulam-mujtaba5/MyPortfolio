import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
} from "react-icons/fa";

import styles from "./RichTextEditor.premium.module.css";

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const getButtonClass = (type, options = {}) => {
    const isActive = editor.isActive(type, options);
    return `${styles.toolbarButton} ${isActive ? styles.active : ""}`;
  };

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={getButtonClass("bold")}
      >
        <FaBold />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={getButtonClass("italic")}
      >
        <FaItalic />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={getButtonClass("strike")}
      >
        <FaStrikethrough />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass("heading", { level: 2 })}
      >
        <FaHeading />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass("bulletList")}
      >
        <FaListUl />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass("orderedList")}
      >
        <FaListOl />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass("blockquote")}
      >
        <FaQuoteLeft />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={styles.toolbarButton}
      >
        <FaUndo />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={styles.toolbarButton}
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default Toolbar;
