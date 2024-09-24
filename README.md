# WhatsApp Sales Bot Service

This Node.js WhatsApp service allows users to communicate with a bot to save their sales records and ask about them using AI. The bot is designed to enhance sales tracking and provide insights through simple text commands.

## Features

- Save sales transactions via WhatsApp chat.
- Retrieve sales information using AI-powered queries.


## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A WhatsApp account
- [WhatsApp Web API](https://github.com/pedroslopez/whatsapp-web.js) library

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omryzw/realapps-sales-app
   cd realapps-sales-app
   ```
2.  Install Dependencies
   ```bash
   npm install
   ```
3. Set up .env file
4. Run the service
   ```bash
   node index.js
   ```
5. Scan the QR Code - After running the service, a QR code will be displayed in the terminal. Use the WhatsApp app on your phone to scan the QR code and log in to the bot service.
6. Start Chatting - Once logged in, you can start interacting with the bot through WhatsApp by sending messages to record and retrieve sales data.

## Example Messages :
   
   Save a sale -> "Rice for $20", "Rice 20" , "car 28000"
   Asking about your sales -> first send the message "ask" followed by question like : What were my sales for the last week? The AI will process the request and return relevant sales data.

## Contributing 

Feel free to contribute by creating pull requests, reporting issues, or suggesting improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
