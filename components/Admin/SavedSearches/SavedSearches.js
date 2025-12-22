import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import styles from "./SavedSearches.premium.module.css";
import Icon from "../Icon/Icon";
import Modal from "../Modal/Modal";
import utilities from "../../../styles/utilities.module.css";

const SavedSearches = ({ scope }) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState(null);
  const confirmDeleteBtnRef = useRef(null);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch(`/api/admin/saved-searches?scope=${scope}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.message?.includes('Database connection')) {
          toast.error("Database connection failed. Please check your MongoDB Atlas settings.");
        } else {
          throw new Error(errorData.message || `Failed to fetch saved searches (${res.status})`);
        }
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSavedSearches(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch saved searches", error);
      toast.error(error?.message || "Failed to load saved searches");
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [scope]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    if (isDropdownOpen) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [isDropdownOpen]);

  const handleSaveSearch = async () => {
    if (!newSearchName.trim()) {
      toast.error("Please enter a name for your search.");
      return;
    }
    try {
      const res = await fetch("/api/admin/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSearchName,
          query: router.asPath.split("?")[1] || "",
          scope,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.message?.includes('Database connection')) {
          toast.error("Database connection failed. Please check your MongoDB Atlas settings.");
        } else {
          throw new Error(errorData.message || `Failed to save search (${res.status})`);
        }
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        toast.success("Search saved!");
        setNewSearchName("");
        fetchSavedSearches();
      } else {
        throw new Error(data.message || "Failed to save search");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      const res = await fetch(`/api/admin/saved-searches?id=${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.message?.includes('Database connection')) {
          toast.error("Database connection failed. Please check your MongoDB Atlas settings.");
        } else {
          throw new Error(errorData.message || `Failed to delete search (${res.status})`);
        }
        return;
      }
      
      toast.success("Saved search deleted.");
      fetchSavedSearches();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const confirmDelete = (id) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const applySearch = (query) => {
    router.push(`/admin/${scope}?${query}`);
    setIsDropdownOpen(false);
  };

  const dropdownId = "saved-searches-menu";
  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${utilities.btn} ${utilities.btnSm} ${utilities.btnSecondary}`}
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        aria-controls={dropdownId}
      >
        Saved Searches{" "}
        <Icon name={isDropdownOpen ? "chevron-up" : "chevron-down"} />
      </button>
      {isDropdownOpen && (
        <div
          id={dropdownId}
          role="menu"
          className={styles.dropdownContent}
        >
          <div className={styles.saveSection}>
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="Name current search..."
              className={styles.input}
              aria-label="Saved search name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveSearch();
              }}
            />
            <button onClick={handleSaveSearch} className={`${utilities.btn} ${utilities.btnPrimary}`}>
              Save
            </button>
          </div>
          <ul className={styles.searchList}>
            {savedSearches.length > 0 ? (
              savedSearches.map((search) => (
                <li key={search._id} className={styles.searchItem} role="none">
                  <span
                    onClick={() => applySearch(search.query)}
                    className={styles.searchName}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") applySearch(search.query);
                    }}
                  >
                    {search.name}
                  </span>
                  <button
                    onClick={() => confirmDelete(search._id)}
                    className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnDanger}`}
                    aria-label={`Delete saved search ${search.name}`}
                    title={`Delete saved search ${search.name}`}
                  >
                    <Icon name="trash" />
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.noSearches}>No saved searches yet.</li>
            )}
          </ul>
        </div>
      )}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete saved search?"
        initialFocusRef={confirmDeleteBtnRef}
        onConfirm={() => {
          if (confirmTargetId) {
            handleDeleteSearch(confirmTargetId);
          }
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default SavedSearches;