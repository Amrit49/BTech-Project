import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import Account from './components/Account';
import Notifications from './components/Notifications';
import MultiMonthCalendar from './components/MultiMonthCalendar';
import PendingTasks from './components/PendingTasks';
import LeaveDetails from './components/LeaveDetails';
import Admin from './components/Admin';
import EmployeeSection from './components/EmployeeSection';
import LeavePolicy from './components/LeavePolicy';
import AdminProfile from './components/AdminProfile';
import PendingTasksAdmin from './components/PendingTasksAdmin';
import AdminNotification from './components/AdminNotification';
import LeaveDetailsUsers from './components/LeaveDetailsUsers';
import CheckLeaveStatus from './components/CheckLeaveStatus';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/notification" element={<Notifications/>}/>
        <Route path="/multicalendar" element={<MultiMonthCalendar/>}/>
        <Route path="/role-pending-tasks/:approverRoleId" element={<PendingTasks />} />
        <Route path="/leave/:leaveId" element={<LeaveDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee" element={<EmployeeSection />} />
        <Route path="/leave-policy" element={<LeavePolicy />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-pending-tasks" element={<PendingTasksAdmin />} />
        <Route path="/admin-notifications" element={<AdminNotification />} />
        <Route path="/leave-users/:leaveId" element={<LeaveDetailsUsers />} />
        <Route path="/leave-status" element={<CheckLeaveStatus />} />

        


      </Routes>
    </Router>
  );
};

export default App;
