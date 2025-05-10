const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); 

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001; 

let rooms = {};

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createRoom', ({ userName }) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            question: "Cats vs Dogs?", 
            options: {
                option1: { name: "Cats", votes: 0 },
                option2: { name: "Dogs", votes: 0 }
            },
            users: {}, 
            timer: 60,
            isActive: true,
            timerId: null
        };
        rooms[roomCode].users[socket.id] = userName;

        socket.join(roomCode); 
        socket.emit('roomCreated', { roomCode, roomState: rooms[roomCode] }); 
        console.log(`Room ${roomCode} created by <span class="math-inline">\{userName\} \(</span>{socket.id})`);

        startRoomTimer(roomCode);
    });

    socket.on('joinRoom', ({ roomCode, userName }) => {
        if (rooms[roomCode]) {
            if (!rooms[roomCode].isActive) {
                socket.emit('error', 'Voting in this room has ended.');
                return;
            }
            socket.join(roomCode);
            rooms[roomCode].users[socket.id] = userName;

            socket.to(roomCode).emit('userJoined', { userId: socket.id, userName });

            socket.emit('roomJoined', { roomCode, roomState: rooms[roomCode] });
            console.log(`<span class="math-inline">\{userName\} \(</span>{socket.id}) joined room ${roomCode}`);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('vote', ({ roomCode, optionKey }) => {
        const room = rooms[roomCode];
        if (room && room.isActive && room.options[optionKey]) {
            room.options[optionKey].votes++;
            io.to(roomCode).emit('pollUpdated', room);
            console.log(`Vote for ${optionKey} in ${roomCode}. New state:`, room.options);
        } else if (room && !room.isActive) {
            socket.emit('error', 'Voting has ended for this poll.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const roomCode in rooms) {
            if (rooms[roomCode].users[socket.id]) {
                const userName = rooms[roomCode].users[socket.id];
                delete rooms[roomCode].users[socket.id];
                io.to(roomCode).emit('userLeft', { userId: socket.id, userName }); 
                if (Object.keys(rooms[roomCode].users).length === 0) {
                    console.log(`Room ${roomCode} is now empty. Clearing timer.`);
                    if (rooms[roomCode].timerId) {
                        clearInterval(rooms[roomCode].timerId);
                    }
                }
                break;
            }
        }
    });

    function startRoomTimer(roomCode) {
        const room = rooms[roomCode];
        if (!room) return;

        room.timerId = setInterval(() => {
            if (room.timer > 0) {
                room.timer--;
                io.to(roomCode).emit('timerUpdate', { timeLeft: room.timer });
            } else {
                clearInterval(room.timerId);
                room.isActive = false;
                io.to(roomCode).emit('votingEnded', { roomState: room });
                console.log(`Voting ended for room ${roomCode}`);
            }
        }, 1000); 
    }
});


app.get('/', (req, res) => {
    res.send('Poll Server is running!');
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});