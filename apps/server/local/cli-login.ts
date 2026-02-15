import * as http from 'http';
import {exec} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import env from '../src/env/env';

const REDIRECT_URI = 'http://localhost:8000/admin/oauth-callback';
const AUTH_FILE = path.resolve(__dirname, '../../../.raise-auth.json');
const PROD_API_BASE_URL = 'https://ij2n9itvq1.execute-api.eu-west-1.amazonaws.com';
const API_BASE_URL = process.argv[2] ?? PROD_API_BASE_URL;

const GOOGLE_AUTH_URL = (() => {
	const params = new URLSearchParams({
		client_id: env.GOOGLE_LOGIN_CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: 'id_token',
		scope: 'email profile openid https://www.googleapis.com/auth/userinfo.profile',
		nonce: crypto.randomBytes(16).toString('hex'),
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
})();

const CALLBACK_HTML = `<!DOCTYPE html>
<html><body>
<p>Logging in...</p>
<script>
const fragment = window.location.hash.substring(1);
const params = new URLSearchParams(fragment);
const idToken = params.get('id_token');
if (idToken) {
	fetch('/admin/oauth-callback', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({idToken}),
	}).then(r => r.json()).then(data => {
		if (data.ok) {
			document.body.innerHTML = '<p>Login successful! You can close this tab.</p>';
		} else {
			document.body.innerHTML = '<p>Login failed: ' + (data.error || 'unknown error') + '</p>';
		}
	}).catch(err => {
		document.body.innerHTML = '<p>Login failed: ' + err.message + '</p>';
	});
} else {
	document.body.innerHTML = '<p>No id_token found in redirect. Check the Google OAuth configuration.</p>';
}
</script>
</body></html>`;

const server = http.createServer(async (req, res) => {
	if (req.method === 'GET' && req.url?.startsWith('/admin/oauth-callback')) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(CALLBACK_HTML);
		return;
	}

	if (req.method === 'POST' && req.url === '/admin/oauth-callback') {
		const body = await new Promise<string>((resolve) => {
			let data = '';
			req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
			req.on('end', () => { resolve(data); });
		});

		try {
			const {idToken} = JSON.parse(body) as {idToken: string};

			// Exchange Google id_token for Raise JWT tokens
			const apiRes = await fetch(`${API_BASE_URL}/admin/login/google`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({idToken}),
			});

			if (!apiRes.ok) {
				const err = await apiRes.text();
				throw new Error(`API returned ${apiRes.status}: ${err}`);
			}

			const tokens = await apiRes.json();
			fs.writeFileSync(AUTH_FILE, JSON.stringify(tokens, null, 2));

			console.log(`Tokens saved to ${AUTH_FILE}`);
			console.log(`Access token expires at: ${new Date((tokens as any).accessToken.expiresAt * 1000).toISOString()}`);
			console.log(`Refresh token expires at: ${new Date((tokens as any).refreshToken.expiresAt * 1000).toISOString()}`);

			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify({ok: true}));
		} catch (err: any) {
			console.error('Login failed:', err.message);
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify({ok: false, error: err.message}));
		}

		// Shut down after handling the login
		setTimeout(() => {
			server.close();
			process.exit(0);
		}, 500);
		return;
	}

	res.writeHead(404);
	res.end('Not found');
});

server.listen(8000, () => {
	console.log(`Opening Google login... (redirect URI: ${REDIRECT_URI})`);
	console.log(`API base URL: ${API_BASE_URL}`);
	exec(`open "${GOOGLE_AUTH_URL}"`);
});
