from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import cv2
import easyocr
import os
import csv, subprocess
from manage_excel import load_settings

class OCRProcessor:
    def __init__(self):
        self.reader = easyocr.Reader(['sk', 'en'], gpu=True, quantize=True)

    def capture_frames(self, cam):
        ret, frame = cam.read()
        if not ret:
            return {"error": "Failed to read frame from camera"}
        # cam.release()
        current_directory = os.path.dirname(os.path.abspath(__file__))
        frame_path = os.path.join(current_directory, "../captured_frame.png")
        cv2.imwrite(frame_path, frame)

        image_preprocessing_path = os.path.join(current_directory, "image_preprocessing.py")
        subprocess.check_output(['python3', f'{image_preprocessing_path}', 'preprocess', f'{frame_path}'])
        preprocessed_image = cv2.imread(frame_path)
                
        text = self.perform_ocr(preprocessed_image)
        if text and not isinstance(text, dict):
            floats = self.extract_floats_from_dph(text)
            if floats:
                return [floats, preprocessed_image, text]
        return {"error": "Failed to perform OCR or extract floats"}

    def perform_ocr(self, image):
        try:
            text = self.reader.readtext(image, detail=0)
            text = ' '.join(text)
            print("OCR text:", text)
            return text
        except Exception as e:
            print("Error performing OCR:", str(e))
            return {"error": f"Error performing OCR: {str(e)}"}

    def trim_text(self, text):
        text_upper = text.upper()
        start_substrings = ["DPH", "DPH:", "DPF", "DPF:"]
        end_substrings = ["SPOLU", "SPOLU:", "SPO_U", "SPO_U:"]
        start_index = next((text_upper.find(substr) for substr in start_substrings if text_upper.find(substr) != -1), -1)
        end_index = next((text_upper.find(substr, start_index) for substr in end_substrings if text_upper.find(substr, start_index) != -1), -1)
        if start_index != -1 and end_index != -1:
            return text[start_index:end_index] 
        else:
            # _send_response(self, {"message": f'Cannot find DPH or SPOLU in text.\nText:\n{text_upper}'}, status=400)
            return False

    def extract_floats(self, text):
        import re
        pattern = r'\d+,\d{2}'
        text = self.trim_text(text)
        if text == False:
            print("Failed to trim text")
            return False
        matches = re.findall(pattern, text)
        floats = [float(match.replace(',', '.')) for match in matches if match]
        return floats
    
    def extract_floats_from_dph(self, text):
        import re
        text_upper = text.upper()
        start_substrings = ["DPH", "DPH:", "DPF", "DPF:"]
        start_index = next((text_upper.find(substr) for substr in start_substrings if text_upper.find(substr) != -1), -1)

        if start_index == -1:
            return {"error": f'Cannot find DPH or similar in text.\nText:\n{text_upper}'}

        trimmed_text = text[start_index:]
        pattern = r'\d+,\d{2}'
        matches = re.findall(pattern, trimmed_text)
        floats = [float(match.replace(',', '.')) for match in matches if match]

        if len(floats) % 2 != 0:
            floats.pop()  # Remove the last float if we have an odd number

        return floats[:6] if floats else {"error": "No floats found"}
    
    

class DataManager:
    def __init__(self):
        pass

    def create_folder(self, image_name, image, folder_name):
        _, _, folder_path = load_settings()
        folder_path = os.path.join(folder_path, folder_name) 
        images_path = os.path.join(folder_path, "images")
        image_save = os.path.join(images_path, image_name)
        if not os.path.exists(folder_path):
            try:
                os.makedirs(folder_path)
                os.makedirs(images_path)
            except Exception as e:
                print("Error creating folder:", str(e))
                return {"error": f"Error creating folder: {str(e)}"}
        cv2.imwrite(image_save, image)
        print("Folder and image created successfully")
        return True

    def write_to_csv(self, folder_name, img_name, extracted_text, floats, row_number):
        folder_path = os.path.join(load_settings()[2], folder_name) 
        csv_filename = f"{folder_name}_data.csv"
        csv_path = os.path.join(folder_path, csv_filename)
        file_exists = os.path.isfile(csv_path)
        
        if not file_exists:
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['Image Name', 'Extracted Text', 'Floats', 'Accepted Data'])
        
        rows = []
        if file_exists:
            with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                rows = list(reader)
        
        while len(rows) <= row_number:
            rows.append([''] * 4)
        
        rows[row_number] = [img_name, extracted_text, json.dumps(floats), '']
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)
        print("Data written to CSV successfully")

ocr_processor = OCRProcessor()
data_manager = DataManager()

class RequestHandler(BaseHTTPRequestHandler):

    def _send_response(self, response, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_POST(self):
        if self.path == '/capture':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            folder_name = data.get('folder_name')
            row_number = data.get('row_number')
            
            if not folder_name or not row_number:
                self._send_response({"message": "Missing folder_name or row_number"}, status=400)
                return
            
            row_number = int(row_number)
            image_name = f'{folder_name}_data_{row_number}.png'
            excel_path, webcam, folder_path = load_settings()

            if len(webcam) == 1:
                cam = cv2.VideoCapture(int(webcam))
            else:
                cam = cv2.VideoCapture(webcam)
            
            for attempt in range(3):
                result = ocr_processor.capture_frames(cam)
                if isinstance(result, dict) and "error" in result:
                    continue
                
                floats, image, text = result
                if result and len(floats) % 2 == 0:
                    folder_response = data_manager.create_folder(image_name, image, folder_name)
                    if isinstance(folder_response, dict) and "error" in folder_response:
                        print(folder_response["error"])
                        self._send_response(folder_response, status=500)
                        return
                    data_manager.write_to_csv(folder_name, image_name, text, floats, row_number)
                    self._send_response({"floats": floats, "message": "Processing successful", "attempt": attempt + 1})
                    return
                elif(attempt == 2):
                    self._send_response({"message": "Couldn't find enough floats"}, status=400)
                    return
            self._send_response({"message": "Failed to process frames after 3 attempts"}, status=400)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=5000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
