import numpy as np
import cv2, sys, os, json
from PIL import Image
from manage_excel import load_settings
# Function to normalize the image
def normalize_image(image, bottom_line, top_line):
    norm_img = np.zeros((image.shape[0], image.shape[1]))
    normalized_img = cv2.normalize(image, norm_img, bottom_line, top_line, cv2.NORM_MINMAX)
    return normalized_img

# Function to correct skew in the image
def deskew(image):
    co_ords = np.column_stack(np.where(image > 0))
    angle = cv2.minAreaRect(co_ords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

# Function to set image DPI for better OCR performance
def set_image_dpi(image):
    im = Image.fromarray(image)
    length_x, width_y = im.size
    factor = min(1, float(1024.0 / length_x))
    size = int(factor * length_x), int(factor * width_y)
    im_resized = im.resize(size, Image.LANCZOS)
    return np.array(im_resized)

# Function to remove noise from the image
def remove_noise(image, h, hr_color):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return cv2.fastNlMeansDenoisingColored(image_rgb, None, h, hr_color, 7, 15)

# Function to perform thinning and skeletonization on the image
def thinning(image):
    kernel = np.ones((5, 5), np.uint8)
    erosion = cv2.erode(image, kernel, iterations=1)
    return erosion

# Function to convert image to grayscale
def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Function to apply thresholding to the image
def thresholding(image, thresh, maxval):
    return cv2.threshold(image, thresh, maxval, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

def read_preprocessing_options(file_path):
    options = {}
    with open(file_path, 'r') as file:
        for index, line in enumerate(file):
            values = line.strip().split(',')
            options[index] = [int(value) for value in values]
    return options
    # return [
    #     (True, 5, 5),  # Noise removing
    #     (True, ),      # Grayscale
    #     (True, 127, 255),  # Thresholding
    #     (False, ),     # Unused
    #     (True, 1, 0),  # Normalizing
    #     (True, 300),   # Set Image DPI
    #     (False, 1, 2, 3)  # Enhance black lines
    # ]

def enhance_black_lines(image, bottom, top, thickness):
    # Check if the image is already in grayscale
    if len(image.shape) == 3 and image.shape[2] == 3:  # If the image has 3 channels
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image  # The image is already in grayscale

    _, thresh = cv2.threshold(gray, bottom, top, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    kernel = np.ones((thickness, thickness), np.uint8)
    dilate = cv2.dilate(thresh, kernel, iterations=1)
    return dilate

def preprocess_image(image):   
    options_file_path = 'image_preprocessing.txt'
    current_directory = os.path.dirname(os.path.abspath(__file__))
    settings_path = os.path.join(current_directory, f"../{options_file_path}")
    options = read_preprocessing_options(settings_path)
    if options[0][0]:  # Noise Removing
        image = remove_noise(image, options[0][1], options[0][2])
    if options[1][0]:  # Set Grayscale
        image = get_grayscale(image)
    if options[2][0]:  # Thresholding
        image = thresholding(image, options[2][1], options[2][2])
    # if options[3][0]:  # Deskew
    #   image = deskew(image)
    if options[4][0]:  # Normalizing
        image = normalize_image(image, options[4][1], options[4][2])
    if options[5][0]:  # Set Image Dpi
        image = set_image_dpi(image)
    if options[6][0]:  # Set Image Dpi
        image = enhance_black_lines(image, options[6][1], options[6][2], options[6][3])
    return image

def main():
    
    current_directory = os.path.dirname(os.path.abspath(__file__))
    not_proccesed_image = os.path.join(current_directory, "../not_preprocessed.png")
    
    if sys.argv[1] == "capture":
        excel_path, webcam, folder_path = load_settings()
        if len(webcam) == 1:
            cam = cv2.VideoCapture(int(webcam))
        else:
            try:
                cam = cv2.VideoCapture(f'{webcam}')
            except Exception as e:
                return print(json.dumps(e))
            
        ret, frame = cam.read()
        
        if not ret:
            return print(json.dumps(None))
        # cam.release()
        
        cv2.imwrite(not_proccesed_image, frame)
        sys.argv[1] = "update"
    
    if sys.argv[1] == "update":
        if(os.path.exists(not_proccesed_image)):
            image = cv2.imread(not_proccesed_image)
            preprocessed_image = preprocess_image(image)
            preprocess_image_path = os.path.join(current_directory, f"../processed_data.png")
            cv2.imwrite(preprocess_image_path, preprocessed_image)
        else:
            return print(json.dumps(None))
    elif sys.argv[1] == "preprocess":
        img_path = sys.argv[2]
        if os.path.exists(img_path):
            image = cv2.imread(img_path)
            preprocessed_image = preprocess_image(image)
            cv2.imwrite(img_path, preprocessed_image)
            return
    return print(json.dumps("continue"))

if __name__ == "__main__":
    main()

