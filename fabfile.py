from fabric.api import env, hosts, run, put, get, sudo, local, settings, cd
from fabric.contrib.files import exists
import os
import os.path

env.password = os.environ['YT_PASS']

PACKAGE_DIR = '__package'

def package():
    plugin_dir = os.path.dirname(__file__)
    plugin_name = os.path.basename(plugin_dir)
    tar_name = plugin_name + '.tar'

    if not os.path.isdir(PACKAGE_DIR):
        local(f'mkdir {PACKAGE_DIR}')

    local(f'cp -r dist {plugin_name}')
    local(f'tar cvzf {PACKAGE_DIR}/{tar_name} {plugin_name}')
    local(f'rm -rf {plugin_name}')

    return tar_name

@hosts([
    'YT@172.31.32.212'
])
def deploy_plugin(grafana_compose_path, grafana_service_name='grafana'):
    tar_name = package()

    put(f'{PACKAGE_DIR}/{tar_name}', f'{grafana_compose_path}/{tar_name}')
    with cd(f'{grafana_compose_path}'):
        run('pwd')
        run(f'tar xvzf {tar_name} -C {grafana_service_name}/plugins')
        sudo(f'docker-compose restart {grafana_service_name}')
        run(f'rm {tar_name}')

def test():
    print(os.environ['EC2DEV1'])