// Initialize app
var myApp = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});
document.addEventListener('deviceready', this.onDeviceReady, false);
function onDeviceReady(){
    console.log('device'+device.platform+'uuid'+device.uuid);
    window.FirebasePlugin.getToken(function(token) {
    // save this server-side and use it to push notifications to this device
        alert(token);
    }, function(error) {
        console.error(error);
    });
}
