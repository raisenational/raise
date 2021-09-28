import { AWS } from '@serverless/typescript';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const allowedMethods = ['get', 'post', 'put', 'delete'];

const camelCase = (s: string): string => s.replace(/\/([a-zA-Z])/g, (g) => g[1].toUpperCase())

const recursivelyFindFunctionsIn = (basePath: string, path: string = basePath): AWS['functions'] => {
  const result: AWS['functions'] = {};
  const files = readdirSync(path, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      if (file.name.startsWith('_')) continue;

      const method = file.name.slice(0, file.name.lastIndexOf('.'));
      if (!allowedMethods.includes(method)) {
        throw new Error('Unexpected method ' + method + ' at path ' + path + ' found when scanning for functions');
      }

      const relativePath = ((path + '/').slice(basePath.length + 1) + method);

      result[camelCase(relativePath)] = {
        handler: 'src/functions/' + relativePath + '.main',
        events: [
          {
            httpApi: {
              method,
              path: path.slice(basePath.length)
            }
          }
        ]
      }
    } else if (file.isDirectory()) {
      Object.assign(result, recursivelyFindFunctionsIn(basePath, resolve(path, file.name)));
    } else {
      throw new Error('Unexpected file ' + file.name + ' at path ' + path + ' found when scanning for functions');
    }
  }
  return result;
}

const functions = recursivelyFindFunctionsIn(resolve(__dirname, 'src', 'functions'));

const serverlessConfiguration: AWS = {
  service: 'raise-server',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: [
          'aws-sdk'
        ]
      },
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
  },
  functions
};

module.exports = serverlessConfiguration;
