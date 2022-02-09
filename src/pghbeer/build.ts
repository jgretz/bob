import * as shell from 'shelljs';
import * as packageJson from '../../../pghbeer/host/package.json';

const HOST_SOURCE = '~/Development/Gretz/pghbeer/host';
const CLIENT_SOURCE = '~/Development/Gretz/pghbeer/site';

const RESULT_ROOT = '~/Development/Gretz/bob';
const RESULT_TARGET = './pghbeer-lib';

// clean
function clean(): void {
  shell.echo('Cleaning ...');
  shell.rm('-rf', RESULT_TARGET);
  shell.mkdir(RESULT_TARGET);
}

// build host
function buildHost(): Promise<void> {
  shell.echo('Building pghbeer host ...');
  return new Promise((resolve) => {
    shell.cd(HOST_SOURCE);

    shell.exec('yarn', () => {
      shell.exec('yarn build', () => {
        shell.cd(RESULT_ROOT);

        shell.mv(`${HOST_SOURCE}/dist/*`, RESULT_TARGET);
        shell.rm('-rf', `${HOST_SOURCE}/dist/*`);

        resolve();
      });
    });
  });
}

// move package json
function movePackageJson(): void {
  const productionPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    license: packageJson.license,
    dependencies: packageJson.dependencies,

    scripts: {
      start: 'node main.js',
    },
  };

  const shellString = new shell.ShellString(JSON.stringify(productionPackageJson));
  shellString.to(`${RESULT_TARGET}/package.json`);
}

// build client
function buildClient(): Promise<void> {
  shell.echo('Building pghbeer client ...');
  return new Promise((resolve) => {
    shell.cd(CLIENT_SOURCE);

    shell.exec('yarn', () => {
      shell.exec('yarn build', () => {
        shell.cd(RESULT_ROOT);
        shell.mkdir(`${RESULT_TARGET}/app`);

        shell.mv(`${CLIENT_SOURCE}/lib/*`, `${RESULT_TARGET}/app`);
        shell.rm('-rf', `${CLIENT_SOURCE}/lib/*`);

        resolve();
      });
    });
  });
}

// main
async function main(): Promise<void> {
  clean();

  await buildHost();
  movePackageJson();
  await buildClient();

  console.log('Build Complete');
}

main();
