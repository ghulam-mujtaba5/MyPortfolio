import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./DateRangePicker.module.css";

const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div className={styles.datePickerContainer}>
      <div className={styles.datePickerWrapper}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className={styles.dateInput}
          placeholderText="Start Date"
        />
      </div>
      <div className={styles.datePickerWrapper}>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className={styles.dateInput}
          placeholderText="End Date"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
