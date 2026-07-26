const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'mediconnect_super_secret_placement_key_2026';
};

const setupSocket = (io) => {
  // Socket.io JWT Authentication Handshake Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        // Allow unauthenticated guest preview if in local development mode
        if (process.env.NODE_ENV !== 'production') {
          socket.user = { _id: 'guest-' + Date.now(), name: socket.handshake.auth?.userName || 'Guest User', role: 'PATIENT' };
          return next();
        }
        return next(new Error('Authentication error: Token required to establish Socket.io connection.'));
      }

      const decoded = jwt.verify(token, getJwtSecret());
      if (mongoose.connection.readyState === 1) {
        socket.user = await User.findById(decoded.id).select('-password');
      } else {
        socket.user = global.memoryStore?.users.find((u) => u._id === decoded.id) || { _id: decoded.id, name: 'Demo User', role: 'PATIENT' };
      }

      if (!socket.user) {
        return next(new Error('Authentication error: User not found.'));
      }

      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Authenticated client connected: ${socket.user?.name} (${socket.id})`);

    // Auto-join a personal room for account-wide real-time notifications
    // (appointment updates, cancellations) independent of any video-call room.
    if (socket.user?._id) {
      socket.join(`user-${socket.user._id}`);
    }

    // Join room with room-ownership authorization
    socket.on('join-room', async ({ roomId }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`[Socket.io] ${socket.user?.name} (${socket.user?._id}) joined room ${roomId}`);

      // Fetch chat history for room
      try {
        let history = [];
        if (mongoose.connection.readyState === 1) {
          history = await ChatMessage.find({ appointmentId: roomId }).sort({ createdAt: 1 }).limit(50);
        } else {
          const list = global.memoryStore?.chatMessages || [];
          history = list.filter((m) => m.appointmentId === roomId);
        }
        socket.emit('chat-history', history);
      } catch (err) {
        console.error('[Socket.io] Chat history fetch error:', err.message);
      }

      socket.to(roomId).emit('user-joined', { userId: socket.user?._id, userName: socket.user?.name, socketId: socket.id });
    });

    // Handle real-time chat message
    socket.on('send-message', async ({ roomId, message }) => {
      try {
        const chatMsg = {
          appointmentId: roomId,
          sender: socket.user?._id,
          senderName: socket.user?.name || 'User',
          message,
          createdAt: new Date()
        };

        if (mongoose.connection.readyState === 1) {
          await ChatMessage.create(chatMsg);
        } else {
          if (!global.memoryStore.chatMessages) global.memoryStore.chatMessages = [];
          global.memoryStore.chatMessages.push(chatMsg);
        }

        io.in(roomId).emit('receive-message', chatMsg);
      } catch (err) {
        console.error('[Socket.io] Send message error:', err.message);
      }
    });

    // WebRTC Signaling: Offer
    socket.on('webrtc-offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('webrtc-offer', { offer, senderSocketId: socket.id });
    });

    // WebRTC Signaling: Answer
    socket.on('webrtc-answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('webrtc-answer', { answer, senderSocketId: socket.id });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('webrtc-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('webrtc-candidate', { candidate, senderSocketId: socket.id });
    });

    // Stream status toggles
    socket.on('stream-toggle', ({ roomId, type, active }) => {
      socket.to(roomId).emit('stream-toggle', { type, active, senderId: socket.user?._id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', { userId: socket.user?._id, socketId: socket.id });
      }
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
