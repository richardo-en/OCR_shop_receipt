import sys
import openpyxl
import os
import json
import csv

class ExcelManager:

    def create_and_open_excel_file(self, filename, path):
        full_path = os.path.join(path, filename + ".xlsx")
        workbook = openpyxl.Workbook()
        workbook.save(full_path)

    def write_to_excel(self, devicepath, filename, row_number, data):
        try:
            full_path = os.path.join(devicepath, filename + ".xlsx")
            workbook = openpyxl.load_workbook(full_path)
            
            sheet = workbook.active
            next_row = row_number + 1
            accepted_data = len(data)
            if accepted_data == 2:
                col = 1
            else:
                col = 3
            for pair in reversed(data):
                for value in pair:
                    sheet.cell(row=next_row, column=col, value=value)
                    col += 1
            sheet.cell(row=next_row, column=5, value=f"=C{next_row}*20%")
            sheet.cell(row=next_row, column=6, value=f"=A{next_row}*10%")
            sheet.cell(row=next_row, column=7, value=f"=SUM(A{next_row}:B{next_row})")
            sheet.cell(row=next_row, column=8, value=f"=SUM(C{next_row}:D{next_row})")
            workbook.save(full_path)
        except Exception as e:
            print(f"An error occurred while writing to Excel: {str(e)}")