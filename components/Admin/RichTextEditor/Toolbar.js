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
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './RichTextEditor.module.css';
import lightStyles from './RichTextEditor.light.module.css';
import darkStyles from './RichTextEditor.dark.module.css';

const Toolbar = ({ editor }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  if (!editor) {
    return null;
  }

  const getButtonClass = (type, options = {}) => {
    const isActive = editor.isActive(type, options);
    return `${commonStyles.toolbarButton} ${themeStyles.toolbarButton} ${isActive ? commonStyles.active : ''} ${isActive ? themeStyles.active : ''}`;
  };

  return (
    <div className={`${commonStyles.toolbar} ${themeStyles.toolbar}`}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass('bold')}>
        <FaBold />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass('italic')}>
        <FaItalic />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={getButtonClass('strike')}>
        <FaStrikethrough />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass('heading', { level: 2 })}>
        <FaHeading />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={getButtonClass('bulletList')}>
        <FaListUl />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={getButtonClass('orderedList')}>
        <FaListOl />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={getButtonClass('blockquote')}>
        <FaQuoteLeft />
      </button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={`${commonStyles.toolbarButton} ${themeStyles.toolbarButton}`}>
        <FaUndo />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={`${commonStyles.toolbarButton} ${themeStyles.toolbarButton}`}>
        <FaRedo />
      </button>
    </div>
  );
};

export default Toolbar;
