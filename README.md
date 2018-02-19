## FastBoot Bitbucket Downloader

This downloader for the [FastBoot App Server][app-server] works with Bitbucket
Builds to download and unzip the latest build artifacts of your deployed
application.

[app-server]: https://github.com/ember-fastboot/fastboot-app-server

To use the downloader, configure it with your Bitbucket API token (App Password) and your repo:

```js
const FastBootAppServer = require('fastboot-app-server');
const BitbucketDownloader  = require('fastboot-bitbucket-downloader');

let downloader = new BitbucketDownloader({
  url:      'https://bitbucket.com',        // Bitbucket host e.g self hosted, defaults to https://bitbucket.com
  token:    '1_A23CtFvGnsgdqwLPYZ',         // your Bitbucket private token
  repo:     'my-app/ember.js',              // name of your repo
  branch:   'master',                       // optional, defaults to 'master'
  job:      'build',                        // optional, defaults to 'build'
  path:     'dist'                          // optional path of the `dist` directory, defaults to 'dist'
});

let server = new FastBootAppServer({
  downloader: downloader
});
```

When the downloader runs, it will download the zipped artifacts for the most recent build for the specified repo and branch.

If you like this, you may also be interested in the companion [fastboot-bitbucket-notifier](https://github.com/campus-discounts/fastboot-bitbucket-notifier).
