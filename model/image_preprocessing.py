# image_preprocessing.py
import numpy as np
import cv2
import json
from PIL import Image

class ImagePreprocessing:
    def __init__(self, settings_object):
        self.settings = settings_object
        self.options = None

    def normalize_image(self, image, bottom_line, top_line):
        norm_img = np.zeros((image.shape[0], image.shape[1]))
        normalized_img = cv2.normalize(image, norm_img, bottom_line, top_line, cv2.NORM_MINMAX)
        return normalized_img

    def deskew(self, image):
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

    def set_image_dpi(self, image):
        im = Image.fromarray(image)
        length_x, width_y = im.size
        factor = min(1, float(1024.0 / length_x))
        size = int(factor * length_x), int(factor * width_y)
        im_resized = im.resize(size, Image.LANCZOS)
        return np.array(im_resized)

    def remove_noise(self, image, h, hr_color):
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return cv2.fastNlMeansDenoisingColored(image_rgb, None, h, hr_color, 7, 15)

    def thinning(self, image):
        kernel = np.ones((5, 5), np.uint8)
        erosion = cv2.erode(image, kernel, iterations=1)
        return erosion

    def get_grayscale(self, image):
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    def thresholding(self, image, thresh, maxval):
        return cv2.threshold(image, thresh, maxval, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    def enhance_black_lines(self, image, bottom, top, thickness):
        if len(image.shape) == 3 and image.shape[2] == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        _, thresh = cv2.threshold(gray, bottom, top, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = np.ones((thickness, thickness), np.uint8)
        dilate = cv2.dilate(thresh, kernel, iterations=1)
        return dilate

    def read_preprocessing_options(self):
        try:
            self.options = json.loads(self.settings.imagePreprocessingSettings)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON format")

    def preprocess_image(self, image):
        self.read_preprocessing_options()
        if self.options[0]['checked']:
            image = self.remove_noise(image, *map(int, json.loads(self.settings.imagePreprocessingSettings)[0]['ranges']))
        if self.options[1]['checked']:
            image = self.get_grayscale(image)
        if self.options[2]['checked']:
            image = self.thresholding(image, *map(int, json.loads(self.settings.imagePreprocessingSettings)[2]['ranges']))
        if self.options[4]['checked']:
            image = self.normalize_image(image, *map(int, json.loads(self.settings.imagePreprocessingSettings)[4]['ranges']))
        if self.options[5]['checked']:
            image = self.set_image_dpi(image)
        if self.options[6]['checked']:
            image = self.enhance_black_lines(image, *map(int, json.loads(self.settings.imagePreprocessingSettings)[6]['ranges']))
        return image