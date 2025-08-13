// components/Admin/Table/Table.js
import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./Table.module.css";
import lightStyles from "./Table.light.module.css";
import darkStyles from "./Table.dark.module.css";

const Table = ({ columns, data }) => {
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;

  if (!data || data.length === 0) {
    return (
      <p className={`${commonStyles.noData} ${styles.noData}`}>
        No data to display.
      </p>
    );
  }

  return (
    <div className={`${commonStyles.tableContainer} ${styles.tableContainer}`}>
      <table className={commonStyles.table}>
        <thead>
          <tr className={`${commonStyles.tr} ${styles.tr}`}>
            {columns.map((col) => (
              <th key={col.key} className={`${commonStyles.th} ${styles.th}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={`${commonStyles.tr} ${styles.tr}`}>
              {columns.map((col) => (
                <td key={col.key} className={`${commonStyles.td} ${styles.td}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
