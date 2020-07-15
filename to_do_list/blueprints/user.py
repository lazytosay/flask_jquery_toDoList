from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from to_do_list.models import User, Task
from to_do_list.extensions import db

user_bp = Blueprint('user', __name__)


@user_bp.route('/')
def ground():
    return render_template('ground.html')

@user_bp.route('/intro')
def intro():
    return render_template('_intro.html')

@user_bp.route('/index')
@login_required
def index():
    all_count = Task.query.with_parent(current_user).count()
    active_count = Task.query.with_parent(current_user).filter_by(done=False).count()
    completed_count = Task.query.with_parent(current_user).filter_by(done=True).count()
    return render_template('_index.html', tasks=current_user.to_do_list, all_count=all_count,
                           active_count=active_count, completed_count=completed_count)


@user_bp.route('/task/new', methods=['POST'])
@login_required
def task_new():
    data = request.get_json()
    if data is None or data['body'].strip() == '':
        return jsonify(message='invalid task body...'), 400

    task = Task(body=data['body'], author=current_user._get_current_object())
    db.session.add(task)
    db.session.commit()
    return jsonify(html=render_template('_task.html', task=task), message="+1")

@user_bp.route('/item/edit/<int:task_id>', methods=['PUT'])
@login_required
def task_edit(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user != task.author:
        return jsonify(message='permission denied...'), 403

    data = request.get_json()
    if data is None or data['body'].strip() == '':
        return jsonify(message='invalid task body...'), 400

    task.body = data['body']
    db.session.commit()
    return jsonify(message='task updated...')

@user_bp.route('/task/toggle/<int:task_id>', methods=['PATCH'])
@login_required
def task_toggle(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user != task.author:
        return jsonify(message='permission denied...'), 403

    task.done = not task.done
    db.session.commit()
    return jsonify(message='task toggled...')



@user_bp.route('/task/delete/<int:task_id>', methods=['DELETE'])
@login_required
def task_delete(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user != task.author:
        return jsonify(message='permission denied...'), 403
    db.session.delete(task)
    db.session.commit()
    return jsonify(message='delete success')

