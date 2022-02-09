import * as shell from 'shelljs';
import * as fs from 'fs';
import axios from 'axios';

// run npm install
function removeYarnLock(source: string): void {
  shell.echo('Remove yarn.lock ...');
  shell.rm(`${source}/yarn.lock`);
}

// tar build output
function createTar(source: string, tarfile: string): Promise<void> {
  shell.echo('Creating Tar ...');
  return new Promise((resolve) => {
    shell.exec(`tar czfv ${tarfile} ${source}`, () => {
      resolve();
    });
  });
}

// create slug
async function createBuild(tarfile: string, herokuKey: string, herokuApp: string): Promise<void> {
  const heroku = axios.create({
    baseURL: 'https://api.heroku.com',
    headers: {
      Accept: 'application/vnd.heroku+json; version=3',
      Authorization: `Bearer ${herokuKey}`,
    },
  });

  return new Promise(async (resolve, reject) => {
    // create the source
    shell.echo('Creating Source ...');
    const sourceResponse = await heroku.post(`/apps/${herokuApp}/sources`);

    const {get_url, put_url} = sourceResponse.data.source_blob;

    // upload the file to the slug
    shell.echo('Uploading Tar File ...');
    const file = fs.readFileSync(tarfile);
    const fileResponse = await axios.put(put_url, file, {
      headers: {
        'Content-Type': '',
      },
    });

    // build from source
    shell.echo('Build ...');
    const buildResponse = await heroku.post(
      `/apps/${herokuApp}/builds`,
      {
        buildpacks: [
          {
            url: 'https://github.com/heroku/heroku-buildpack-nodejs#latest',
            name: 'heroku/nodejs',
          },
        ],
        source_blob: {
          url: get_url,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // we are done :)
    resolve();
  });
}

async function cleanUp(tarfile: string) {
  await shell.rm(tarfile);
}

// main loop
export async function deploy(
  source: string,
  tarfile: string,
  herokuKey: string,
  herokuApp: string,
): Promise<void> {
  await removeYarnLock(source);
  await createTar(source, tarfile);
  await createBuild(tarfile, herokuKey, herokuApp);
  await cleanUp(tarfile);
}
