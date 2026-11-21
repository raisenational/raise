// Uploads the built website to S3 after `serverless deploy`.
//
// Replaces the serverless-s3-sync plugin, which (like its forks) relies on AWS SDK v2
// APIs that osls v4 removed. It uses the same `custom.s3Sync` config format, for the
// subset of options we use:
//   custom.s3Sync: [{bucketName, localDir, params: [{'glob': {CacheControl: '...'}}]}]
//
// For each bucket it uploads new or changed files (setting Content-Type and any matching
// params), and deletes objects that no longer exist locally.

const {createHash} = require('node:crypto');
const {readFile, readdir} = require('node:fs/promises');
const path = require('node:path');
const {
	S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const {minimatch} = require('minimatch');

const UPLOAD_CONCURRENCY = 16;

const listLocalFiles = async (dir) => {
	const entries = await readdir(dir, {recursive: true, withFileTypes: true});
	return entries
		.filter((e) => e.isFile())
		.map((e) => path.relative(dir, path.join(e.parentPath, e.name)).split(path.sep).join('/'));
};

const listRemoteObjects = async (s3, bucket) => {
	const etags = new Map();
	let ContinuationToken;
	do {
		// eslint-disable-next-line no-await-in-loop
		const res = await s3.send(new ListObjectsV2Command({Bucket: bucket, ContinuationToken}));
		for (const obj of res.Contents ?? []) {
			etags.set(obj.Key, obj.ETag?.replaceAll('"', ''));
		}

		ContinuationToken = res.NextContinuationToken;
	} while (ContinuationToken);

	return etags;
};

const runWithConcurrency = async (items, limit, fn) => {
	const queue = [...items];
	await Promise.all(Array.from({length: Math.min(limit, queue.length)}, async () => {
		while (queue.length > 0) {
			// eslint-disable-next-line no-await-in-loop
			await fn(queue.shift());
		}
	}));
};

class S3SyncPlugin {
	constructor(serverless, _options, {log}) {
		this.serverless = serverless;
		this.log = log;
		this.hooks = {
			'after:deploy:deploy': async () => this.sync(),
		};
	}

	async sync() {
		const configs = this.serverless.service.custom?.s3Sync ?? [];
		const provider = this.serverless.getProvider('aws');
		const s3 = new S3Client(await provider.getAwsSdkV3Config());
		const {default: mime} = await import('mime');

		for (const {bucketName, localDir, params = []} of configs) {
			const dir = path.resolve(this.serverless.serviceDir, localDir);
			// eslint-disable-next-line no-await-in-loop
			const [localFiles, remote] = await Promise.all([listLocalFiles(dir), listRemoteObjects(s3, bucketName)]);

			let uploaded = 0;
			// eslint-disable-next-line no-await-in-loop
			await runWithConcurrency(localFiles, UPLOAD_CONCURRENCY, async (key) => {
				const body = await readFile(path.join(dir, key));
				const md5 = createHash('md5').update(body).digest('hex');
				if (remote.get(key) === md5) {
					return;
				}

				const extraParams = Object.assign({}, ...params.flatMap((p) => Object.entries(p))
					.filter(([glob]) => minimatch(key, glob, {dot: true}))
					.map(([, value]) => value));
				await s3.send(new PutObjectCommand({
					Bucket: bucketName,
					Key: key,
					Body: body,
					ContentType: mime.getType(key) ?? 'application/octet-stream',
					...extraParams,
				}));
				uploaded++;
			});

			const localSet = new Set(localFiles);
			const toDelete = [...remote.keys()].filter((key) => !localSet.has(key));
			for (let i = 0; i < toDelete.length; i += 1000) {
				// eslint-disable-next-line no-await-in-loop
				await s3.send(new DeleteObjectsCommand({
					Bucket: bucketName,
					Delete: {Objects: toDelete.slice(i, i + 1000).map((Key) => ({Key}))},
				}));
			}

			this.log.notice(`s3-sync: ${bucketName}: uploaded ${uploaded}, unchanged ${localFiles.length - uploaded}, deleted ${toDelete.length}`);
		}
	}
}

module.exports = S3SyncPlugin;
