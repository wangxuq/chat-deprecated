//complete the logic of the index.html page

//the module of techNodeApp --- ng-app
angular.module('techNodeApp',['ngRoute','angularMoment']);
//login logic
run(function($window,$rootScope,$http,$location){
	$window.moment.lang('zh-cn');
	$http({
		url : '/ajax/validate',
		method : 'GET'
	}).success(function(user){
		$rootScope.me = user;
		$location.path('/');
	}).error(function(data){
		$location.path('/login');
	});
	$rootScope.logout = function(){
		$http({
			url : '/ajax/logout',
			method : 'GET'
		}).success(function(){
			$rootScope.me = null,
			$location.path('/login');
		});
	};
	$rootScope.$on('login',function(evt,me){
		$rootScope.me = me;
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


