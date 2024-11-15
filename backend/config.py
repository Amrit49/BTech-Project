import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    MYSQL_HOST = 'localhost'  # or your MySQL server address
    MYSQL_USER = 'your_username'
    MYSQL_PASSWORD = 'your_password'
    MYSQL_DB = 'your_database_name'
