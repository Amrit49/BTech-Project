# Leave Management System

A Leave Management System designed to streamline leave request and approval workflows for employees and administrators. The system includes features such as leave request management, user leave history, and role-based workflows.

## Features

- **User Authentication**: Secure login system with token-based authentication.
- **Leave Request**: Employees can submit leave requests with start/end dates, reasons, and optional document attachments.
- **Role-Based Workflow**:
  - Admin initiates the approval process.
  - Subsequent approvers depend on employee type and predefined workflow.
- **Past Leave History**: Displays a table of past leave requests for users.
- **Approver Notes**: Approvers can add notes while approving or rejecting requests.
- **Action History**: Prevents duplicate actions on already processed requests.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

- **Frontend**: React, CSS (custom styles for responsive design)
- **Backend**: Flask
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **API**: RESTful API for leave management operations

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/leave-management-system.git
   cd leave-management-system

2. Install dependencies:
   ```bash
   npm install

3. Start the frontend server:
   ```bash
   npm start


## API Endpoints

| Endpoint                             | Method | Description                                       |
|--------------------------------------|--------|---------------------------------------------------|
| `/api/login`                         | POST   | Authenticate users and issue tokens              |
| `/api/leave-details/<int:leave_id>`  | GET    | Fetch detailed information about a leave         |
| `/api/user-past-leaves/<int:user_id>`| GET    | Retrieve a user's leave history                  |
| `/api/approve-reject-leave`          | POST   | Update leave status with approver notes          |
| `/api/role-pending-leaves/<role_id>` | GET    | Get pending leave requests for specific roles    |


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Future Improvements

- Add email notifications for leave approvals/rejections.
- Implement analytics dashboards for leave trends.
- Support exporting leave data to CSV or Excel.


