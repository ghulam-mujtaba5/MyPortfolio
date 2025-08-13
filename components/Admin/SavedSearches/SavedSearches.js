import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import styles from "./SavedSearches.module.css";
import Icon from "../Icon/Icon";

const SavedSearches = ({ scope }) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch(`/api/admin/saved-searches?scope=${scope}`);
      const data = await res.json();
      if (data.success) {
        setSavedSearches(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch saved searches", error);
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

  const applySearch = (query) => {
    router.push(`/admin/${scope}?${query}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={styles.dropdownButton}
      >
        Saved Searches{" "}
        <Icon name={isDropdownOpen ? "chevron-up" : "chevron-down"} />
      </button>
      {isDropdownOpen && (
        <div className={styles.dropdownContent}>
          <div className={styles.saveSection}>
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="Name current search..."
              className={styles.input}
            />
            <button onClick={handleSaveSearch} className={styles.saveButton}>
              Save
            </button>
          </div>
          <ul className={styles.searchList}>
            {savedSearches.length > 0 ? (
              savedSearches.map((search) => (
                <li key={search._id} className={styles.searchItem}>
                  <span
                    onClick={() => applySearch(search.query)}
                    className={styles.searchName}
                  >
                    {search.name}
                  </span>
                  <button
                    onClick={() => handleDeleteSearch(search._id)}
                    className={styles.deleteButton}
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
    </div>
  );
};

export default SavedSearches;
