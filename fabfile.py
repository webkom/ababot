from fabric.api import cd, run
from fabric.decorators import task
from fabric.state import env

env.user = 'root'


@task
def deploy_puppet(branch='master'):
    """
    Usage fab deploy_puppet:<branch>
    """
    with cd('/puppet/'):
        run('git fetch && git reset --hard origin/%s' % branch)
        run('puppet apply manifests/site.pp')

@task
def deploy_django(project='nerd', branch='master'):
    """
    fab deploy_django:<branch>
    """
    env.user = 'webkom'
    with cd('/home/webkom/webapps/%s/' % project):
        run('git fetch && git reset --hard origin/%s' % branch)
        run('venv/bin/pip install -r requirements.txt')
        run('venv/bin/python manage.py syncdb --noinput --migrate')
        run('sudo touch /etc/uwsgi/apps-enabled/%s.ini' % project)

@task
def node(name):
    if name == 'all':
        env.hosts = [
            'luke.abakus.no',
            'leia.abakus.no',
            'vader.abakus.no',
            'jarjar.abakus.no',
            'yoda.abakus.no',
            'tits.abakus.no',
        ]
    else:
        env.hosts = ['%s.abakus.no' % name]
