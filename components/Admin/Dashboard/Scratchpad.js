import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import styles from "./Dashboard.module.css";
import Icon from "../Icon/Icon";
import Modal from "../../Admin/Modal/Modal";

const Scratchpad = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const inputRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
      } else {
        toast.error("Failed to load notes.");
      }
    } catch (error) {
      toast.error("Could not connect to server.");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async () => {
    if (!currentNote.trim()) return;

    const isUpdating = !!editingNoteId;
    const url = "/api/admin/notes";
    const method = isUpdating ? "PUT" : "POST";
    const body = isUpdating
      ? { id: editingNoteId, content: currentNote }
      : { content: currentNote };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Note ${isUpdating ? "updated" : "saved"}!`);
        setCurrentNote("");
        setEditingNoteId(null);
        fetchNotes(); // Refresh list
      } else {
        throw new Error(data.message || "Failed to save note");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (note) => {
    setEditingNoteId(note._id);
    setCurrentNote(note.content);
    inputRef.current?.focus();
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const confirmBtnRef = useRef(null);

  const requestDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return setConfirmOpen(false);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      if (res.ok) {
        toast.success("Note deleted.");
        fetchNotes();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete note");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleCancelEdit = () => {
    setCurrentNote("");
    setEditingNoteId(null);
  };

  return (
    <div className={styles.widgetCard}>
      <h2 className={styles.widgetTitle}>Private Scratchpad</h2>
      <div className={styles.scratchpadInputContainer}>
        <textarea
          ref={inputRef}
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Jot down a quick note..."
          className={styles.scratchpadTextarea}
          rows="3"
        />
        <div className={styles.scratchpadActions}>
          {editingNoteId && (
            <button
              onClick={handleCancelEdit}
              className={`${styles.scratchpadButton} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          )}
          <button onClick={handleSave} className={styles.scratchpadButton}>
            {editingNoteId ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
      <ul className={styles.noteList}>
        {notes.map((note) => (
          <li key={note._id} className={styles.noteItem}>
            <p className={styles.noteContent}>{note.content}</p>
            <div className={styles.noteActions}>
              <button
                onClick={() => handleEdit(note)}
                className={styles.noteActionButton}
              >
                <Icon name="edit" />
              </button>
              <button
                onClick={() => requestDelete(note._id)}
                className={styles.noteActionButton}
              >
                <Icon name="trash" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    {/* Delete confirmation modal */}
    <Modal
      isOpen={confirmOpen}
      onClose={() => {
        setConfirmOpen(false);
        setDeleteId(null);
      }}
      title="Delete Note"
      onConfirm={handleDelete}
      confirmText="Delete"
      cancelText="Cancel"
      initialFocusRef={confirmBtnRef}
    >
      <p>This action will permanently delete this note. Continue?</p>
    </Modal>
    </div>
  );
};

export default Scratchpad;
