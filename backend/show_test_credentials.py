#!/usr/bin/env python3
import sqlite3

# Connect to database
conn = sqlite3.connect('businesspilot.db')

# Get test user info
result = conn.execute('SELECT email, full_name, business_name, business_type FROM users WHERE email = ?', ('test@businesspilot.ai',)).fetchone()

if result:
    print("=== TEST USER CREDENTIALS ===")
    print(f"Email: {result[0]}")
    print(f"Password: testpassword123")
    print(f"Full Name: {result[1]}")
    print(f"Business: {result[2]}")
    print(f"Type: {result[3]}")
    print("")
    print("You can now login to the application with these credentials!")
else:
    print("No test user found in database")

conn.close()