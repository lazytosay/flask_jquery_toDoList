from flask import Blueprint, render_template, redirect, url_for, jsonify, request
from to_do_list.models import User, Task
from to_do_list.extensions import db
from faker import Faker
from flask_login import current_user, login_user, logout_user, login_required

auth_bp = Blueprint('auth', __name__)

fake = Faker()


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('user.index'))

    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()
        if user is not None and user.validate_password(password):
            login_user(user)
            return jsonify(messgae='success')
        return jsonify(message='invalid username'), 400

    return render_template('_login.html')


@auth_bp.route('/register')
def register():
    username = fake.user_name()

    while User.query.filter_by(username=username).first() is not None:
        username = fake.user_name()

    print("-----username: ", username)
    password = fake.word()
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    task_one = Task(body=fake.sentence(), author=user)
    task_two = Task(body=fake.sentence(), author=user)
    task_three = Task(body=fake.sentence(), done=True, author=user)
    task_four = Task(body=fake.sentence(), author=user)

    db.session.add(task_one)
    db.session.add(task_two)
    db.session.add(task_three)
    db.session.add(task_four)
    db.session.commit()




    return jsonify(username=username, password=password)
