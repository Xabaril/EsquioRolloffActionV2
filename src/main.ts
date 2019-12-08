import * as core from '@actions/core';
import url =  require('url'); 
const https = require('https');

async function run() {
  try {
    const esquioUrl = core.getInput('esquioUrl');
    const esquioApiKey = core.getInput('esquioApiKey');
    const productName = core.getInput('productName');
    const featureName = core.getInput('featureName');

    await rollOffFeature(url.parse(esquioUrl), esquioApiKey, productName, featureName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function rollOffFeature(esquioUrl: url.UrlWithStringQuery, esquioApiKey: string, productName: string, featureName: string) {
  const options = {
      hostname: esquioUrl.host,
      path: `/api/products/${productName}/features/${featureName}/rollback`,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'x-api-key': esquioApiKey
      }
  }
  console.log(`url to call ${esquioUrl.host} ${options.path}`);
  const req = https.request(options, (res: any) => {
      if (res.statusCode === 200) {
          console.log('Feature rolloff succesful');
      }

      res.on('data', (data: any) => {
          if (res.statusCode != 200) {
              const responseData = JSON.parse(data);
              core.setFailed(`Error in feature rolloff ${responseData.detail} HttpCode: ${res.statusCode}`);
          }
      });
  });
  req.on('error', (error: any) => {
    core.setFailed(error);
  });

  req.end();
}

run();
