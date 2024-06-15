import sys, openpyxl, os, json, csv

settings_name = "settings"

# Function to load settings from the file
def load_settings():
    try:
        with open(f"{settings_name}.txt", "r") as f:
            lines = f.readlines()
            return lines[0].strip(), lines[1].strip(), lines[2].strip() if len(lines) > 1 else ""
    except FileNotFoundError:
        return "", "", ""

# Function to create an Excel file and open it
def create_and_open_excel_file(path):
    workbook = openpyxl.Workbook()
    workbook.save(path)

# Function to write data to the already opened Excel file
def write_to_excel(file_path, data):
    try:
        workbook = openpyxl.load_workbook(file_path)
        sheet = workbook.active
        next_row = sheet.max_row + 1
        
        col = 3
        for pair in reversed(data):
            for value in pair:
                if(value == 0):
                    value = 0.00 
                sheet.cell(row=next_row, column=col, value=value)
                col += 1
            col-=3
        
        workbook.save(file_path)
    except Exception as e:
        print(f"An error occurred while writing to Excel: {str(e)}")

# Function to write data to the CSV file
def write_to_csv(folder_name, row_number, accepted_data):
    excel_path, webcam_ip, folder_path = load_settings()
    folder_path = os.path.join(folder_path, folder_name) 
    csv_filename = f"{folder_name}_data.csv"
    csv_path = os.path.join(folder_path, csv_filename)
        
    rows = []
    with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)
    
    rows[row_number][3] = f'{accepted_data}'
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(rows)

    
# Main function
def main():
    if len(sys.argv) < 2:
        print("Usage: python manage_excel.py <file_name>")
        sys.exit(1)
    path, _, ml_data_path = load_settings()
    full_path = os.path.join(path, sys.argv[2] + ".xlsx")  
    if sys.argv[1] == "create":
        create_and_open_excel_file(full_path)
    elif sys.argv[1] == "write":
        data = json.loads(sys.argv[3])  
        if(len(data) <= 2):
            write_to_excel(full_path, data)
            write_to_csv(sys.argv[2], int(sys.argv[4]), data)
            
if __name__ == "__main__":
    main()
