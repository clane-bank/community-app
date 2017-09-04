(function (module) {
    mifosX.services = _.extend(module, {
        AuthenticationService: function (scope, httpService, SECURITY, timeout, webStorage, $http) {
            var onSuccess = function (data) {
              
                scope.$broadcast("UserAuthenticationSuccessEvent", data);
                webStorage.add('userData', data);
                sessionStorage.removeItem('access_code');
            };

            var onFailure = function (data, status) {
              
                scope.$broadcast("UserAuthenticationFailureEvent", data, status);
                sessionStorage.removeItem('access_code');
            };

            var apiUrl = '/fineract-provider/api';
            var apiVer = apiUrl +'/v1'

            var getUserDetails = function(data){
                webStorage.add('tokendetails', data);
                
                setTimer(data.expires_in);
                httpService.get( apiVer + "/userdetails?access_token=" + data.access_token)
                    .success(onSuccess)
                    .error(onFailure);
            }
            
            var updateAccessDetails = function(data){
                var sessionData = webStorage.get('sessionData');
                sessionData.authenticationKey = data.access_token;
                webStorage.add("sessionData",sessionData);
                webStorage.add("tokendetails",data);
                
                var userDate = webStorage.get("userData");
                userDate.accessToken =  data.access_token;
                webStorage.add('userData', userDate);
                httpService.setAuthorization(data.access_token);
                setTimer(data.expires_in);
            }

            var setTimer = function(time){
                timeout(getAccessToken, time * 1000);
            }

            var getAccessToken = function(){
                var refreshToken = webStorage.get("tokendetails").refresh_token;
                httpService.cancelAuthorization();
                httpService.post( apiUrl + "/oauth/token?&client_id=community-app&grant_type=refresh_token&client_secret=123&refresh_token=" + refreshToken)
                    .success(updateAccessDetails);
            }

            this.removeUserData = function(){
              webStorage.remove('sessionData');
              webStorage.remove('tokendetails');
              webStorage.remove('userData');
            }
            
            this.authenticateWithAccessCode = function()
            {
              scope.$broadcast("UserAuthenticationStartEvent");
              httpService.post( apiUrl + "/oauth/token?access_code=" + sessionStorage['access_code'] +
                 "&redirect_uri=" + GLUU.config.redirect_uri +
                 "&gluu_scope=" + GLUU.config.scope +
                 "&client_id=community-app" +
                 "&grant_type=gluu" +
                 "&client_secret=123")
                .success(getUserDetails)
                .error(onFailure);
            }
            
            this.authenticateWithUsernamePassword = function (credentials) {
                scope.$broadcast("UserAuthenticationStartEvent");
        		if(SECURITY === 'oauth'){
	                httpService.post( apiUrl +"/oauth/token?username=" + credentials.username + "&password=" + credentials.password +"&client_id=community-app&grant_type=password&client_secret=123")
	                    .success(getUserDetails)
	                    .error(onFailure);
        		} else {
	                httpService.post(apiVer + "/authentication?username=" + credentials.username + "&password=" + credentials.password)
	                    .success(onSuccess)
	                    .error(onFailure);
        		}
            };
        }
    });
    mifosX.ng.services.service('AuthenticationService', ['$rootScope', 'HttpService', 'SECURITY','$timeout','webStorage', '$http', mifosX.services.AuthenticationService]).run(function ($log) {
        $log.info("AuthenticationService initialized");
    });
}(mifosX.services || {}));
