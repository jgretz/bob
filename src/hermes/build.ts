import * as shell from 'shelljs';
import * as packageJson from '../../../home/web/hermes/package.json';

const SOURCE = '~/Development/Gretz/home/web/hermes';
const RESULT_ROOT = '~/Development/Gretz/bob';
const RESULT_TARGET = './hermes-lib';

// clean
function clean(): void {
  shell.echo('Cleaning ...');
  shell.rm('-rf', RESULT_TARGET);
  shell.mkdir(RESULT_TARGET);
}

// build hermes
function buildHermes(): Promise<void> {
  shell.echo('Building hermes ...');
  return new Promise((resolve) => {
    shell.cd(SOURCE);

    shell.exec('yarn', () => {
      shell.exec('yarn build', () => {
        shell.cd(RESULT_ROOT);

        shell.mv(`${SOURCE}/dist/*`, RESULT_TARGET);
        shell.rm('-rf', `${SOURCE}/dist/*`);

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

// main
async function main(): Promise<void> {
  clean();

  await buildHermes();
  movePackageJson();

  console.log('Build Complete');
}

main();
