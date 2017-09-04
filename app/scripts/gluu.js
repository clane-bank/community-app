
var GLUU = namespace('GLUU');

GLUU.config = {
  base_uri : 'https://gluu.test.clane.com',
  client_id : '@!1EB3.44FF.24F8.FA1A!0001!6E69.93E1!0008!CCEC.34F7.DDDE.9044',
  redirect_uri : 'http://localhost:9000/callback.html',
  logout_redirect_uri : 'http://localhost:9000',

  response_type : 'code',
  scope : 'openid+fineract',
  acr_values : 'u2f',
  max_age : 5
};

/**
 * redirect to gluu login
 */
GLUU.openLogin = function() {
      
  window.location.assign(
      GLUU.config.base_uri +
      '/oxauth/seam/resource/restv1/oxauth/authorize' +
      '?scope=' + GLUU.config.scope +
      '&response_type=code' +
      '&redirect_uri=' + GLUU.config.redirect_uri +
      '&client_id=' + GLUU.config.client_id +
//      '&acr_values=' + GLUU.config.acr_values +
      '&max_age=' + GLUU.config.max_age +
      '&display=popup'+
      '&nonce=' + GLUU.makeNonce());
};


/**
 * get access code get parameter
 */
GLUU.getCode = function() {
  try {
    var url = window.location.href;
    var token = url.match('code=([^&]*)');
    if (token)
      return token[1];
    else
      return null;
  } catch (e) {
    return null;
  }
};


GLUU.makeNonce = function()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function namespace(namespaceString) {
  var parts = namespaceString.split('.'),
    parent = window,
    currentPart = '';

  for (var i = 0, length = parts.length; i < length; i++) {
    currentPart = parts[i];
    parent[currentPart] = parent[currentPart] || {};
    parent = parent[currentPart];
  }
  return parent;
}
