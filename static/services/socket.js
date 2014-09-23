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