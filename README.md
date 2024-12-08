# Node.js Full Stack Engineering Test

This project demonstrates different Node.js server implementations using various programming patterns: callbacks, async/await, promises, and streams. Each server fetches the HTML title of given websites and returns them in a formatted HTML response.

## Server Implementations

- **Callback-based Server**: Uses native and raw Node.js callback pattern for asynchronous operations.
- **Async/Await Server**: Uses `async.js` flow library for handling asynchronous operations.
- **Promise-based Server**: Uses `RSVP` promise for handling asynchronous operations.
- **Stream-based Server**: Uses `RxJs` stream module to handle streaming data.

All implementations also use the `dotenv` library to load environment variables.

## Setup

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd node.js-test
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:
    ```
    PORT=5000
    REQUEST_TIMEOUT=5000
    ```

## Running the Servers

To start the server using a selection menu:
```sh
npm start
```

## API Endpoints

### Fetch Website Titles

- **URL**: `/I/want/title`
- **Method**: `GET`
- **Query Parameters**:
  - `address`: One or more website addresses to fetch titles from.

#### Example Request

```sh
curl "http://localhost:5000/I/want/title?address=example.com&address=example.org"
```

#### Example Response

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Titles</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; color: #333; }
        h1 { color: #444; }
        ul { list-style-type: none; padding: 0; }
        li { background: #fff; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Following are the titles of the given websites:</h1>
    <ul>
        <li>example.com - "Example Domain"</li>
        <li>example.org - "Example Domain"</li>
    </ul>
</body>
</html>
```
#### Thank you for considering my application.
