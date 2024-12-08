const http = require('http');
const https = require('https');
const url = require('url');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT, 10) || 5000;

// Created a function to fetch HTML from a website
function fetchWebsite(address, callback) {
    const normalizedUrl = address.startsWith('http') ? address : `http://${address}`;
    const protocol = normalizedUrl.startsWith('https') ? https : http;

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    };

    const req = protocol.get(normalizedUrl, options, (res) => {
        // Handle redirects (status codes 301, 302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return fetchWebsite(res.headers.location, callback);
        }

        if (res.statusCode !== 200) {
            return callback(`${address} - NO RESPONSE (Status Code: ${res.statusCode})`);
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
            const titleMatch = data.match(/<title>(.*?)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
                callback(null, `${address} - "${titleMatch[1].trim()}"`);
            } else {
                callback(null, `${address} - NO RESPONSE (No Title Found)`);
            }
        });
    });

    req.on('error', () => callback(`${address} - NO RESPONSE (Invalid URL)`));
    req.setTimeout(REQUEST_TIMEOUT, () => {
        req.destroy();
        callback(`${address} - NO RESPONSE (Timeout)`);
    });
}

// Created a function to render the HTML response
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

// Created the main server logic
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/I/want/title') {
        const queryAddresses = parsedUrl.query.address;

        // Ensure addresses are in an array and remove duplicates
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

        const results = [];
        let completed = 0;

        addresses.forEach((address) => {
            fetchWebsite(address, (err, result) => {
                if (err) {
                    results.push(err);
                } else {
                    results.push(result);
                }

                completed += 1;

                if (completed === addresses.length) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(renderHTML(results));
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});