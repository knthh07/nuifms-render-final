// Helper function to get the start and end dates of the current semester
const getSemesterDates = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  let startMonth, endMonth;
  let semester;

  // Define the start and end months for each semester
  if (month >= 8 && month <= 12) { // August to December
    semester = 'First Semester';
    startMonth = 8; // August
    endMonth = 12;  // December
  } else if (month >= 1 && month <= 3) { // January to March
    semester = 'Second Semester';
    startMonth = 1; // January
    endMonth = 3;   // March
  } else if (month >= 4 && month <= 7) { // April to July
    semester = 'Third Semester';
    startMonth = 4; // April
    endMonth = 7;   // July
  } else {
    semester = 'Unknown Semester';
    startMonth = 1;
    endMonth = 12;
  }

  // Return the start and end dates for the semester
  // Adjust for cases where endMonth is before startMonth (e.g., January to March)
  const endYear = endMonth < startMonth ? year + 1 : year;
  return {
    semester,
    start: new Date(year, startMonth - 1, 1),
    end: new Date(endYear, endMonth, 0)
  };
};

module.exports = getSemesterDates;
