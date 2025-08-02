// /backend/src/utils/dateUtils.js

// Normalizes a date string or Date object to the start of its day in UTC.
// This is crucial for consistent date-based lookups in MongoDB.
export const normalizeDate = (dateStringOrObject) => {
  if (!dateStringOrObject) {
    return null;
  }
  const date = new Date(dateStringOrObject);
  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Gets a date string in YYYY-MM-DD format from a Date object.
export const getLocalDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};