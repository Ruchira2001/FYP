const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');
const Admin = require('../models/Admin');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      if (decoded.role === 'farmer') {
        user = await User.findById(decoded.id).select('-password');
      } else if (decoded.role === 'expert') {
        user = await Expert.findById(decoded.id).select('-password');
      } else if (decoded.role === 'shop') {
        user = await Shop.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      }

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = { id: user._id.toString(), role: decoded.role, name: user.name };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
