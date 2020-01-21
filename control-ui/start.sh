#!/bin/sh

//! let port = (typeof server.port === "undefined") ? 3000 : server.port;

PORT="$${port}"

echo "starting server on port ${PORT}..."

echo "open http://localhost:${PORT} in your browser to view a (mock) control ui for \"$${robot.name}\"."

json-server --watch db.json --port ${PORT}
