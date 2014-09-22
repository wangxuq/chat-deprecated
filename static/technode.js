//complete the logic of the index.html page

//the module of techNodeApp --- ng-app
angular.module('techNodeApp',[ngRoute]);
//login logic
run(function($window,$rootScope,$http,$location){
	$http({
		url : '/api/validate',
		method : 'GET'
	}).success(function(user){
		$rootScope.me = user;
		$location.path('/');
	}).error(function(data){
		$location.path('/login')
	});
});



//make the socket.io be a Angular service,then can use this in other wight to communication
angular.module("techNodeApp").factory('socket',function($rootScope){
	var socket = io.connect('/');
	return {
		on : function(eventName,callback){
			socket.on(eventName,function{
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket,args);
				});
			});
		},
		emit:function(eventName,data,callback){
			socket.emit(eventName,data,callback){
				var args = arguments;
				$rootScope.$apply(function(){
					if(callback){
						callback.apply(socket,args);
					}
				});
			};
		}
	}
});
//define RoomCtrl
angular.module('techNodeApp').controller('RoomCtrl',function($scope,socket){
	$scope.messages = [];
	socket.emit('getAllMessages');
	socket.on('allMessage',function(messages){
		$scope.messages = messages;
	});
	socket.on('messageAdded',function(message){
		$scope.messages.push(message);
	});
});
//define MessageCreatorCtrl
angular.module('techNodeApp').controller('MessageCreatorCtrl',function($scope,socket){
	$scope.newMessage = '';
	$scope.createMessage = function(){
		if($scope.newMessage==''){
			return ;
		}
		socket.emit('createMessage',$scope.newMessage);
		$scope.newMessage = '';
	}
});


