const http = require('http');
const https = require('https');
const url = require('url');
const dotenv = require('dotenv');
const RSVP = require('rsvp');

dotenv.config();

const PORT = process.env.PORT || 5000;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT, 10) || 5000;

function fetchWebsite(address) {
    return new RSVP.Promise((resolve, reject) => {
        const normalizedUrl = address.startsWith('http') ? address : `http://${address}`;
        const protocol = normalizedUrl.startsWith('https') ? https : http;

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        };

        const req = protocol.get(normalizedUrl, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchWebsite(res.headers.location)
                    .then(resolve)
                    .catch(reject);
            }

            if (res.statusCode !== 200) {
                return resolve(`${address} - NO RESPONSE (Status Code: ${res.statusCode})`);
            }

            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                const titleMatch = data.match(/<title>(.*?)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                    resolve(`${address} - "${titleMatch[1].trim()}"`);
                } else {
                    resolve(`${address} - NO RESPONSE (No Title Found)`);
                }
            });
        });

        req.on('error', () => resolve(`${address} - NO RESPONSE (Invalid URL)`));
        req.setTimeout(REQUEST_TIMEOUT, () => {
            req.destroy();
            resolve(`${address} - NO RESPONSE (Timeout)`);
        });
    });
}

function renderHTML(results) {
    const items = results
        .map((result) => `<li>${result}</li>`)
        .join('\n');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Website Titles</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f9;
                color: #333;
            }
            h1 {
                color: #444;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                background: #fff;
                margin: 10px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Following are the titles of the given websites:</h1>
        <ul>${items}</ul>
    </body>
    </html>`;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/I/want/title') {
        const queryAddresses = parsedUrl.query.address;
        
        const addresses = [...new Set(
            Array.isArray(queryAddresses)
                ? queryAddresses
                : [queryAddresses]
        )].filter(Boolean);

        if (addresses.length === 0) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>400 Bad Request</h1><p>No addresses provided.</p>');
            return;
        }

        const promises = addresses.map(address => fetchWebsite(address));

        RSVP.all(promises)
            .then(results => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(renderHTML(results));
            })
            .catch(error => {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>500 Internal Server Error</h1><p>${error.message}</p>`);
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});