var express = require('express');
var Controllers = require('./controllers');

var app = express();
var port = process.env.PORT || 3000;

//socket request login validate config
//var parseSignedCookie = require('connect').utils.parseSignedCookie;
var MongoStore = require('connect-mongo')(express);
var Cookie = require('cookie');
var sessionStore = new MongoStore({
	url : 'mongodb://localhost/technode'
});

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret : 'technode',
	cookie : {
		maxAge : 60 * 1000 * 60
	},
	store : sessionStore
}));

app.use(express.static(__dirname + '/static'));

app.use(function(req,res){
	res.sendfile('./static/index.html');
});

var io = require('socket.io').listen(app.listen(port));
//socket request login validate config
io.set('authorization',function(handshakeData,accept){
	handshakeData.cookie = Cookie.parse(handshakeData.headers.cookie);
	var connectSid = handshakeData.cookie['connect.Sid'];
	connectSid = parseSignedCookie(connectSid,'technode');
	
	if(connectSid){
		sessionStore.get(connectSid,function(error,session){
			if(error){
				accept(error.message,false);
			}else{
				handshakeData.session = session;
				if(session._userId){
					accept(null,true);
				}else{
					accept('No login');
				}
			}
		})
	}else{
		accept('No Session');
	}
});

//socket server
var messages = [];
io.sockets.on("connection",function(socket){
	//user online and offline based on socket
	_userId = socket.handshake.session._userId;
	Controllers.User.online(_userId,function(err,user){
		if(err){
			socket.emit('err',{
				msg : err
			});
		}else{
			socket.broadcast.emit('online',user);
			socket.broadcast.emit('messageAdded',{
				content : user.name + "enter chatroom",
				creator : SYSTEM,
				createAt : new Date()
			});
		}
	});
	socket.on('disconnect',function(){
		Controllers.User.offline(_userId,function(err,user){
			if(err){
				socket.emit('err',{
					msg : err
				});
			}else{
				socket.broadcast.emit('offline',user);
				socket.broadcast.emit('messageAdded',{
					content : user.name + "leave chatroom",
					creator : SYSTEM,
					createAt : new Date()
				});
			}
		});
	})
	
	socket.on('getRoom',function(){
		async.parallel([
				function(done){
					Controllers.user.getOnlineUsers(done);
				},
				function(done){
					Controllers.Messages.read(done);
				}
			],
			function(err,results){
				if(err){
					socket.emit('err',{
						msg : err
					});
				}else{
					socket.emit('roomData',{
						users : results[0],
						messages : results[1]
					});
				}
			}
		);
	});
	socket.on('createMessage',function(message){
		Controllers.Message.create(function(message){
			if(err){
				socket.emit('err',{msg : err});
			}else{
				io.sockets.emit('messageAdded',message);
			}
		})
	});
});

app.get('/api/validate',function(req,res){
	_userId = req.session._userId;
	if(_userId){
		Controllers.User.findUserById(_userId,function(err,user){
			if(err){
				res.json(401,{msg:err});
			}else{
				res.json(user);
			}
		});
	}else{
		res.json(401,null);
	}
});

app.post('/api/login',function(req,res){
	email = req.body.email;
	if(email){
		Controllers.User.findByEmailOrCreate(email,function(err,user){
			if(err){
				res.json(500,{msg : err});
			}else{
				req.session._userId = user._id;
				Controllers.user.online(user._id,function(err,user){
					if(err){
						res.json(500,{
							msg : err
						});
					}else{
						res.json(user);
					}
				});
			}
		});
	}else{
		res.json(403);
	}
});

app.get('/api/logout',function(req,res){
	_userId = req.session._userId;
	Controllers.User.offline(_userId,function(err,user){
		if(err){
			res.json(500,{
				msg : err
			});
		}else{
			res.json(200);
			delete req.session._userId;
		}
	});
});
console.log('chat is on port '+port +'!');
