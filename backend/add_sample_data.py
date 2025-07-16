#!/usr/bin/env python3
"""
Add sample data to the database for testing
"""

import sqlite3
from datetime import datetime, timedelta
import random

def add_sample_data():
    conn = sqlite3.connect('businesspilot.db')
    cursor = conn.cursor()
    
    # Add sample sales data
    sample_sales = [
        (125.50, 12.50, 0.00, 'cash', 'John Doe', 'john@example.com', 'Cash sale'),
        (89.99, 8.99, 5.00, 'credit_card', 'Jane Smith', 'jane@example.com', 'Credit card payment'),
        (234.75, 23.47, 10.00, 'cash', 'Bob Johnson', 'bob@example.com', 'Large cash purchase'),
        (45.00, 4.50, 0.00, 'debit_card', 'Alice Brown', 'alice@example.com', 'Debit card payment'),
        (167.25, 16.72, 8.00, 'credit_card', 'Charlie Wilson', 'charlie@example.com', 'Credit purchase'),
    ]
    
    for i, (total, tax, discount, method, name, email, notes) in enumerate(sample_sales):
        sale_date = datetime.now() - timedelta(days=i)
        cursor.execute('''
            INSERT INTO sales (total_amount, tax_amount, discount_amount, payment_method, 
                             customer_name, customer_email, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (total, tax, discount, method, name, email, notes, sale_date))
    
    # Add sample inventory items
    sample_inventory = [
        ('Widget A', 'High quality widget', 'WGT-001', 'Electronics', 50, 10, 29.99, 15.00, 'WidgetCorp'),
        ('Gadget B', 'Useful gadget', 'GDG-002', 'Electronics', 30, 5, 45.50, 22.00, 'GadgetInc'),
        ('Tool C', 'Professional tool', 'TLK-003', 'Tools', 25, 8, 89.99, 45.00, 'ToolMakers'),
        ('Supply D', 'Essential supply', 'SPL-004', 'Supplies', 100, 20, 12.50, 6.00, 'SupplyChain'),
        ('Product E', 'Popular product', 'PRD-005', 'General', 75, 15, 67.00, 35.00, 'ProductCorp'),
    ]
    
    for name, desc, sku, category, qty, min_stock, price, cost, supplier in sample_inventory:
        cursor.execute('''
            INSERT INTO inventory (name, description, sku, category, quantity, min_stock_level, 
                                 unit_price, cost_price, supplier, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, desc, sku, category, qty, min_stock, price, cost, supplier, datetime.now()))
    
    # Add sample employees
    sample_employees = [
        ('Sarah Johnson', 'sarah@testbusiness.com', '+1234567890', 'Manager', 25.00, '2024-01-15'),
        ('Mike Davis', 'mike@testbusiness.com', '+1234567891', 'Sales Associate', 18.50, '2024-02-01'),
        ('Lisa Chen', 'lisa@testbusiness.com', '+1234567892', 'Cashier', 16.00, '2024-03-01'),
        ('David Wilson', 'david@testbusiness.com', '+1234567893', 'Stock Clerk', 17.25, '2024-01-20'),
    ]
    
    for name, email, phone, position, rate, hire_date in sample_employees:
        cursor.execute('''
            INSERT INTO employees (full_name, email, phone, position, hourly_rate, hire_date, 
                                 is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, email, phone, position, rate, hire_date, True, datetime.now()))
    
    # Add sample expenses
    sample_expenses = [
        (450.00, 'rent', 'Monthly rent payment', '2024-07-01', None, False),
        (89.50, 'utilities', 'Electricity bill', '2024-07-05', None, False),
        (234.75, 'inventory', 'New stock purchase', '2024-07-10', None, False),
        (125.00, 'marketing', 'Facebook ads', '2024-07-12', None, False),
        (67.50, 'supplies', 'Office supplies', '2024-07-15', None, False),
    ]
    
    for amount, category, description, date, receipt, recurring in sample_expenses:
        cursor.execute('''
            INSERT INTO expenses (amount, category, description, date, receipt_url, is_recurring, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (amount, category, description, date, receipt, recurring, datetime.now()))
    
    conn.commit()
    conn.close()
    
    print("Sample data added successfully!")
    print("- 5 sales transactions")
    print("- 5 inventory items")
    print("- 4 employees")
    print("- 5 expense records")

if __name__ == "__main__":
    add_sample_data()