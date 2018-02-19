"use strict";

const request   = require('request');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');
const fsp   = require('fs-promise');
const exec  = require('child_process').exec;

function AppNotFoundError(message) {
  let error = new Error(message);
  error.name = 'AppNotFoundError';

  return error;
}

/*
 * Downloader class that downloads the latest Ember build artifacts from Bitbucket and unzips it.
 */
class BitbucketDownloader {
  constructor(options) {
    this.ui = options.ui;

    this.url = options.url || 'https://api.bitbucket.org';
    this.username = options.username;
    this.password = options.password;
    this.filename = options.filename;

    this.repo = options.repo;
    this.outputPath = options.path || 'dist';

    let url = this.url;
    let repo = this.repo;
    let filename = this.filename;

    this.fileUrl = url + '/2.0/repositories/' + repo + '/downloads/' + filename;
  }

  download() {
    let addon = this;

    if (!addon.repo) {
      addon.ui.writeError('no repo provided; not downloading app');
      return Promise.reject(new AppNotFoundError());
    }

    if (!addon.username || !addon.password) {
      addon.ui.writeError('no username or password provided; not downloading app');
      return Promise.reject(new AppNotFoundError());
    }

    return addon.fetchCurrentBuild()
      .then(() => addon.removeOldApp())
      .then(() => addon.downloadAppZip())
      .then(() => addon.unzipApp())
      .then(() => addon.installNPMDependencies())
      .then(() => addon.outputPath);
  }

  removeOldApp() {
    let addon = this;

    this.ui.writeLine('removing ' + this.outputPath);
    return fsp.remove(this.outputPath);
  }

  fetchCurrentBuild() {
    let addon = this;

    let fileUrl = addon.fileUrl;
    let username = addon.username;
    let password = addon.password;

    let options = {
        method: 'GET', // Would prefer a Head request but they are not supported
        uri: fileUrl,
        auth: {
            user: username,
            pass: password,
            sendImmediately: true
        }
    };

    addon.ui.writeLine('domain     : ' + addon.url);
    addon.ui.writeLine('repository : ' + addon.repo);
    addon.ui.writeLine('filename   : ' + addon.filename);

    return new Promise((res, rej) => {
        request(options)
        .on('response', function(response) {
            let filename,
                contentDisp = response.headers['content-disposition'];
            if (contentDisp && /^attachment/i.test(contentDisp)) {
                filename = contentDisp.toLowerCase()
                    .split('filename=')[1]
                    .split(';')[0]
                    .replace(/"/g, '');
            }

            if(!filename){
                addon.ui.writeError('Did Not Find Zip File, Download Aborted.');
                rej(new AppNotFoundError());
            } else {
                addon.ui.writeLine('Found Zip File : ' + filename);
                addon.zipPath = path.basename(filename);

                res();
            }
        })
        .on('error', function(error) {
            console.log('error:', error); // Print the error if one occurred
            addon.ui.writeError('could not fetch repo build artifact');
            rej(new AppNotFoundError());
        });
    });
  }

  downloadAppZip() {
    let addon = this;

    let fileUrl = addon.fileUrl;
    let username = addon.username;
    let password = addon.password;

    let options = {
        method: 'GET',
        uri: fileUrl,
        auth: {
            user: username,
            pass: password,
            sendImmediately: true
        }
    };

    return new Promise((res, rej) => {
        let r = request(options).on('response', function(response) {
            let zipPath = addon.zipPath;
            let file = fs.createWriteStream(zipPath);

            addon.ui.writeLine("saving zip object to " + zipPath);

            r.pipe(file)
                .on('close', res)
                .on('error', rej);
        });
    });
  }

  unzipApp() {
    let addon = this;

    let zipPath = addon.zipPath;

    return addon.exec('unzip ' + zipPath)
      .then(() => {
        addon.ui.writeLine("unzipped " + zipPath);
      });
  }

  installNPMDependencies() {
    let addon = this;

    return addon.exec(`cd ${addon.outputPath} && yarn install`)
      .then(() => addon.ui.writeLine('installed npm dependencies via yarn'))
      .catch(() => addon.ui.writeError('unable to install npm dependencies via yarn'));
  }

  exec(command) {
    let addon = this;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          addon.ui.writeError(`error running command ${command}`);
          addon.ui.writeError(stderr);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = BitbucketDownloader;
