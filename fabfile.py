from fabric.api import cd, run
from fabric.decorators import task
from fabric.state import env

env.user = 'root'


@task
def deploy(branch='master'):
    """
    Usage fab deploy:<branch>
    """
    with cd('/puppet/'):
        #run('git fetch && git reset --hard origin/%s' % branch)
        #run('puppet apply manifests/site.pp')
        run('echo "yeah"')


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
