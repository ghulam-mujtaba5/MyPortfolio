import styles from "./StatWidget.premium.module.css";

const StatWidget = ({ icon, title, value }) => {
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.iconContainer}>
        {icon}
      </div>
      <div className={styles.textContainer}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};

export default StatWidget;
