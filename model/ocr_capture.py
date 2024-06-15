import cv2, easyocr, sys, json, os, csv
from manage_excel import load_settings
from image_preprocessing import preprocess_image
from matplotlib import pyplot as plt

# import matplotlib.pyplot as plt

# Initialize EasyOCR reader
reader = easyocr.Reader(['sk', 'en'],
                        gpu=True,
                        quantize=True)

# Function to capture an image, perform OCR, and print the extracted text
def capture_frames(cam):
    # ret, frame = cam.read()
    
    # if not ret:
    #     return False
    # cam.release()
    frame = cv2.imread('processed_data.png')
    
        
    preprocessed_image = preprocess_image(frame)
    # preprocessed_image = frame
    # cv2.imwrite("nieco.png", preprocessed_image)
    #show image
    # plt.imshow(preprocessed_image)
    # plt.axis('off')  # Vypnutie osí
    # plt.show()
    
    text = perform_ocr(frame)
    if text:
        # Extract float values
        floats = extract_floats(text)
        if floats != False:
            return [floats, preprocessed_image, text]
    else:
        return False
    

# Function to perform OCR on an image
def perform_ocr(image):
    try:
        # Preprocess the image
        # processed_image = preprocess_image(image)
        
        # Perform OCR on the preprocessed image
        text = reader.readtext(image, detail = 0)
        text = ' '.join(text)
        
        return text
    except Exception as e:
        # print("Error performing OCR:", e)
        return False


def trim_text(text):
    text_upper = text.upper()
    
    start_substrings = ["DPH", "DPH:", "DPF", "DPF:"]
    end_substrings = ["SPOLU", "SPOLU:", "SPO_U", "SPO_U:"]
    
    # Find the starting index
    start_index = -1
    for substr in start_substrings:
        start_index = text_upper.find(substr)
        if start_index != -1:
            break
    
    # Find the ending index
    end_index = -1
    for substr in end_substrings:
        end_index = text_upper.find(substr, start_index)
        if end_index != -1:
            break
        
    
    if start_index != -1 and end_index != -1:
        return text[start_index:end_index]
    else:
        # print("Failed to find 'DPH' or 'SPOLU' in the text.")
        return False


# Function to extract float values based on known patterns
def extract_floats(text):
    import re

    # Define the pattern to look for numbers in the specified format
    pattern = r'\d+,\d{2}'
    text = trim_text(text)
    if text == False:
        return False
    # Find all matches
    matches = re.findall(pattern, text)
    
    floats = []
    for match in matches:
        try:
            # Convert the match to a float
            value = float(match.replace(',', '.'))
            floats.append(value)
        except ValueError:
            continue

    return floats
    
# Create folder for backuping data (This data will be later used for ml training)
def create_folder(image_name, image, folder_name):
    _, _, folder_path = load_settings()
    folder_path = os.path.join(folder_path, folder_name) 
    images_path = os.path.join(folder_path, "images")
    image_save = os.path.join(images_path, image_name)
    if not os.path.exists(folder_path):
        try:
            os.makedirs(folder_path)
            os.makedirs(images_path)
        except Exception as e:
            return False
    cv2.imwrite(image_save, image)
    return True

#Csv file for capturing extracted date...later used for ml training 
def write_to_csv(folder_name, img_name, extracted_text, floats, row_number):
    excel_path, webcam_ip, folder_path = load_settings()
    folder_path = os.path.join(folder_path, folder_name) 
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

# Main function
def main():
    # Create the Tkinter GUI
    if len(sys.argv) < 4:
        sys.exit(1)
    if sys.argv[1] == "capture":
        image_name = f'{sys.argv[2]}_data_{sys.argv[3]}.png'
        excel_path, webcam, folder_path = load_settings()
        
        # if len(webcam) == 1:
        #     cam = cv2.VideoCapture(int(webcam))
        # else:
        #     cam = cv2.VideoCapture(webcam)
        cam = None
        for i in range(3):
            result = capture_frames(cam)
            print(result)
            if(result != False and result != None):
                if(len(result[0]) % 2 == 0 ): #and not create_folder(image_name, result[1], sys.argv[2])
                    print(json.dumps(None))
                    return
                print(json.dumps(result[0]))
                write_to_csv(sys.argv[2], image_name, result[2], result[0], int(sys.argv[3]))
                return
        print(json.dumps(None))

# Execute the main function
if __name__ == "__main__":
    main()
