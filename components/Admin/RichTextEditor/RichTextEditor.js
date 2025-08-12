import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTheme } from '../../../context/ThemeContext';
import Toolbar from './Toolbar';

import commonStyles from './RichTextEditor.module.css';
import lightStyles from './RichTextEditor.light.module.css';
import darkStyles from './RichTextEditor.dark.module.css';

const RichTextEditor = ({ value, onChange }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
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

  return (
    <div className={`${commonStyles.editorContainer} ${themeStyles.editorContainer}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
