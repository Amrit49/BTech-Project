import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MultiMonthCalendar.css'; // Custom styles
import NavBar from './NavBar';

const MultiMonthCalendar = () => {


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className='calendar-page'>
         <NavBar/>
   
    <div className="multi-month-calendar-container">
      {/* Left Side - Calendar Grid */}
     
      <div className="calendar-grid">
        {months.map((month, index) => (
          <div key={index} className="month-container">
            {/* <h3>{month}</h3> */}
            <Calendar
              view="month"
              activeStartDate={new Date(currentYear, index)}
              tileClassName={({ date }) => {
                // You can customize tile class here for leave styling
                if (date.getDate() === 1) {
                  return 'leave-day'; // Example class for a leave day
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default MultiMonthCalendar;
