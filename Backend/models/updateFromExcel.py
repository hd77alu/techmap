#!/usr/bin/env python3
import pandas as pd
import sqlite3
import os

# --- CONFIGURATION ---
# Path to your Excel file (update if needed)
EXCEL_PATH = os.path.join(os.path.dirname(__file__), 'TechmapData.xlsx')
# Path to your SQLite database
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'techmap.db')

# --- LOAD EXCEL SHEETS ---
xls = pd.ExcelFile(EXCEL_PATH)
print("Available sheets:", xls.sheet_names)
resources_df = pd.read_excel(xls, 'RESOURCES')
projects_df  = pd.read_excel(xls, 'PROJECTS')
trends_df    = pd.read_excel(xls, 'TRENDING DATA')

# --- CONNECT TO DATABASE ---
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# --- INSERT OR IGNORE RESOURCES ---
for _, row in resources_df.iterrows():
    url = str(row.get('URL', '')).strip()
    cursor.execute("""
        INSERT OR IGNORE INTO resources
          (name, type, url, recommended_style, tech_tags)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(row.get('Name', '')).strip(),
        str(row.get('Type', '')).strip(),
        url,
        str(row.get('Recomended_style', '')).strip(),
        str(row.get('TechTags', '')).strip()
    ))

# --- INSERT OR IGNORE PROJECTS ---
for _, row in projects_df.iterrows():
    cursor.execute("""
        INSERT OR IGNORE INTO projects
          (name, description, github_url, industry, required_skills)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(row.get('Name', '')).strip(),
        str(row.get('Description', '')).strip(),
        str(row.get('GitHub_Link', '')).strip(),
        str(row.get('Industry', '')).strip(),
        str(row.get('Required_Skills', '')).strip()
    ))

# --- INSERT OR IGNORE TRENDING DATA ---
for _, row in trends_df.iterrows():
    cursor.execute("""
        INSERT OR IGNORE INTO trending_data
          (category, item_name, trend_score, update_date)
        VALUES (?, ?, ?, ?)
    """, (
        str(row.get('Category', '')).strip(),
        str(row.get('Item_Name', '')).strip(),
        float(row.get('Trend_Score', 0) or 0),
        str(row.get('Update_Date', '')).strip()
    ))

# --- COMMIT & CLEAN UP ---
conn.commit()
conn.close()

print("✅ Database updated with Excel data!")