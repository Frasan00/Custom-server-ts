# Custom-server-ts

- This project has an TCP/IP Server created with the net module
- Those servers establish a TCP/IP connection with and create a socket for each client that connects

## HTTP SERVER

- The HTTP server accepts HTTP request and works in a "express"-like way where you can enstablish endpoint and handlers
- This server checks for the income data and validates it, then if it's valid, It gives a response back based on the configuration of the server
- For now the server lacks some features: only few types of body can be parsed and the initial check doesn't valid if the body is coherent with the content-type