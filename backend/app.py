from werkzeug.security import check_password_hash
from datetime import datetime, timedelta, timezone,date
import jwt
from flask import jsonify, request,Flask
import mysql.connector
import secrets
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

SECRET_KEY = secrets.token_hex(32)
print(SECRET_KEY)

def establish_connection(host='localhost', user='root', passwd='Amritjot@1232', database='leavemanagementsystem'):
    """Establish connection with the local database and handle connection errors."""
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            passwd=passwd,
            database=database
        )
        return connection
    except mysql.connector.Error as e:
        print(f'An error occurred: {e}')
        return None

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        if user_id is None:
            return jsonify({"message": "Invalid token. User ID missing."}), 401
        expiration_time = payload.get('exp')
        if expiration_time:
            expiration_time = datetime.utcfromtimestamp(expiration_time).replace(tzinfo=timezone.utc)
            current_time = datetime.now(timezone.utc)
            if expiration_time < current_time:
                return jsonify({"message": "Token expired."}), 401
        return user_id  # Return the user_id if the token is valid

    except jwt.ExpiredSignatureError:
        # Token has expired
        return jsonify({"message": "Token has expired."}), 401
    except jwt.InvalidTokenError:
        # Invalid token
        return jsonify({"message": "Invalid token."}), 401


@app.route('/login', methods=['POST'])
def login():
    """Function used to log in the user to the web application."""
  
    data = request.json
    email = data.get('email')
    password = data.get('password')
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)  # Enables fetching rows as dictionaries
    cursor.execute("SELECT user_id, employee_type_id, roleposition_id, password FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        return jsonify({"message": "User not found. Please sign up."}), 400

    if user['password'] !=password:
        return jsonify({"message": "Invalid password."}), 401
    
    payload = {
        'user_id': user['user_id'],
        'email': email,
        'role_id': user['roleposition_id'],
        'is_admin': user['employee_type_id'] == 3,  # Check if the user is admin (employee_type_id == 3)
        'exp': datetime.now(timezone.utc) + timedelta(hours=2)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    return jsonify({
        "message": "User logged in successfully.",
        "user_id": user['user_id'],
        "is_admin": user['employee_type_id'] == 3,  # You can also return this directly here
        "role_id": user['roleposition_id'],
        "token": token  # Return the token in the response
    }), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    """Endpoint to handle user logout"""
    global current_user_id

    current_user_id = None  # Clear the session
    return jsonify({"message": "User logged out successfully."}), 200

@app.route('/get-current-user', methods=['GET'])
def get_current_user():
    """Endpoint to retrieve the current user ID, after validating JWT token."""
    token = request.headers.get('Authorization')  # Get the token from the Authorization header

    if not token:
        return jsonify({"message": "Authorization token is missing."}), 401
    
    token = token.split(" ")[1]

    try:
        # Remove 'Bearer ' part and decode the token
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token['user_id']
        return jsonify({"user_id": user_id}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired. Please log in again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token. Please log in again."}), 401



@app.route('/api/leave-balance/<int:user_id>', methods=['GET'])
def get_leave_balance(user_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing."}), 401
    
    token = token.split(" ")[1]

    token_user_id = verify_token(token)

    if isinstance(token_user_id,tuple):
        return token_user_id
    
    if token_user_id!=user_id:
        return jsonify({"message": "Unauthorized access."}), 403
    
    
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    user_id = token_user_id
    query = """
      SELECT l.type_name AS type, lb.max_days as credit, lb.used_amount, (lb.max_days - lb.used_amount) AS remaining
        FROM leave_balances lb
        JOIN leave_types l ON lb.leave_type_id = l.id
        WHERE lb.user_id = %s
    """
    cursor.execute(query, (user_id,))
    leave_balances = cursor.fetchall()
    print(leave_balances)

    cursor.close()
    connection.close()
    return jsonify(leave_balances)



@app.route('/api/leave-types/count', methods=['GET'])
def get_leave_types_count():
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) AS count FROM leave_types")
    result = cursor.fetchone()
    leave_types_count = result[0] if result else 0

    cursor.close()
    connection.close()
    return jsonify({"count": leave_types_count})


@app.route('/api/employees/count', methods=['GET'])
def get_employees_count():
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database"}),500
    
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM users WHERE employee_type_id IN (1,4,5)")
    result = cursor.fetchone()
    employees_count = result[0] if result else 0

    cursor.close()
    connection.close()
    return jsonify({"count": employees_count})

@app.route('/api/staff/count', methods=['GET'])
def get_registered_staff_count():
    """Get the count of registered staff where employee_type_id is 1, 4, or 5."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) AS count FROM users WHERE employee_type_id = 2")
    result = cursor.fetchone()
    staff_count = result[0] if result else 0

    cursor.close()
    connection.close()
    return jsonify({"count": staff_count})

@app.route('/api/leave-policies', methods=['GET'])
def get_leave_policies():
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary = True)
    cursor.execute("SELECT * FROM leave_types")
    leave_policies = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(leave_policies)

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    token = request.headers.get('Authorization').split(" ")[1]  # Get token from header
    user_id = verify_token(token)

    if not user_id:
        return jsonify({"message": "Unauthorized access. Invalid token."}), 401
    
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT u.user_id,  CONCAT(u.first_name, ' ', u.last_name) AS name, u.email, u.phone_no, u.address, u.date_of_birth,u.roleposition_id, r.role_name, u.employee_type_id
        FROM users u
        LEFT JOIN roles r ON u.roleposition_id = r.roleposition_id
        WHERE u.user_id = %s
    """, (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        return jsonify({"message": "User not found."}), 404
    
    # Prepare the response data
    user_profile = {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone_no"],
        "address": user["address"],
        "date_of_birth": user["date_of_birth"],
        "role": user["role_name"]
    }

    # Include department for faculty
    if user["employee_type_id"] in [1, 4, 5]:  # Assuming 1, 4, 5 are faculty types
        cursor.execute("SELECT d.department_name FROM departments d JOIN users u ON u.department_id = d.department_id WHERE u.user_id = %s", (user_id,))
        department = cursor.fetchone()
        user_profile["department"] = department["department_name"] if department else None
        user_profile["isFaculty"] = True
    else:
        user_profile["isFaculty"] = False

    # Include role information (whether the user is a role position holder)
    user_profile["isRoleHolder"] = user["roleposition_id"] in [2, 3, 4, 5]  # Assuming types 2, 3 hold role positions

    cursor.close()
    connection.close()

    return jsonify(user_profile), 200


@app.route('/api/leave-policies/<int:leave_id>', methods = ['PUT'])
def update_leave_policy(leave_id):
    data = request.json
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE leave_types
        SET type_name  = %s, description = %s, allocation = %s, carry_over = %s,pay_status =%s, min_service_required =%s
        WHERE id = %s
    """, (data['type_name'], data['description'], data['allocation'], data['carry_over'], data['pay_status'],data['min_service_required'],leave_id))

    connection.commit()

    cursor.close()
    connection.close()
    return jsonify({"message": "Leave policy updated successfully."}), 200

# @app.route('/api/users', methods=['GET'])
# def get_users_with_roles():
#     """Fetch all users along with their role names."""
#     connection = establish_connection()
#     if connection is None:
#         return jsonify({"message": "Failed to connect to the database."}), 500

#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("""
#         SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.phone_no, u.address, u.date_of_birth, r.role_name
#         FROM users u
#         LEFT JOIN roles r ON u.roleposition_id = r.roleposition_id
#     """)
#     users = cursor.fetchall()

#     cursor.close()
#     connection.close()

#     return jsonify(users), 200

@app.route('/api/admin-profile/<int:user_id>', methods=['GET'])
def get_admin_profile(user_id):
    """Fetch admin profile details along with role name based on role_position_id."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name, 
        u.email, u.phone_no, u.address, u.date_of_birth, r.role_name
        FROM users u
        JOIN roles r ON u.roleposition_id = r.roleposition_id
        WHERE u.user_id = %s
    """, (user_id,))
    user_details = cursor.fetchone()

    cursor.close()
    connection.close()

    if not user_details:
        return jsonify({"message": "User not found."}), 404

    return jsonify(user_details), 200







@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Fetch all employees with their details and department names."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    sort_by_type = request.args.get('sort_by_type', '').lower()
    department_id = request.args.get('department_id', None)
    cursor = connection.cursor(dictionary=True)
    
    query = """
        SELECT 
            u.user_id,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            u.phone_no,
            u.email,
            u.employee_type_id,
            et.type_name AS employee_type,
            d.department_name AS department
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        LEFT JOIN employee_type et ON u.employee_type_id = et.employee_type_id
    """

    conditions = []
    params = []

    if sort_by_type == 'faculty':
        conditions.append("u.employee_type_id In (1,4,5)")
    elif sort_by_type == 'staff':
        conditions.append("u.employee_type_id = 2")
    
    if department_id:
        conditions.append("u.department_id = %s")
        params.append(department_id)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    


    cursor.execute(query,tuple(params))
    employees = cursor.fetchall()

    cursor.close()
    connection.close()
    if not employees:
        return jsonify({"message": "No employees found."}), 404
    return jsonify(employees), 200

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Fetch the list of all departments."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT department_id, department_name FROM departments ORDER BY department_name")
    departments = cursor.fetchall()

    cursor.close()
    connection.close()

    if not departments:
        return jsonify({"message": "No departments found."}), 404

    return jsonify(departments), 200

@app.route('/api/add-employee', methods=['POST'])
def add_employee():
    data = request.json
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']
    password = data['password']
    phone_no = data['phoneNo']
    address = data['address']
    dob = data['dob']
    employee_type_id = data['employeeType']
    roleposition_id = data['role']
    department_id = data['department']

    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor()

    # Get the last user_id to increment
    cursor.execute("SELECT MAX(user_id) FROM users")
    last_user_id = cursor.fetchone()[0] or 0
    new_user_id = last_user_id + 1

    # Generate username
    username = first_name[:4].lower()  # First 4 letters of the first name

    # Insert the new user into the `users` table
    cursor.execute("""
        INSERT INTO users (user_id, username, password, email, first_name, last_name, phone_no, address, date_of_birth, employee_type_id, roleposition_id, department_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (new_user_id, username, password, email, first_name, last_name, phone_no, address, dob, employee_type_id, roleposition_id, department_id))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"message": "Employee added successfully."}), 201


@app.route('/api/employeeTypes', methods=['GET'])
def get_employee_types():
    """Fetch the list of all employee types."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT employee_type_id, type_name FROM employee_type WHERE employee_type_id != 3")
    employee_types = cursor.fetchall()

    cursor.close()
    connection.close()

    if not employee_types:
        return jsonify({"message": "No employee types found."}), 404

    return jsonify(employee_types), 200

@app.route('/api/roles', methods=['GET'])
def get_roles():
    """Fetch the list of all roles."""
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT roleposition_id, role_name FROM roles")
    roles = cursor.fetchall()

    cursor.close()
    connection.close()

    if not roles:
        return jsonify({"message": "No roles found."}), 404

    return jsonify(roles), 200

def calculate_prefix_suffix(start_date, end_date):
    # Assume holidays are stored in the HOLIDAYS table
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    connection = establish_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT holiday_date FROM holidays WHERE holiday_date BETWEEN %s AND %s", (start_date, end_date))
    holidays = cursor.fetchall()
    
    prefix_date, suffix_date = start_date, end_date
    
    # Logic to calculate prefix and suffix dates based on holidays
    for holiday in holidays:
        holiday_date = holiday[0]
        if holiday_date < start_date:
            prefix_date = holiday_date
        elif holiday_date > end_date:
            suffix_date = holiday_date
    
    cursor.close()
    connection.close()
    
    return prefix_date, suffix_date



@app.route('/api/apply-leave', methods=['POST'])
def apply_leave():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing."}), 401

    token = token.split(" ")[1]  # Remove 'Bearer ' from the token

    current_user_id = verify_token(token)
    if not current_user_id:
        return jsonify({"message": "Invalid or expired token. Please log in again."}), 401

    data = request.form
    leave_type_name = data.get("leave_name")
    reason = data.get("reason")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    leaving_station_date = data.get("leaving_station_date")
    rejoining_station_date = data.get("rejoining_station_date")
    email = data.get("email")

    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)

    # Get leave_type_id from leave_name
    cursor.execute("SELECT id FROM leave_types WHERE type_name = %s", (leave_type_name,))
    leave_type = cursor.fetchone()  # Make sure to fetch the result here

    if not leave_type:
        cursor.close()
        connection.close()
        return jsonify({"message": "Invalid leave type."}), 400

    leave_type_id = leave_type['id']

    leave_days = (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days + 1
    cursor.execute("""
        SELECT max_days, used_amount 
        FROM leave_balances 
        WHERE user_id = %s AND leave_type_id = %s
    """, (int(current_user_id), int(leave_type_id)))
    
    leave_balance = cursor.fetchone()
    
    if not leave_balance:
        cursor.close()
        connection.close()
        return jsonify({"message": "Leave balance record not found."}), 404

    # Calculate available leave days
    max_days = leave_balance['max_days']
    used_amount = leave_balance['used_amount']
    available_days = max_days - used_amount


    if leave_days > available_days:
        cursor.close()
        connection.close()
        return jsonify({"message": "Insufficient leave balance."}), 400
    

    cursor.execute("SELECT MAX(leave_id) as max_leave_id FROM LEAVE_APPLICATIONS")
    result = cursor.fetchone()  # Fetch the result to clear the cursor
    latest_leave_id = result['max_leave_id'] + 1 if result['max_leave_id'] else 1
    # Get workflow ID based on current user's role
    workflow_id = get_workflow_id_user(current_user_id)
    if not workflow_id:
        cursor.close()
        connection.close()
        return jsonify({"message": "Invalid user role or employee type."}), 400

    # Calculate prefix and suffix dates
    prefix_date, suffix_date = calculate_prefix_suffix(start_date, end_date)

    leaving_station_date = prefix_date if prefix_date else start_date
    rejoining_station_date = suffix_date if suffix_date else end_date

    # Handle file attachment
    attachment = request.files.get("attachment")
    attachment_filename = None
    attachment_data = None

    if attachment and allowed_file(attachment.filename):
        attachment_filename = secure_filename(attachment.filename)
        attachment_data = attachment.read()  # Read the file as binary data

    # Save the file to the server (optional)
        attachment.save(os.path.join(UPLOAD_FOLDER, attachment_filename))

    # Insert the leave application into the LEAVE_APPLICATIONS table
    cursor.execute("""
        INSERT INTO LEAVE_APPLICATIONS (
            leave_id, user_id, leave_type_id, leave_name, email, reason, attachment, status, application_date,
            start_date, end_date, prefix_date, suffix_date, leaving_station_date, rejoining_station_date, workflow_id
        ) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        latest_leave_id, current_user_id, leave_type_id, leave_type_name, email, reason, attachment_filename, 
        'Pending', date.today(), start_date, end_date, prefix_date, suffix_date, leaving_station_date, 
        rejoining_station_date, workflow_id
    ))

    # Create a pending task for admin approval
    cursor.execute("""
        INSERT INTO PENDING_TASKS (leave_id, approver_role_id, approver_id, status, task_type)
        VALUES (%s, %s, %s, %s, %s)
    """, (latest_leave_id, 1, 1, 'Pending', 'Leave Approval'))  # Assuming '1' corresponds to the Admin role_id and approver_id



    cursor.execute("Select user_id from users where roleposition_id = 1 ")
    admin_user = cursor.fetchone()
    if admin_user:
        admin_id = admin_user['user_id']
    else:
        return jsonify({"message": "Admin not found."}), 400

    # admin_id = cursor.fetchone()

    cursor.execute("""
        INSERT INTO leave_status (leave_id, current_desk, status)
        VALUES (%s, %s, %s)
    """, (latest_leave_id, 1, 'Pending'))  # Assuming '1' is Admin's roleposition_id
    
  # Fetch the current maximum id from leave_processing
    cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM leave_processing")
    result = cursor.fetchone()
    next_id = result['next_id']


# Insert the data with the manually incremented id
    cursor.execute("""
        INSERT INTO leave_processing (id, leave_id, workflow_step_id, status, processed_by, action_taken, action_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (next_id, latest_leave_id, 1, 'Pending', admin_id, 'Initial Submission', date.today()))

    cursor.execute("""
        UPDATE leave_balances 
        SET used_amount = used_amount + %s 
        WHERE user_id = %s AND leave_type_id = %s
    """, (leave_days, current_user_id, leave_type_id))

    # Commit transaction and close connection
    connection.commit()
    cursor.close()
    connection.close()

    send_notification_to_admin(latest_leave_id)  # Send notification to Admin

    return jsonify({"message": "Leave application submitted successfully."}), 201


def send_notification_to_admin(leave_id):
    # Establish a connection to the database
    connection = establish_connection()
    if connection is None:
        return

    cursor = connection.cursor(dictionary=True)

    # Get Admin's user_id (assuming Admin has user_id = 1)
    cursor.execute("SELECT user_id FROM USERS WHERE roleposition_id = 1 LIMIT 1")
    admin_user = cursor.fetchone()

    if admin_user:
        admin_user_id = admin_user['user_id']
        
        # Notification message
        message = f"A new leave application (ID: {leave_id}) is awaiting your approval."

        # Insert the notification into the NOTIFICATIONS table
        cursor.execute("""
            INSERT INTO NOTIFICATIONS (user_id, message)
            VALUES (%s, %s)
        """, (admin_user_id, message))

        # Commit the transaction
        connection.commit()
    else:
        print("Admin user not found")

    cursor.close()
    connection.close()


@app.route('/api/admin-notifications', methods=['GET'])
def get_notifications():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing."}), 401

    token = token.split(" ")[1]  # Remove 'Bearer ' from the token
    current_user_id = verify_token(token)
    
    if not current_user_id:
        return jsonify({"message": "Unauthorized. Please log in."}), 401


    # Fetch unread notifications for the current user (Admin)
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    
    # Get notifications for the logged-in Admin
    cursor.execute("""
        SELECT notification_id, message, created_at 
        FROM NOTIFICATIONS
        WHERE user_id = %s AND status = 'Unread'
        ORDER BY created_at DESC
    """, (current_user_id,))
    
    notifications = cursor.fetchall()
    
    cursor.close()
    connection.close()

    return jsonify({"notifications": notifications}), 200


@app.route('/api/pending-leaves', methods=['GET'])
def get_pending_leaves():
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    
    # Join PENDING_TASKS and LEAVE_APPLICATIONS to get required details for pending tasks
    cursor.execute("""
        SELECT 
            pt.task_id AS id, 
            la.user_id AS faculty_id, 
            CONCAT(u.first_name, ' ', u.last_name) AS facultyName, 
            la.leave_id,
            lt.type_name AS leaveType
        FROM 
            PENDING_TASKS pt
            JOIN LEAVE_APPLICATIONS la ON pt.leave_id = la.leave_id
            JOIN USERS u ON la.user_id = u.user_id
            JOIN LEAVE_TYPES lt ON la.leave_type_id = lt.id
        WHERE 
            pt.status = 'Pending'
            AND pt.approver_role_id = 1  
    """)
    
    pending_leaves = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(pending_leaves), 200


def get_workflow_id(employee_type_id,roleposition_id):
    """Get the workflow ID based on the user's role and employee type."""
    
    # Logic to map employee type and role to workflow
    if employee_type_id in [1,4,5]:  # Faculty
        return 1  # Faculty Workflow
    elif employee_type_id == 2:  # Staff
        return 2  # Staff Workflow
    elif roleposition_id == 3:  # HOD
        return 3  # HOD Workflow
    elif roleposition_id == 4:  # Dean
        return 4  # Dean Workflow
    return None

def get_workflow_id_user(user_id):
    """Retrieve the workflow ID based on the user's employee type or role."""
    connection = establish_connection()
    if connection is None:
        return None  # If the database connection fails

    cursor = connection.cursor(dictionary=True)
    
    # Retrieve user details to get the employee type or role
    cursor.execute("SELECT employee_type_id, roleposition_id FROM users WHERE user_id = %s", (user_id,))

    user = cursor.fetchone()
    
    cursor.close()
    connection.close()

    print("Fetched user: ",user)
    if not user:
        return None  # If no user found

    employee_type_id = user['employee_type_id']
    roleposition_id = user['roleposition_id']

    # Determine workflow_id based on employee type
    if employee_type_id == 2:  # Staff
        return 2  # Staff workflow (admin -> head of section -> registrar)
    elif employee_type_id in [1, 4, 5]:  # Faculty
        # Faculty workflow is based on the role position (e.g., HOD or Dean)
        return 1
    elif roleposition_id in  [2,3]:  # Assuming roleposition_id = 1 is Admin
            return 3 # Faculty workflow (admin -> HOD -> dean)
    elif roleposition_id in [4,5]:  # Assuming roleposition_id = 2 is HOD
            return 4  # HOD workflow (admin -> dean)
    else:
        return None  # If no valid workflow is found




@app.route('/api/leave-details/<int:leave_id>', methods=['GET'])
def get_leave_details(leave_id):
    
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({"message": "Unauthorized. Token is missing."}), 401

    # Verify the token and extract user_id
    token = token.split(" ")[1]  # Assuming the token is passed as 'Bearer <token>'
    result = verify_token(token)

    if isinstance(result, tuple):  # If result is a tuple, it means an error occurred (status code and message)
        return result

    current_user_id = result 
    # Fetch leave details from the database
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    
    # Fetch leave request details by leave_id
    cursor.execute("""
        SELECT la.leave_id, CONCAT(u.first_name, ' ', u.last_name) AS faculty_name, la.leave_name as leaveType, la.start_date, la.end_date, la.reason, la.status
        FROM LEAVE_APPLICATIONS la
        JOIN USERS u on la.user_id = u.user_id
        WHERE la.leave_id = %s
    """, (leave_id,))
    
    leave = cursor.fetchone()
    
    cursor.close()
    connection.close()

    if leave is None:
        return jsonify({"message": "Leave not found."}), 404
    return jsonify(leave), 200


@app.route('/api/approve-reject-leave/<int:leave_id>', methods=['POST'])
def approve_reject_leave(leave_id):
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({"message": "Unauthorized. Token is missing."}), 401

    # Verify the token and extract user_id
    token = token.split(" ")[1]  # Assuming the token is passed as 'Bearer <token>'
    result = verify_token(token)

    if isinstance(result, tuple):  # If result is a tuple, it means an error occurred (status code and message)
        return result

    current_user_id = result 


    data = request.json
    action = data.get("action")
    approver_note = data.get("note")
    if action not in ["approve", "reject"]:
        return jsonify({"message": "Invalid action. Must be 'approve' or 'reject'."}), 400

    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500
    cursor = connection.cursor(dictionary=True)

    try:
        current_step = get_current_workflow_step(cursor, leave_id)
        if not current_step:
            return jsonify({"message": "No pending workflow step found."}), 400

        update_leave_processing(cursor, leave_id, current_step, action,current_user_id)
        add_approver_note_if_provided(cursor, leave_id, approver_note,current_user_id)

       
        if action == 'approve':
            user_data = get_user_data(cursor,leave_id)
         
            employee_type_id = user_data['employee_type_id']
     
            workflow_id = get_workflow_id(employee_type_id,user_data['roleposition_id'])
         
            if workflow_id ==2 and employee_type_id ==2:
                handle_staff_workflow(cursor, leave_id, current_step)
            elif workflow_id == 1 and employee_type_id in [1,4,5]:
                handle_faculty_workflow(cursor, leave_id, current_step,user_data['user_id'])
            elif workflow_id ==3 and user_data['roleposition_id'] ==3:
                handle_hod_workflow(cursor,leave_id,current_step)
            
            cursor.execute("""
                UPDATE leave_status
                SET status = %s, current_desk = Null
                WHERE leave_id = %s
            """, ('Approved' if action == 'approve' else 'Rejected', leave_id))

            cursor.execute("""
                UPDATE leave_applications
                SET status = %s
                WHERE leave_id = %s
            """, ('Approved' , leave_id))

        elif action == 'reject':
            mark_leave_as_rejected(cursor, leave_id)
            cursor.execute("""
                UPDATE leave_applications
                SET status = %s
                WHERE leave_id = %s
            """, ('Rejected', leave_id))
        
        connection.commit()
        return jsonify({"message": f"Leave {action}ed successfully."}), 200
     
    finally:
        cursor.close()
        connection.close()

# Helper functions for specific task
def update_leave_processing(cursor, leave_id, current_step, action,current_user_id):
    cursor.execute("""
        UPDATE leave_processing
        SET status = %s, processed_by = %s, action_date = %s
        WHERE leave_id = %s AND workflow_step_id = %s
    """, ('Approved' if action == 'approve' else 'Rejected', current_user_id, date.today(), leave_id, current_step['workflow_step_id']))

def add_approver_note_if_provided(cursor, leave_id, approver_note,current_user_id):
    if approver_note:
        cursor.execute("SELECT COALESCE(MAX(note_id), 0) + 1 AS next_note_id FROM approver_notes")
        next_note_id = cursor.fetchone()["next_note_id"]
        cursor.execute("""
            INSERT INTO approver_notes (note_id, leave_id, approver_id, note, note_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (next_note_id, leave_id, current_user_id, approver_note, date.today()))

def get_user_data(cursor,leave_id):
    cursor.execute("""
        SELECT u.user_id,u.employee_type_id, u.roleposition_id
        FROM users u
        JOIN leave_applications la ON la.user_id = u.user_id
        WHERE la.leave_id = %s
    """, (leave_id,))
    return cursor.fetchone()


def handle_staff_workflow(cursor, leave_id, current_step):
    next_step = get_next_workflow_step(cursor, current_step['workflow_id'], current_step['sequence'])
    if next_step:
        approver_id = get_approver_id(cursor, next_step['roleposition_id'], employee_type_id=2)  # Indicating staff type
        if approver_id:
            add_next_approver_task(cursor, leave_id, next_step,approver_id)
            update_leave_status(cursor, leave_id, next_step['roleposition_id'])
        else:
            mark_leave_as_fully_approved(cursor,leave_id)
    else:
        mark_leave_as_fully_approved(cursor, leave_id)

def handle_faculty_workflow(cursor, leave_id, current_step,faculty_user_id):
    cursor.execute("""
        SELECT d.department_id
        FROM users u
        JOIN departments d ON u.department_id = d.department_id
        WHERE u.user_id = %s
    """, (faculty_user_id,))
    department = cursor.fetchone()
    
    if not department:
        print("Error: Department not found for the faculty user.")
        return
    next_step = get_next_workflow_step(cursor, current_step['workflow_id'], current_step['sequence'])
    if next_step:
        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE roleposition_id = 2 AND department_id = %s
            LIMIT 1
        """, (department['department_id'],))
        hod = cursor.fetchone()
        if hod:
            # Indicating staff type
            add_next_approver_task(cursor, leave_id, next_step,hod['user_id'])
            update_leave_status(cursor, leave_id, next_step['roleposition_id'])
        else: 
             print("Error: HOD not found for the specified department.")
    else:
        mark_leave_as_fully_approved(cursor, leave_id)

def handle_hod_workflow(cursor, leave_id, current_step):
    next_step = get_next_workflow_step(cursor, current_step['workflow_id'], current_step['sequence'])
    if next_step:
        approver_id = get_approver_id(cursor, next_step['roleposition_id'])  # Indicating staff type
        add_next_approver_task(cursor, leave_id, next_step,approver_id)
        update_leave_status(cursor, leave_id, next_step['roleposition_id'])
    else:
        mark_leave_as_fully_approved(cursor, leave_id)


def get_current_workflow_step(cursor, leave_id):
    cursor.execute("""
        SELECT lp.workflow_step_id, ws.workflow_id, ws.sequence, ws.roleposition_id
        FROM leave_processing lp
        JOIN workflow_steps ws ON lp.workflow_step_id = ws.workflow_step_id
        WHERE lp.leave_id = %s AND lp.status = 'Pending'
        ORDER BY ws.sequence
        LIMIT 1
    """, (leave_id,))
    return cursor.fetchone()

def get_next_workflow_step(cursor, workflow_id, current_sequence):
    cursor.execute("""
        SELECT ws.workflow_step_id, ws.roleposition_id
        FROM workflow_steps ws
        WHERE ws.workflow_id = %s AND ws.sequence > %s
        ORDER BY ws.sequence
        LIMIT 1
    """, (workflow_id, current_sequence ))
    return cursor.fetchone()

def add_next_approver_task(cursor, leave_id, next_step,approver_id):
    # Calculate the next ID for the leave_processing table
    cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM leave_processing")
    next_id = cursor.fetchone()["next_id"]

    # Insert the next approver's task into leave_processing
    cursor.execute("""
        INSERT INTO leave_processing (id, leave_id, workflow_step_id, status, processed_by, action_taken, action_date)
        VALUES (%s, %s, %s, 'Pending', NULL, NULL, NULL)
    """, (next_id, leave_id, next_step['workflow_step_id']))


    if approver_id:
        # Insert the task into PENDING_TASKS if an approver is found
        cursor.execute("""
            INSERT INTO PENDING_TASKS (leave_id, approver_role_id, approver_id, status, task_type)
            VALUES (%s, %s, %s, 'Pending', 'Leave Approval')
        """, (leave_id, next_step['roleposition_id'], approver_id))
    else:
        print("No approver found for the specified roleposition_id.")


def update_leave_status(cursor, leave_id, roleposition_id):
    cursor.execute("""
        UPDATE leave_status SET current_desk = %s WHERE leave_id = %s
    """, (roleposition_id, leave_id))

def mark_leave_as_fully_approved(cursor, leave_id):
    # cursor.execute("UPDATE leave_status SET status = 'Approved', current_desk = NULL WHERE leave_id = %s", (leave_id,))
    cursor.execute("""
        UPDATE leave_applications
        SET status = 'Fully Approved'
        WHERE leave_id = %s
    """, (leave_id,))

def mark_leave_as_rejected(cursor, leave_id):
    cursor.execute("UPDATE leave_status SET status = 'Rejected', current_desk = NULL WHERE leave_id = %s", (leave_id,))

def get_approver_id(cursor, roleposition_id, employee_type_id=None):
    # Special handling if employee is of type 'staff' (employee_type_id = 2)
    if employee_type_id == 2:
        # Get the approver who is head of section (roleposition_id = 3)
        cursor.execute("SELECT user_id FROM users WHERE roleposition_id = 3 LIMIT 1")
    else:
        # Otherwise, get approver by roleposition_id, assuming faculty has departments
        cursor.execute("SELECT user_id FROM users WHERE roleposition_id = %s LIMIT 1", (roleposition_id,))
        
    approver = cursor.fetchone()
    return approver['user_id'] if approver else None



def send_notification_to_next_approver(leave_id, roleposition_id):
    # Fetch next approver user_id based on roleposition_id
    connection = establish_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM USERS WHERE roleposition_id = %s LIMIT 1", (roleposition_id,))
    next_approver = cursor.fetchone()
    
    if next_approver:
        cursor.execute("""
            INSERT INTO NOTIFICATIONS (user_id, message)
            VALUES (%s, %s)
        """, (next_approver['user_id'], f"A new leave application (ID: {leave_id}) is awaiting your approval."))
        connection.commit()
    
    cursor.close()
    connection.close()

def notify_employee(leave_id, message):
    # Get employee user_id from leave application
    connection = establish_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM LEAVE_APPLICATIONS WHERE leave_id = %s", (leave_id,))
    employee = cursor.fetchone()
    
    if employee:
        cursor.execute("""
            INSERT INTO NOTIFICATIONS (user_id, message)
            VALUES (%s, %s)
        """, (employee['user_id'], message))
        connection.commit()
    
    cursor.close()
    connection.close()


@app.route('/api/role-pending-leaves/<int:approver_role_id>', methods=['GET'])
def get_role_pending_leaves(approver_role_id):
    print(f"Fetching pending leaves for role ID: {approver_role_id}") 
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)

    # Case 1: For HOD (All HODs based on department ID)
    if approver_role_id == 2:  # HOD for all departments
        # Fetch the department ID of the current user (assuming it's stored in session or context)
        department_id = get_department_for_hod() 
        print(department_id) # Custom function to get the department ID for the logged-in HOD\
        if department_id is None:
            return jsonify({"message": "Department ID could not be found for the current HOD."}), 404
        cursor.execute("""
            SELECT 
                pt.task_id AS id, 
                la.user_id AS faculty_id, 
                CONCAT(u.first_name, ' ', u.last_name) AS facultyName, 
                la.leave_id,
                lt.type_name AS leaveType
            FROM 
                PENDING_TASKS pt
                JOIN LEAVE_APPLICATIONS la ON pt.leave_id = la.leave_id
                JOIN USERS u ON la.user_id = u.user_id
                JOIN LEAVE_TYPES lt ON la.leave_type_id = lt.id
            WHERE 
                pt.status = 'Pending'
                AND pt.approver_role_id = %s
                AND u.department_id = %s  
        """, (approver_role_id, department_id))
    
    # Case 2: For Head of Section (HOS)
    elif approver_role_id == 3:  # Head of Section role
        cursor.execute("""
            SELECT 
                pt.task_id AS id, 
                la.user_id AS faculty_id, 
                CONCAT(u.first_name, ' ', u.last_name) AS facultyName, 
                la.leave_id,
                lt.type_name AS leaveType
            FROM 
                PENDING_TASKS pt
                JOIN LEAVE_APPLICATIONS la ON pt.leave_id = la.leave_id
                JOIN USERS u ON la.user_id = u.user_id
                JOIN LEAVE_TYPES lt ON la.leave_type_id = lt.id
            WHERE 
                pt.status = 'Pending'
                AND pt.approver_role_id = %s
    
        """, (approver_role_id,))
    
    # Case 3: For Dean or Registrar (Shared role logic)
    elif approver_role_id in [4,5]:  # Check for DEAN or REGISTRAR
        cursor.execute("""
            SELECT 
                pt.task_id AS id, 
                la.user_id AS faculty_id, 
                CONCAT(u.first_name, ' ', u.last_name) AS facultyName, 
                la.leave_id,
                lt.type_name AS leaveType
            FROM 
                PENDING_TASKS pt
                JOIN LEAVE_APPLICATIONS la ON pt.leave_id = la.leave_id
                JOIN USERS u ON la.user_id = u.user_id
                JOIN LEAVE_TYPES lt ON la.leave_type_id = lt.id
            WHERE 
                pt.status = 'Pending'
                AND pt.approver_role_id = %s
                
        """, (approver_role_id,))
    
    # Case 4: If invalid or unknown approver role_id
    else:
        cursor.close()
        connection.close()
        return jsonify({"message": "Invalid approver role ID."}), 400

    # Fetch results and close the connection
    pending_leaves = cursor.fetchall()
    cursor.close()
    connection.close()

    if not pending_leaves:
        return jsonify({"message": "No pending tasks found."}), 404

    return jsonify(pending_leaves), 200

def get_department_for_hod():
    # Import necessary modules
    token = request.headers.get("Authorization")
    if token is None:
        print("Authorization token missing")
        return None

    # Verify the token and extract user_id
    token = token.split(" ")[1]  # Assuming the token is passed as 'Bearer <token>'
    result = verify_token(token)

    if isinstance(result, tuple):
        print(f"Token verification failed: {result}")
        return None

    current_user_id = result 
    connection = establish_connection()

    if connection is None:
        return None

    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT department_id 
            FROM USERS 
            WHERE user_id = %s 
              AND roleposition_id = 2 
        """, (current_user_id,))

        result = cursor.fetchone()

        # Check if department_id was fetched
        if result:
            department_id = result[0]
            print("department_id for hod : {department_id}")
            return department_id
        else:
            print("No department found for the given HOD.")
            return None

    except Exception as e:
        print(f"Error fetching department for HOD: {e}")
        return None

    finally:
        cursor.close()
        connection.close()

@app.route('/api/leave-users/<int:leave_id>', methods=['GET'])
def get_leave_details_users(leave_id):
    
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({"message": "Unauthorized. Token is missing."}), 401

    # Verify the token and extract user_id
    token = token.split(" ")[1]  # Assuming the token is passed as 'Bearer <token>'
    result = verify_token(token)

    if isinstance(result, tuple):  # If result is a tuple, it means an error occurred (status code and message)
        return result

    current_user_id = result 
    # Fetch leave details from the database
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    
    # Fetch leave request details by leave_id
    cursor.execute("""
        SELECT la.leave_id, CONCAT(u.first_name, ' ', u.last_name) AS faculty_name, 
               la.leave_name AS leaveType, la.start_date, la.end_date, la.reason, la.status
        FROM LEAVE_APPLICATIONS la
        JOIN USERS u on la.user_id = u.user_id
        WHERE la.leave_id = %s
    """, (leave_id,))
    
    leave = cursor.fetchone()

    cursor.execute("""
       SELECT 
        an.note AS note,
        CONCAT(u.first_name, ' ', u.last_name) AS approverName,
        an.note_date AS action_date
    FROM 
        approver_notes an
    JOIN 
        USERS u ON an.approver_id = u.user_id
    WHERE 
        an.leave_id = %s
    ORDER BY 
        an.note_date ASC;

    """, (leave_id,))
    previous_notes = cursor.fetchall()
    
    leave['previousNotes'] = previous_notes
    cursor.execute("""
        SELECT lp.status, lp.action_taken, lp.processed_by, lp.action_date
        FROM leave_processing lp
        WHERE lp.leave_id = %s AND lp.workflow_step_id = (
            SELECT workflow_step_id 
            FROM workflow_steps 
            WHERE roleposition_id = %s
            LIMIT 1
        ) AND lp.processed_by = %s
    """, (leave_id, current_user_id, current_user_id))
    
    processing_status = cursor.fetchone()
    
    if processing_status:
        leave['status'] = processing_status['status']  # Make sure to use the status from leave_processing
        print("Leave status:", leave['status'])  # Debugging line
# return jsonify(leave), 200

        leave['action_taken'] = processing_status['action_taken']
    else:
        leave['status'] = 'Not Processed'  # Default if no processing status is found
        leave['action_taken'] = 'Pending'

    
    cursor.close()
    connection.close()

    if leave is None:
        return jsonify({"message": "Leave not found."}), 404
    return jsonify(leave), 200






@app.route('/api/approve-reject-leave-user/<int:leave_id>', methods=['POST'])
def approve_reject_leave_user(leave_id):
    # Authorization Check
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Unauthorized. Token is missing."}), 401
    token = token.split(" ")[1]
    result = verify_token(token)
    if isinstance(result, tuple):
        return result

    current_user_id = result
    data = request.json
    action = data.get("action")
    approver_note = data.get("note")
    if action not in ["approve", "reject"]:
        return jsonify({"message": "Invalid action. Must be 'approve' or 'reject'."}), 400

    # Establish database connection
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch the current step in the workflow
        current_step = get_current_workflow_step(cursor, leave_id)
        if not current_step:
            return jsonify({"message": "No pending workflow step found."}), 400

        # Update leave processing and add approver note
        update_leave_processing_user(cursor, leave_id, current_step, action, current_user_id)
        if approver_note:
            add_approver_note_user(cursor, leave_id, current_user_id, approver_note)

        if action == 'approve':
            user_data = get_user_data1(cursor, leave_id)
            handle_approval_workflow_user(cursor, leave_id, current_step, user_data)
            cursor.execute("UPDATE LEAVE_APPLICATIONS SET status = 'Approved' WHERE leave_id = %s", (leave_id,))
            return jsonify({"message": "Leave approved successfully."}), 200

        elif action == 'reject':
            mark_leave_as_rejected_user(cursor, leave_id)

        # Commit changes
        connection.commit()
        return jsonify({"message": f"Leave {action}d successfully."}), 200

    finally:
        cursor.close()
        connection.close()


# Helper Functions
def update_leave_processing_user(cursor, leave_id, current_step, action, current_user_id):
    cursor.execute("""
        UPDATE leave_processing
        SET status = %s, processed_by = %s, action_date = %s
        WHERE leave_id = %s AND workflow_step_id = %s
    """, ('Approved' if action == 'approve' else 'Rejected', current_user_id, date.today(), leave_id, current_step['workflow_step_id']))

def add_approver_note_user(cursor, leave_id, current_user_id, note):
    cursor.execute("SELECT COALESCE(MAX(note_id), 0) + 1 AS next_note_id FROM approver_notes")
    next_note_id = cursor.fetchone()["next_note_id"]
    cursor.execute("""
        INSERT INTO approver_notes (note_id, leave_id, approver_id, note, note_date)
        VALUES (%s, %s, %s, %s, %s)
    """, (next_note_id, leave_id, current_user_id, note, date.today()))

def get_user_data1(cursor, leave_id):
    cursor.execute("""
        SELECT u.user_id, u.employee_type_id, u.roleposition_id, u.department_id
        FROM users u
        JOIN leave_applications la ON la.user_id = u.user_id
        WHERE la.leave_id = %s
    """, (leave_id,))
    return cursor.fetchone()

def handle_approval_workflow_user(cursor, leave_id, current_step, user_data):
    workflow_id = current_step['workflow_id']
    employee_type_id = user_data['employee_type_id']
    roleposition_id = user_data['roleposition_id']

    next_step = get_next_workflow_step_user(cursor, workflow_id, current_step['sequence'])
    
    if next_step:
        # Determine next approver based on role position and employee type
        if employee_type_id in [1,4,5]:
            approver_id = get_approver_id_user(cursor, 4)  # Head of Section
            
        elif employee_type_id == 2:  # Staff Workflow
            approver_id = get_approver_id_user(cursor, 5)  # Head of Section
     
        if approver_id:
            add_next_approver_task_user(cursor, leave_id, next_step, approver_id)
            update_leave_status_user(cursor, leave_id, next_step['roleposition_id'])
        else:
            mark_leave_as_fully_approved_user(cursor, leave_id)
    else:
        mark_leave_as_fully_approved_user(cursor, leave_id)
    # connection.commit()
def get_next_workflow_step_user(cursor, workflow_id, current_sequence):
    cursor.execute("""
        SELECT workflow_step_id, roleposition_id
        FROM workflow_steps
        WHERE workflow_id = %s AND sequence > %s
        ORDER BY sequence
        LIMIT 1
    """, (workflow_id, current_sequence))
    return cursor.fetchone()

def get_approver_id_user(cursor, role_position_id):
    cursor.execute("SELECT user_id FROM users WHERE roleposition_id = %s LIMIT 1", (role_position_id,))
    approver = cursor.fetchone()
    return approver['user_id'] if approver else None

def get_hod_for_department_user(cursor, department_id):
    cursor.execute("""
        SELECT user_id FROM users
        WHERE roleposition_id = 2 AND department_id = %s
        LIMIT 1
    """, (department_id,))
    hod = cursor.fetchone()
    return hod['user_id'] if hod else None

def add_next_approver_task_user(cursor, leave_id, next_step, approver_id):
    cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM leave_processing")
    next_id = cursor.fetchone()["next_id"]
    cursor.execute("""
        INSERT INTO leave_processing (id, leave_id, workflow_step_id, status,processed_by)
        VALUES (%s, %s, %s, 'Pending',%s)
    """, (next_id, leave_id, next_step['workflow_step_id'],approver_id))
    cursor.execute("""
        INSERT INTO pending_tasks (leave_id,approver_role_id, approver_id, status,task_type)
        VALUES (%s, %s,%s, 'Pending','Leave Approval')
    """, (leave_id, next_step['roleposition_id'],approver_id))

def update_leave_status_user(cursor, leave_id, role_position_id):
    cursor.execute("""
        UPDATE leave_status SET current_desk = %s WHERE leave_id = %s
    """, (role_position_id, leave_id))

def mark_leave_as_fully_approved_user(cursor, leave_id):
    cursor.execute("""
        UPDATE leave_applications SET status = 'Approved'
        WHERE leave_id = %s
    """, (leave_id,))
    cursor.execute("""
        SELECT user_id, leave_type_id, start_date, end_date
        FROM leave_applications
        WHERE leave_id = %s
    """, (leave_id,))
    leave_details = cursor.fetchone()

    if leave_details:
        user_id = leave_details["user_id"]
        leave_type_id = leave_details["leave_type_id"]
        start_date = leave_details["start_date"]
        end_date = leave_details["end_date"]

        # Calculate the number of leave days
        leave_days = (end_date - start_date).days + 1

        # Update used_amount in leave_balances for the user and leave_type_id
        cursor.execute("""
            UPDATE leave_balances
            SET used_amount = used_amount + %s
            WHERE user_id = %s AND leave_type_id = %s
        """, (leave_days, user_id, leave_type_id))

        # Send notification to the user
        send_notification(cursor, user_id, "Your leave request has been fully approved.")


def mark_leave_as_rejected_user(cursor, leave_id):
    cursor.execute("""
        UPDATE leave_applications SET status = 'Rejected'
        WHERE leave_id = %s
    """, (leave_id,))
    cursor.execute("SELECT user_id FROM leave_applications WHERE leave_id = %s", (leave_id,))
    user = cursor.fetchone()

    if user:
        user_id = user["user_id"]
        # Send notification to the user
        send_notification(cursor, user_id, "Your leave request has been rejected.")

def send_notification(cursor, user_id, message):
    # Get the next notification_id
    cursor.execute("SELECT COALESCE(MAX(notification_id), 0) + 1 AS next_notification_id FROM notifications")
    next_notification_id = cursor.fetchone()["next_notification_id"]

    # Insert notification record
    cursor.execute("""
        INSERT INTO notifications (notification_id, user_id, message, status, created_at)
        VALUES (%s, %s, %s, 'Unread', %s)
    """, (next_notification_id, user_id, message, datetime.now()))


@app.route('/api/user-notifications', methods=['GET'])
def get_user_notifications():
    # Get the user ID from the authorization token (JWT or otherwise)
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"message": "Authorization token is missing"}), 401
    
    # Assuming you extract the user ID from the token (JWT decoding logic goes here)
    user_id = verify_token(token)

    if not user_id:
        return jsonify({"message": "Invalid or expired token"}), 401

    # Establish database connection
    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    cursor = connection.cursor(dictionary=True)
    
    try:
        # Query to fetch notifications for the logged-in user (filter by user_id)
        cursor.execute("""
            SELECT notification_id, message, created_at 
            FROM notifications 
            WHERE user_id = %s AND status = 'Unread'
            ORDER BY created_at DESC
        """, (user_id,))

        notifications = cursor.fetchall()
        
        # Close the cursor and connection
        cursor.close()
        connection.close()
        
        return jsonify({"notifications": notifications}), 200

    except Exception as e:
        cursor.close()
        connection.close()
        return jsonify({"message": str(e)}), 500
    
@app.route('/api/leave-status', methods=['GET'])
def get_leave_status():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing."}), 401
    
    token = token.split(" ")[1]
    current_user_id = verify_token(token)

    if not current_user_id:
        return jsonify({"message": "Unauthorized. Please log in."}), 401

    connection = establish_connection()
    if connection is None:
        return jsonify({"message": "Failed to connect to the database."}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT la.leave_name, la.start_date, la.end_date, la.reason, ls.status, 
                   (SELECT CONCAT(first_name, ' ', last_name)  FROM users WHERE user_id = ls.current_desk) AS current_approver
            FROM LEAVE_APPLICATIONS la
            JOIN leave_status ls ON la.leave_id = ls.leave_id
            WHERE la.user_id = %s
            """,
            (current_user_id,)  # Ensure this is a tuple
        )

        leave_status = cursor.fetchall()
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify(leave_status), 200



app.run(debug=True)
