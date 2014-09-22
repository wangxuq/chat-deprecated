//define RoomCtrl
angular.module('techNodeApp').controller('RoomCtrl',function($scope,socket){
	$scope.messages = [];
	socket.emit('getAllMessages');
	socket.on('roomData',function(room){
		$scope.room = room;
	});
	socket.on('allMessage',function(messages){
		$scope.messages = messages;
	});
	socket.on('messageAdded',function(message){
		$scope.technode.messages.push(message);
	});
	socket.on('online',function(user){
		$scope.room.users.push(user);
	})
	socket.on('offline',function(user){
		$scope.room.users = $scope.room.users.filter(function(user){
			return user._id != _userId;
		})
	});
	socket.emit('getRoom');
});