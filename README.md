## Project Structure

live-poll-battle/
├── client/       
│   ├── public/
│   └── src/
│       ├── components/ 
│       ├── App.js      
│       ├── index.js    
│       └── ...
├── server/        
│   ├── server.js   
│   └── package.json
└── README.md


## Setup Instructions

**Prerequisites:**
* Node.js (v14 or later recommended) and npm
* Git

**1. Clone the Repository:**
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
   cd live-poll-battle

**2.. Setup Backend:**
    cd server
    npm install
    npm start
    The backend server will start on http://localhost:3001.

**3. Setup Frontend:**
    cd client
    npm install
    npm start
    The frontend React application will start on http://localhost:3000 and open in your default browser.

**4. Usage:**
    Open http://localhost:3000 in your browser.
    Enter your name.
    Either create a new room or join an existing room using its code.
    To test with multiple users, open the application in multiple browser tabs or windows