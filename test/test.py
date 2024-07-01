import requests
import json

# Function to send main settings
def send_main_settings():
    url = 'http://localhost:5000/mainsettings'
    settings = {
        "main_settings": {
            "devicePath": "/home/richard/Desktop/testing",
            "webcamIp": "http://10.10.10.91:8080/video",
            "dataPath": "/home/richard/Desktop/testing"
        }
    }
    try:
        response = requests.post(url, json=settings)
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Main Settings Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending main settings:', e)

# Function to send image preprocessing settings
def send_image_preprocessing_settings():
    url = 'http://localhost:5000/image_preprocessing_settings'
    preprocessing_settings = [
        {'checked': True, 'ranges': ['0', '30']}, 
        {'checked': False, 'ranges': []}, 
        {'checked': False, 'ranges': []}, 
        {'checked': False, 'ranges': []}, 
        {'checked': False, 'ranges': []}, 
        {'checked': False, 'ranges': []}, 
        {'checked': True, 'ranges': ['0', '255', '2']}
    ]
    try:
        response = requests.post(url, json={"image_preprocessing_settings": preprocessing_settings})
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Image Preprocessing Settings Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending image preprocessing settings:', e)

# Function to send capture request
def init_camera():
    url = 'http://localhost:5000/init_camera'

    try:
        response = requests.post(url)
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Capture Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending capture request:', e)
        
def send_capture_request():
    url = 'http://localhost:5000/capture'
    capture_data = {
        "row_number": "0"
    }
    try:
        response = requests.post(url, json=capture_data)
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Capture Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending capture request:', e)
        
def crete_excel():
    url = 'http://localhost:5000/manageexcel/create'
    capture_data = {
        "file_name": "ahahah"
    }
    try:
        response = requests.post(url, json=capture_data)
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Capture Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending capture request:', e)
        
def capture_image_preprocessing():
    url = 'http://localhost:5000/preprocessing/capture'
    try:
        response = requests.post(url)
        response.raise_for_status()  # Raise an exception for non-2xx responses
        print('Capture Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error sending capture request:', e)

# Main function to run the example
def main():
    # send_main_settings()
    # send_image_preprocessing_settings()
    init_camera()
    # crete_excel()
    # capture_image_preprocessing()
    # send_capture_request()

if __name__ == "__main__":
    main()
