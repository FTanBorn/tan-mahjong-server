const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Aktif oyunları tutacak obje
const activeGames = new Map();

// Oyun odalarını tutacak obje
const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);

  // Oyun odasına katılma
  socket.on('joinRoom', (roomId) => {
    const room = gameRooms.get(roomId) || { players: [], spectators: [] };
    
    if (room.players.length < 2) {
      room.players.push({
        id: socket.id,
        name: `Player ${room.players.length + 1}`,
        ready: false
      });
      socket.join(roomId);
      gameRooms.set(roomId, room);
      
      io.to(roomId).emit('roomUpdate', room);
    } else {
      // Oda doluysa izleyici olarak ekle
      room.spectators.push(socket.id);
      socket.join(roomId);
      socket.emit('roomFull');
    }
  });

  // Oyuncu hazır durumu
  socket.on('playerReady', (roomId) => {
    const room = gameRooms.get(roomId);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.ready = true;
        
        // Tüm oyuncular hazırsa oyunu başlat
        if (room.players.length === 2 && room.players.every(p => p.ready)) {
          const gameState = initializeGame(room.players);
          activeGames.set(roomId, gameState);
          io.to(roomId).emit('gameStart', gameState);
        } else {
          io.to(roomId).emit('roomUpdate', room);
        }
      }
    }
  });

  // Hamle yapma
  socket.on('makeMove', ({ roomId, move }) => {
    const gameState = activeGames.get(roomId);
    if (gameState && isValidMove(gameState, move, socket.id)) {
      const updatedState = processMove(gameState, move);
      activeGames.set(roomId, updatedState);
      io.to(roomId).emit('gameUpdate', updatedState);

      if (checkWinCondition(updatedState)) {
        io.to(roomId).emit('gameOver', {
          winner: updatedState.currentPlayer,
          gameState: updatedState
        });
      }
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    
    // Tüm odaları kontrol et ve oyuncuyu kaldır
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('playerLeft', { playerId: socket.id });
        io.to(roomId).emit('roomUpdate', room);
      }

      const spectatorIndex = room.spectators.indexOf(socket.id);
      if (spectatorIndex !== -1) {
        room.spectators.splice(spectatorIndex, 1);
      }

      if (room.players.length === 0 && room.spectators.length === 0) {
        gameRooms.delete(roomId);
        activeGames.delete(roomId);
      }
    });
  });
});

// Oyun başlatma fonksiyonu
function initializeGame(players) {
  return {
    players,
    currentPlayer: players[Math.floor(Math.random() * 2)].id,
    gamePhase: 'teamSelection',
    firstMatrix: [],
    secondMatrix: [],
    centerTile: null
  };
}

// Hamle geçerliliğini kontrol etme
function isValidMove(gameState, move, playerId) {
  return gameState.currentPlayer === playerId;
}

// Hamleyi işleme
function processMove(gameState, move) {
  return gameState;
}

// Kazanma durumunu kontrol etme
function checkWinCondition(gameState) {
  return false;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});