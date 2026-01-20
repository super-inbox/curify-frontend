import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Twitter API Configuration
TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN')

# News API Configuration
NEWS_API_KEY = os.getenv('NEWS_API_KEY')

# YouTube API Configuration
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Database Configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', 'nano_banana.db')

# Application Settings
DEFAULT_CATEGORY = 'SOCIAL MEDIA POST'
DEFAULT_LIMIT = 20

# API Settings
API_PREFIX = "/api/v1"
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Logging Configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True
        },
    }
}
