# -*- coding: utf-8 -*-
import re

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
        run('librarian-puppet install')
        run('puppet apply manifests/site.pp')


@task
def test_puppet(branch='master'):
    """
    Usage fab test_puppet:<branch>
    """
    with cd('/puppet/'):
        run('git fetch && git reset --hard origin/%s' % branch)
        run('librarian-puppet install')
        run('puppet apply --noop manifests/site.pp')


@task
def deploy_project(project='nerd', branch='master'):
    """
    fab deploy_django:<branch>
    """
    env.user = 'webkom'
    with cd('/home/webkom/webapps/%s/' % project):

        old_revision = run('git rev-parse HEAD')
        run('git fetch && git reset --hard origin/%s' % branch)
        print list_commits(from_rev=old_revision, to_rev='HEAD')

        run('make update')
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


def list_commits(from_rev, to_rev):
    """
    Print a list of all commits made between from_rev and to_rev
    """

    return clean(run("git log %s..%s --no-merges --pretty=format:'%%h %%s (%%an)'" % (from_rev,
                                                                                      to_rev)))


def clean(content):
    """
    Terminal output can be very creative, somehow, let's remove escape stuff
    """
    return re.sub('[^\n\r]*', '', content).strip()
