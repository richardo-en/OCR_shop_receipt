from pyupdater.client import Config

class MyConfig(Config):
    # Unique app name
    APP_NAME = 'MyOCRApp'
    
    # Version of the app
    APP_VERSION = '1.0.0'
    
    # Base URL where updates are hosted
    UPDATE_URLS = ['https://example.com/myocrapp/updates/']

    # Optional: Use GitHub Releases
    # UPDATE_URLS = ['https://github.com/yourusername/MyOCRApp/releases/latest']
