let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

//Here is where we should put all our socket methods

//disconnect code
const onDisconnect = (sock) => {
  const socket = sock;
  
  socket.on('disconnect', () =>{
    console.log('user disconnected');
    
    //remove player data from players object
    
    //tell socket to leave
  })
}

//This gets called by app when it runs
const configure = (ioServer) => {
  io = ioServer;
  
  //This gets called once on every player connection
  io.on('connection', (sock) =>{
    const socket = sock;
    console.log('connection started');
    
    //List all socket methods here
    onDisconect(socket);
    
  });
};

module.exports.configure = configure;