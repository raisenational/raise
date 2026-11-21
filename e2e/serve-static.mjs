// Minimal static file server for the exported website (apps/web/dist/raise), so the
// e2e tests run against the same build output we deploy rather than `next dev`.
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';

const root = process.argv[2];
const port = Number(process.argv[3] ?? 8000);
const types = {
	'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
	'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
	'.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain',
};

createServer(async (req, res) => {
	const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
	let file = join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
	try {
		if ((await stat(file)).isDirectory()) {
			file = join(file, 'index.html');
		}

		res.writeHead(200, {'content-type': types[extname(file)] ?? 'application/octet-stream'});
		res.end(await readFile(file));
	} catch {
		res.writeHead(404, {'content-type': 'text/html'});
		res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
	}
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
