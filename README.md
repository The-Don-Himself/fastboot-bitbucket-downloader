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
  url:      'https://api.bitbucket.com',    // Bitbucket API host, defaults to https://api.bitbucket.com
  username: 'don_omondi',                   // your Bitbucket username
  password: '123456789Password',            // your Bitbucket app password
  repo:     'my-app/ember.js',              // name of your repo
  filename: 'dist.zip',                     // The download filename in your repo's downloads section
  path:     'dist'                          // optional path of the `dist` directory, defaults to 'dist'
});

let server = new FastBootAppServer({
  downloader: downloader
});
```

When the downloader runs, it will download the zipped artifacts for the most recent build for the specified repo and branch.

If you like this, you may also be interested in the companion [fastboot-bitbucket-notifier](https://github.com/campus-discounts/fastboot-bitbucket-notifier).
