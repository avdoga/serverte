var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');

console.log('server started');

var players = [];


io.on('connection', function(socket){
    
    var thisPlayerId = shortid.generate();
    
    var player = {
        id: thisPlayerId,
        x: 0,
        y: 0
    }
    
    players[thisPlayerId] = player;
    
    console.log('client connected, broadcasting spawn, Id', thisPlayerId);

    socket.emit('register', { id: thisPlayerId });
    socket.broadcast.emit('spawn', { id: thisPlayerId });
    socket.broadcast.emit('requestPosition');
    
    for(var playerId in players){
        
        if(playerId == thisPlayerId)
            continue;
        
        socket.emit('spawn', players[playerId]);
        console.log('sending spawn to new player for id: ', playerId);
    };
    
    
    socket.on('move', function(data){
        data.id = thisPlayerId;
        console.log('client moved', JSON.stringify(data));
        
        player.x = data.x;
        player.y = data.y;
        
        socket.broadcast.emit('move', data);
    });
    
    socket.on('follow', function(data){
        console.log('follow request', data);
        data.id = thisPlayerId;
        socket.broadcast.emit('follow', data);
    });
    
    socket.on('updatePosition', function(data){
        console.log('update Position', data);
        data.id = thisPlayerId;
        socket.broadcast.emit('updatePosition', data);
    });
    
    socket.on('disconnect', function(){
    console.log('client disconected');
        
    delete players[thisPlayerId];  
        
    socket.broadcast.emit('disconected', { id: thisPlayerId }); 
    });
})