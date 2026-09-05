const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from current directory
app.use(express.static(__dirname));

// Store simple in-memory state
let groups = [
  { id: 'grp_1', code: 'GROUP4-CUE', name: 'Group 4', creator: 'Dr. Maya', readReceipts: true },
  { id: 'grp_2', code: 'GROUP4-NOCUE', name: 'Group 4', creator: 'Dr. Maya', readReceipts: false }
];
const messages = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send available groups to new client
  socket.emit('groups', groups);
  
  socket.on('startSession', (participant) => {
    // Determine group
    const code = participant.groupCode;
    let group = groups.find(g => g.code === code);
    if (!group) {
      // Pick random if code is random/invalid
      group = groups[Math.floor(Math.random() * groups.length)];
    }
    
    socket.participant = participant;
    socket.group = group;
    socket.join(group.id);
    
    // Send existing messages
    const groupMessages = messages.filter(m => m.groupId === group.id);
    socket.emit('sessionStarted', { group, messages: groupMessages });
    
    // System join message
    const joinMsg = {
      id: `sys_${Date.now()}_${Math.random()}`,
      groupId: group.id,
      text: `${participant.name} joined the group.`,
      kind: 'system',
      at: new Date().toISOString()
    };
    messages.push(joinMsg);
    io.to(group.id).emit('chatMessage', joinMsg);
  });

  socket.on('chatMessage', (msgData) => {
    if (!socket.group) return;
    const msg = {
      id: `msg_${Date.now()}_${Math.random()}`,
      groupId: socket.group.id,
      sender: socket.participant.name,
      text: msgData.text,
      kind: 'participant',
      at: new Date().toISOString(),
      replyTo: msgData.replyTo || null
    };
    messages.push(msg);
    io.to(socket.group.id).emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.group && socket.participant) {
      const leaveMsg = {
        id: `sys_${Date.now()}_${Math.random()}`,
        groupId: socket.group.id,
        text: `${socket.participant.name} left the group.`,
        kind: 'system',
        at: new Date().toISOString()
      };
      messages.push(leaveMsg);
      io.to(socket.group.id).emit('chatMessage', leaveMsg);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Live server running on http://localhost:${PORT}`);
});
