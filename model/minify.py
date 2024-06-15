import os, zipfile, sys, shutil
from manage_excel import load_settings
def zip_folder(folder_path, zip_filename, excel_path):
    
    full_path = os.path.join(folder_path, zip_filename)
    excel_file = os.path.join(excel_path, zip_filename + ".xlsx")
    zip_filename =os.path.join(folder_path, zip_filename + ".zip")
    try:
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(full_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, os.path.relpath(file_path, folder_path))
            file_name = os.path.basename(excel_file)
            zipf.write(excel_file, arcname=file_name)
        shutil.rmtree(full_path)
    except Exception as e:
        return 0

def main():
    if len(sys.argv) < 2:
        print("Usage: python manage_excel.py <file_name>")
        sys.exit(1)
    excel_path, _, ml_data_path = load_settings()
    
    zip_folder(ml_data_path, sys.argv[1], excel_path)    

if __name__ == "__main__":
    main()