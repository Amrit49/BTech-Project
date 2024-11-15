from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config.from_object('config.Config')

mysql = MySQL(app)

class User:
    def __init__(self, user_id, username, email):
        self.user_id = user_id
        self.username = username
        self.email = email

    @staticmethod
    def get_all_users():
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users")
        results = cur.fetchall()
        cur.close()
        return results
