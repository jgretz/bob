import * as shell from 'shelljs';
import * as packageJson from '../../../web/hermes/package.json';

const TARGET = './hermes-lib';
const SOURCE = '../web/hermes';
const RETURN = '../../tools';

// clean
function clean(): void {
  shell.echo('Cleaning ...');
  shell.rm('-rf', TARGET);
  shell.mkdir(TARGET);
}

// build hermes
function buildHermes(): Promise<void> {
  shell.echo('Building hermes ...');
  return new Promise((resolve) => {
    shell.cd(SOURCE);

    shell.exec('yarn', () => {
      shell.exec('yarn build', () => {
        shell.cd(RETURN);

        shell.mv(`${SOURCE}/dist/*`, TARGET);
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
  shellString.to(`${TARGET}/package.json`);
}

// main
async function main(): Promise<void> {
  clean();

  await buildHermes();
  movePackageJson();

  console.log('Build Complete');
}

main();
