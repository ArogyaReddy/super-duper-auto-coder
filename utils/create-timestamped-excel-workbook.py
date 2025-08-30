#!/usr/bin/env python3

"""
🎯 GENERIC TIMESTAMPED EXCEL WORKBOOK CREATOR

Universal Excel workbook generator that works with any application testing.
Creates comprehensive Excel workbooks with timestamped CSV data.
Removes application-specific references for framework reusability.
"""

import pandas as pd
import sys
import os
from pathlib import Path
import glob

def create_timestamped_excel_workbook(reports_dir, timestamp):
    """Create Excel workbook from timestamped CSV files"""
    
    print(f"📊 GENERIC TIMESTAMPED EXCEL WORKBOOK CREATOR")
    print(f"=============================================")
    print(f"🕒 Timestamp: {timestamp}")
    print(f"📁 Reports Directory: {reports_dir}")
    print()
    
    # Define the expected CSV files with their sheet names
    csv_files = {
        f"00_Master_Import_Guide_{timestamp}.csv": "Master Import Guide",
        f"01_Summary_Dashboard_{timestamp}.csv": "Summary Dashboard", 
        f"02_All_Links_Catalog_{timestamp}.csv": "All Links Catalog",
        f"03_Menu_Navigation_{timestamp}.csv": "Menu Navigation",
        f"04_Broken_Links_Details_{timestamp}.csv": "Broken Links Details",
        f"05_Test_Results_{timestamp}.csv": "Test Results",
        f"06_Recommendations_{timestamp}.csv": "Recommendations"
    }
    
    # Create Excel filename
    excel_filename = f"BrokenLinks_Testing_Report_{timestamp}.xlsx"
    excel_path = os.path.join(reports_dir, excel_filename)
    
    try:
        # Create Excel writer
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            sheets_created = 0
            
            for csv_filename, sheet_name in csv_files.items():
                csv_path = os.path.join(reports_dir, csv_filename)
                
                if os.path.exists(csv_path):
                    try:
                        # Read CSV file
                        df = pd.read_csv(csv_path)
                        
                        # Write to Excel sheet
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        
                        # Get the worksheet to apply formatting
                        worksheet = writer.sheets[sheet_name]
                        
                        # Auto-adjust column widths
                        for column in worksheet.columns:
                            max_length = 0
                            column_letter = column[0].column_letter
                            
                            for cell in column:
                                try:
                                    if len(str(cell.value)) > max_length:
                                        max_length = len(str(cell.value))
                                except:
                                    pass
                            
                            adjusted_width = min(max_length + 2, 50)
                            worksheet.column_dimensions[column_letter].width = adjusted_width
                        
                        # Apply header formatting
                        if len(df) > 0:
                            for cell in worksheet[1]:
                                cell.font = cell.font.copy(bold=True)
                        
                        sheets_created += 1
                        print(f"   ✅ Sheet created: {sheet_name} ({len(df)} rows)")
                        
                    except Exception as e:
                        print(f"   ⚠️  Could not process {csv_filename}: {str(e)}")
                else:
                    print(f"   ⚠️  File not found: {csv_filename}")
            
            if sheets_created > 0:
                print(f"\n✅ Excel workbook created successfully!")
                print(f"📄 File: {excel_filename}")
                print(f"📊 Sheets: {sheets_created}")
                print(f"🎯 Generic framework - works with any application")
                print(f"🕒 Timestamped - preserves test history")
                return True
            else:
                print(f"\n❌ No sheets were created - no valid CSV files found")
                return False
                
    except Exception as e:
        print(f"❌ Excel workbook creation failed: {str(e)}")
        return False

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 3:
        print("Usage: python3 create-timestamped-excel-workbook.py <reports_dir> <timestamp>")
        sys.exit(1)
    
    reports_dir = sys.argv[1]
    timestamp = sys.argv[2]
    
    success = create_timestamped_excel_workbook(reports_dir, timestamp)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
