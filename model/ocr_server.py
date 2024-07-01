from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import cv2
import easyocr
import os, logging
import csv, subprocess
from image_preprocessing import ImagePreprocessing
from manage_excel import ExcelManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SettingsManager:
    def __init__(self):
        self.devicePath = None
        self.webcamIP = None
        self.dataPath = None
        self.mainSettings = None
        self.file_name = None
        self.imagePreprocessingSettings = None
        
    def updateMainSettings(self, main_settings_json):
        self.mainSettings = main_settings_json
        self.webcamIP = self.mainSettings.get('webcamIp')
        self.dataPath = self.mainSettings.get('dataPath')
        self.devicePath = self.mainSettings.get('devicePath')
        
    def updatePreprocessingSettings(self, preprocessing_settings):
        self.imagePreprocessingSettings = json.dumps(preprocessing_settings)
        
class FunctionsManager:
    def __init__(self, settings_object):
        self.image_preprocessor = ImagePreprocessing(settings_object)
    
    
        
class OCRProcessor():
    def __init__(self):
        self.reader = easyocr.Reader(['sk', 'en'], gpu=True, quantize=True)
        self.cam = None  # Initially, no camera is initialized
<<<<<<< HEAD
        self.extracted_text = None
        self.floats  = None
        self.image_name = None
        self.message = None

    def initialize_camera(self, action):
        print(f"Initializing camera with action: {action}")
        try:
            if action == "initialize":
                if len(setting_manager.webcamIP) == 1:
                    print(f"Attempting to open camera with device index {setting_manager.webcamIP}")
                    self.cam = cv2.VideoCapture(int(setting_manager.webcamIP))
                else:
                    print(f"Attempting to open camera with IP {setting_manager.webcamIP}")
                    self.cam = cv2.VideoCapture(setting_manager.webcamIP)
                if not self.cam.isOpened():
                    print("Camera failed to open.")
                    return False
                return True
            elif action == "uninitialize":
                if self.cam and self.cam.isOpened():
                    self.cam.release()
                    self.cam = None
                    return True
                else:
                    print("Camera is not opened or already uninitialized.")
                    return False
        except Exception as e:
            print(f"Error during camera {action}: {e}")
    
    def captureFrame(self):
        if self.cam is None or not self.cam.isOpened():
            if not self.initialize_camera("initialize"):
                print("Failed to initialize camera in captureFrame.")
                return False

        ret, frame = self.cam.read()
        if not ret:
            print("Failed to read frame in captureFrame.")
            return False
        
        self.initialize_camera("uninitialize")
=======

    def initialize_camera(self, action):
        if(action == "initialize"):
            excel_path, webcam, folder_path = load_settings()
            if len(webcam) == 1:
                self.cam = cv2.VideoCapture(int(webcam))
            else:
                self.cam = cv2.VideoCapture(webcam)
            return self.cam.isOpened()
        elif action == "uninitialize":
            if self.cam and self.cam.isOpened():
                self.cam.release()
                self.cam = None
                return True
            else:
                return False

    def capture_frames(self):
        if self.cam is None or not self.cam.isOpened():
            return {"error": "Camera is not initialized"}
        
        ret, frame = self.cam.read()
        if not ret:
            return {"error": "Failed to read frame from camera"}
>>>>>>> origin/main
        current_directory = os.path.dirname(os.path.abspath(__file__))
        frame_path = os.path.join(current_directory, "../not_preprocessed.png")
        cv2.imwrite(frame_path, frame)
        return frame


    def capture_frames(self, counter):
        self.initialize_camera("uninitialize")
        self.initialize_camera("initialize")
        
        ret, frame = self.cam.read()
        if not ret:
            self.message = "problem with ret"
            return {"error": "Failed to read frame from camera"}
        self.message = "problem with capturing"
        self.image_name = f'{setting_manager.file_name}_{counter}.png'
        self.message = "problem with image name"
        try:
            frame_path = os.path.join(setting_manager.dataPath, setting_manager.file_name, 'images', self.image_name)
        except Exception as e:
            self.message = "problem with image path\n"+e
        try:
            cv2.imwrite(frame_path, frame)
        except Exception as e:
            self.message = "problem with saving file\n" + e
            
        preprocessed_image = functions_manager.image_preprocessor.preprocess_image(frame)

<<<<<<< HEAD
=======
        image_preprocessing_path = os.path.join(current_directory, "image_preprocessing.py")
        subprocess.check_output(['python3', f'{image_preprocessing_path}', 'preprocess', f'{frame_path}'])
        preprocessed_image = cv2.imread(frame_path)

>>>>>>> origin/main
        text = self.perform_ocr(preprocessed_image)
        self.message = "problem with preforming ocr"
        if text and not isinstance(text, dict):
            self.extracted_text = text
            self.message = "problem with saving text"
            floats = self.extract_floats_from_dph(text)
            self.message = "problem with extracting floats"
            if floats:
                self.floats = floats
                return True
        return False

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
        text_upper = str(text).upper()
        start_substrings = ["DPH", "DPH:", "DPF", "DPF:"]
        end_substrings = ["SPOLU", "SPOLU:", "SPO_U", "SPO_U:"]
        start_index = next((text_upper.find(substr) for substr in start_substrings if text_upper.find(substr) != -1), -1)
        end_index = next((text_upper.find(substr, start_index) for substr in end_substrings if text_upper.find(substr, start_index) != -1), -1)
        if start_index != -1 and end_index != -1:
            return text[start_index:end_index]
        else:
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
<<<<<<< HEAD
        text_upper = str(text).upper()
=======
        text_upper = text.upper()
>>>>>>> origin/main
        trimmed_text = self.trim_text(text)
        if(not trimmed_text):
            return self.extract_floats(trimmed_text)
        else:
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

class DataManager():

<<<<<<< HEAD
    def create_folder(self, folder_name):
        folder_path = os.path.join(setting_manager.dataPath, folder_name)
=======
    def create_folder(self, image_name, image, folder_name):
        _, _, folder_path = load_settings()
        folder_path = os.path.join(folder_path, folder_name)
>>>>>>> origin/main
        images_path = os.path.join(folder_path, "images")
        if not os.path.exists(folder_path):
            try:
                os.makedirs(folder_path)
                os.makedirs(images_path)
            except Exception as e:
                print("Error creating folder:", str(e))
                return {"error": f"Error creating folder: {str(e)}"}
        print("Folder and image created successfully")
        return True

<<<<<<< HEAD
    def write_to_csv(self, row_number, data):
        # data = json.dumps(data)
        folder_path = os.path.join(setting_manager.dataPath, setting_manager.file_name)
        csv_filename = f"{setting_manager.file_name}_data.csv"
=======
    def write_to_csv(self, folder_name, img_name, extracted_text, floats, row_number):
        folder_path = os.path.join(load_settings()[2], folder_name)
        csv_filename = f"{folder_name}_data.csv"
>>>>>>> origin/main
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

<<<<<<< HEAD
        rows[row_number] = [ocr_processor.image_name, ocr_processor.extracted_text, ocr_processor.floats, json.dumps(data)]
=======
        rows[row_number] = [img_name, extracted_text, json.dumps(floats), '']
>>>>>>> origin/main

        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)
        print("Data written to CSV successfully")


class RequestHandler(BaseHTTPRequestHandler):
    
    def __init__(self, request, client_address, server):
        super().__init__(request, client_address, server)

    def log_request(self, code='-', size='-'):
        logging.info(f"{self.command} {self.path} {self.request_version} {code} {size}")
        
    def log_message(self, format, *args):
        logging.info(f"{self.address_string()} - {format % args}")


    def do_GET(self):
        if self.path == '/':
            self._send_response({"message": "Server is running"})

    def _send_response(self, response, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_POST(self):
        if self.path == '/init_camera':
<<<<<<< HEAD
            # print(f"Received request to initialize camera: {data}")
            if ocr_processor.initialize_camera("initialize"):
                self._send_response({"success": "Camera was initialized"}, status=200)
            else:
                error_message = "Failed to initialize camera"
                print(error_message)
                self._send_response({"error": error_message}, status=500)

        
        elif self.path == '/uninit_camera':
=======
            if ocr_processor.initialize_camera("initialize"):
                self._send_response({"message": "Camera initialized successfully"})
            else:
                self._send_response({"error": "Failed to initialize camera"}, status=500)
        
        if self.path == '/uninit_camera':
>>>>>>> origin/main
            if ocr_processor.initialize_camera("uninitialize"):
                self._send_response({"message": "Camera uninitialized successfully"})
            else:
                self._send_response({"error": "Failed to uninitialize camera"}, status=500)

<<<<<<< HEAD
        elif self.path == '/capture':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            row_number = data.get('row_number')
            row_number = int(row_number)
            result = ocr_processor.capture_frames(row_number)
            
            
            if(result != False and ocr_processor.floats != None):
                if result and len(ocr_processor.floats) % 2 == 0:
                    self._send_response({"floats": ocr_processor.floats, "message": "Processing successful"})
            else:
                self._send_response({"message": f'{ocr_processor.message}'})
        elif self.path == '/mainsettings':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            main_settings = data.get('main_settings')
            setting_manager.updateMainSettings(main_settings)
            self._send_response({"message": f"{main_settings}"})

        elif self.path == '/image_preprocessing_settings':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            preprocessing_settings = data.get('image_preprocessing_settings')
            setting_manager.updatePreprocessingSettings(preprocessing_settings)
            self._send_response({"message": f"{preprocessing_settings}"})
            
        elif self.path == '/preprocessing/capture':
            try:
                new_settings_image = ocr_processor.captureFrame()
                current_directory = os.path.dirname(os.path.abspath(__file__))
                frame_path = os.path.join(current_directory, "../processed_data.png")
                preprocessed_image = functions_manager.image_preprocessor.preprocess_image(new_settings_image)
                cv2.imwrite(frame_path, preprocessed_image)
                self._send_response({"message": "Image was preprocessed"})
            except Exception as e:
                self._send_response({"message": f'application failed with error {e}'}, status=400)
            
        elif self.path == '/preprocessing/update':
            try:
                current_directory = os.path.dirname(os.path.abspath(__file__))
                frame_path = os.path.join(current_directory, "../not_preprocessed.png")
                not_preproccessed_image = cv2.imread(frame_path)
                preprocessed_image = functions_manager.image_preprocessor.preprocess_image(not_preproccessed_image)
                frame_path = os.path.join(current_directory, "../processed_data.png")
                cv2.imwrite(frame_path, preprocessed_image)
                self._send_response({"message": "Success"})
            except Exception as e:
                self._send_response({"message": f'application failed with error {e}'}, status=400)
                
        elif self.path == '/manageexcel/create':
            try:
                ocr_processor.initialize_camera('initialize')
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                filename = data.get('file_name')
                setting_manager.file_name = filename
                folder_response = data_manager.create_folder(filename)
=======
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

            result = ocr_processor.capture_frames()
            # if isinstance(result, dict) and "error" in result:
            #     continue

            floats, image, text = result
            if result and len(floats) % 2 == 0:
                folder_response = data_manager.create_folder(image_name, image, folder_name)
>>>>>>> origin/main
                if isinstance(folder_response, dict) and "error" in folder_response:
                    print(folder_response["error"])
                    self._send_response(folder_response, status=500)
                    return
<<<<<<< HEAD
                excel_manager.create_and_open_excel_file(filename, setting_manager.devicePath)
                self._send_response({"message": 'Excel file was created'})
                
            except Exception as e:
                self._send_response({"message": f'application failed with error {e}'}, status=400)
                
        elif self.path == '/manageexcel/write':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                row_number = data.get('row_number')
                data = data.get('data')
                if(data):
                    try:
                        excel_manager.write_to_excel(setting_manager.devicePath, setting_manager.file_name, row_number, data)
                    except Exception as e:
                        self._send_response({"message": f'Problem with writing to excel {e}'}, status=400)
                        
                    try:
                        data_manager.write_to_csv(row_number, data)
                    except Exception as e:
                        self._send_response({"message": f'Problem with writing to csv {e}'}, status=400)
                        
                    self._send_response({"message": 'Data were written to excel'})
            except Exception as e:
                self._send_response({"message": f'application failed with error {e}'})
                
        elif self.path == '/manageexcel/stop':
            setting_manager.file_name = None
            ocr_processor.floats = None
            ocr_processor.extracted_text = None
            ocr_processor.image_name = None
            self._send_response({"message": "success"})
            
            
            
setting_manager = SettingsManager()
excel_manager = ExcelManager()
functions_manager = FunctionsManager(setting_manager)
ocr_processor = OCRProcessor()
data_manager = DataManager()


=======
                data_manager.write_to_csv(folder_name, image_name, text, floats, row_number)
                self._send_response({"floats": floats, "message": "Processing successful"})
                return
            else:
                self._send_response({"message": "Couldn't find enough floats"}, status=400)
                return
>>>>>>> origin/main

def run(server_class=HTTPServer, handler_class=RequestHandler, port=5000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
<<<<<<< HEAD
    print(json.dumps('Server ready'))
=======
    print(json.dumps(f'success'))
>>>>>>> origin/main
    httpd.serve_forever()

if __name__ == '__main__':
    run()
