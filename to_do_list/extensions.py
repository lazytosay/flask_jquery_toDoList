from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_login import LoginManager, current_user

db = SQLAlchemy()
csrf = CSRFProtect()

login_manager = LoginManager()
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    from to_do_list.models import User
    return User.query.get(int(user_id))