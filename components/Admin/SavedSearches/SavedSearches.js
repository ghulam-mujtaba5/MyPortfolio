import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./SavedSearches.module.css";
import lightStyles from "./SavedSearches.light.module.css";
import darkStyles from "./SavedSearches.dark.module.css";
import Icon from "../Icon/Icon";
import Modal from "../Modal/Modal";
import utilities from "../../../styles/utilities.module.css";

const SavedSearches = ({ scope }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
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
      const data = await res.json();
      if (res.ok) {
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
      if (res.ok) {
        toast.success("Saved search deleted.");
        fetchSavedSearches();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
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
    <div className={`${commonStyles.container} ${themeStyles.container}`} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${utilities.btn} ${utilities.btnSecondary}`}
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
          className={`${commonStyles.dropdownContent} ${themeStyles.dropdownContent}`}
        >
          <div className={`${commonStyles.saveSection} ${themeStyles.saveSection}`}>
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="Name current search..."
              className={`${commonStyles.input} ${themeStyles.input}`}
              aria-label="Saved search name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveSearch();
              }}
            />
            <button onClick={handleSaveSearch} className={`${utilities.btn} ${utilities.btnPrimary}`}>
              Save
            </button>
          </div>
          <ul className={commonStyles.searchList}>
            {savedSearches.length > 0 ? (
              savedSearches.map((search) => (
                <li key={search._id} className={`${commonStyles.searchItem} ${themeStyles.searchItem}`} role="none">
                  <span
                    onClick={() => applySearch(search.query)}
                    className={`${commonStyles.searchName} ${themeStyles.searchName}`}
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
              <li className={`${commonStyles.noSearches} ${themeStyles.noSearches}`}>No saved searches yet.</li>
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
}
;

export default SavedSearches;
