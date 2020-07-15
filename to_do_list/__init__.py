from to_do_list.extensions import db, csrf, login_manager
from to_do_list.settings import config
from to_do_list.blueprints.user import user_bp
from to_do_list.blueprints.auth import auth_bp
from to_do_list.models import User, Task
from flask_login import current_user
from flask import Flask
import click
import os

def create_app(config_name=None):

    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')


    app = Flask('to_do_list')
    app.config.from_object(config[config_name])

    init_extensions(app)
    init_blueprints(app)
    register_template_context(app)
    register_command(app)

    return app



def init_extensions(app):
    db.init_app(app)
    csrf.init_app(app)
    login_manager.init_app(app)

def init_blueprints(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)


def register_template_context(app):
    @app.context_processor
    def make_template_context():
        if current_user.is_authenticated:
            active_tasks = Task.query.with_parent(current_user).filter_by(done=False).count()
        else:
            active_tasks = None

        return dict(active_tasks=active_tasks)

def register_command(app):
    @app.cli.command()
    @click.option('--drop', is_flag=True, help='initialize database')
    def initdb(drop):
        if drop:
            click.confirm("This operation will drop all database table, are you sure? ", abort=True)
            db.drop_all()
            click.echo("dropped all tables...")
        db.create_all()
        click.echo("initlized database successful...")
