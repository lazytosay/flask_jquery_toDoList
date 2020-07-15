import os

base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class BaseConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'a secret key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///'+os.path.join(base_dir, 'data.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False


config = {
    'development': BaseConfig,
    'production': BaseConfig,
}