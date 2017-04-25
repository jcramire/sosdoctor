// Initialize app
var myApp = new Framework7({
  pushState: true,
  //swipePanel: 'left',
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  //dynamicNavbar: true
  //domCache: false
});

document.addEventListener('deviceready', this.onDeviceReady, false);

function onDeviceReady() {
  inicioPush();
  // TEST
  //myApp.alert('device'+device.platform+'uuid'+device.uuid+' '+localStorage.getItem('fcm'));
}

function inicioPush() {
  console.log("Iniciando PUSH");
  localStorage.setItem('plataforma', device.platform);
  if (device.platform == 'iOS') {
    window.FirebasePlugin.grantPermission();
  }
  //inicia push y registra en firebase
  window.FirebasePlugin.getToken(
    function(token) {
      //myApp.alert('token es'+ token);
      localStorage.setItem('fcm', token);
      localStorage.setItem('imei', device.uuid);
      console.log("FCM token entregado");
    },
    function(error) {
      console.error("error en FirebasePlugin.getToken : " + error);
    }
  );
  //llega una actualizacion del token de FCM
  window.FirebasePlugin.onTokenRefresh(
    function(token) {
      console.log("token FCM renovado");
      localStorage.setItem('fcm', token);
    },
    function(error) {
      console.error(error);
    }
  );
  console.log("Fin de los PUSH");
}


/*-----------------------------------------------------------------------------*/
/*--------------------------------- Index -------------------------------------*/
/*-----------------------------------------------------------------------------*/
if (localStorage.getItem('login')=="on") {
    mainView.router.loadPage('home.html');
}else{
  mainView.router.loadPage('index.html');
}
$$(".close-panel").on('click',function () {
    localStorage.setItem('login',"off");
    location.reload();
});

/* Login */
$$('.login').on('click', function() {
  var bol_username, bol_password;
  var username = $$('input[name="username"]').val();
  var password = $$('input[name="password"]').val();
  if (!username || !password) {
    myApp.alert('Debe ingresar usuario y contraseña', 'Atención!');
  } else {
    /* validar el ingreso de los parametros de acceso */
    if (bol_username = validarUsername(username)) {
      if (bol_password = validarPassword(password)) {
        var parametros = new Object();

        /* platform android */
        parametros.email = username;
        parametros.password = password;
        parametros.dispositivo = device.platform;
        parametros.imei = device.uuid;
        parametros.fcm = localStorage.getItem("fcm");

        /* platform desktop */
        //parametros.email = username;
        //parametros.password = password;
        //parametros.dispositivo = 'android';
        //parametros.imei = 'cd83d9d3583c9360';
        //parametros.fcm = 'enZ6ii9dESE:APA91bGoU_NyGqEQQAeF62WyzpKjZ5MDeWrpQVH7axVNjVfAv_K17C1oxWCV8gETjracT7zrGNU6pAjqd2vKNMLl9vt_Roo4viVecKwpa4dVzYJuJ-zdaWXmqhvy4pE6rrBa9J59c3Ea';
        //myApp.alert(JSON.stringify(parametros));
        $$.ajax({
          type: "POST",
          dataType: "jsonp",
          data: parametros,
          url: "http://190.98.210.37/jcr/webservices/login.php",
          success: function(response) {
            var objeto = JSON.parse(response);
            if (objeto.error == false) {
              //myApp.closeModal('.login-screen');
              mainView.router.loadPage('home.html');
              localStorage.setItem('login', "on");
              localStorage.setItem("id_doctor", objeto.user.id_doctor);
              localStorage.setItem("nombre", objeto.user.nombre);
              localStorage.setItem("apellido", objeto.user.apellido);
            } else {
              myApp.alert(objeto.error_msg, 'Atención!');
            }
          },
          error: function(response) {
            myApp.hidePreloader();
            myApp.alert("Error de conexion", 'Error!');
          }
        });
      }
    }
  }
});
/* Recover*/
$$('.recover').on('click', function() {
  myApp.prompt('Ingrese su correo para enviar una nueva contraseña', 'Recuperar contraseña', function(value) {
    if (validarUsername(value)) {
      myApp.confirm('Pedir nueva contraseña?', 'Confirmar', function() {
        var parametros = new Object();
        parametros.email = value;
        $$.ajax({
          type: "POST",
          dataType: "jsonp",
          data: parametros,
          url: "http://190.98.210.37/jcr/webservices/recover.php",
          success: function(response) {
            console.log(response);
            var objeto = JSON.parse(response);
            if (objeto.error == false) {
              myApp.alert(objeto.success_msg, 'Atención!');
            } else {
              myApp.alert(objeto.error_msg, 'Atención!');
            }
          },
          error: function(response) {
            myApp.alert("Error de conexion", 'Error!');
          }
        });

      });
    }
  });
  /*personaliza prompt*/
  $$(".modal-text-input").attr('placeholder', 'correo@dominio.cl');
  $$(".theme-deeporange .modal-button").css('color', '#4caf50');
});

/* validar parametros de Login [username(correo), password] */
function validarUsername(username) {
  expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!expr.test(username)) {
    myApp.hidePreloader();
    myApp.alert('El usuario es invalido', 'Atención!');
    return false;
  }
  return true;
}

function validarPassword(password) {
  if (password.length == 0) {
    myApp.alert('La contraseña es obligatoria', 'Atención!');
    return false;
  }
  expr = /^[a-zA-Z_ÁÉÍÓÚáéíóúñÑ\s\d]*$/;
  if (!expr.test(password)) {
    myApp.alert('La contraseña es invalida <br> solo: letras y numeros', 'Atención!');
    return false;
  }
  return true;
}
/*-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------*/




/*-----------------------------------------------------------------------------*/
/*---------------------------------- Home -------------------------------------*/
/*-----------------------------------------------------------------------------*/

myApp.onPageInit('home', function(page) {
  // Cargar librerias
  $$("#maps").attr("src", "js/maps.js");
  $$("#mapslibrary").attr("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyAnsA4AvAJtzqY-qUyJxXLWQSOM3w2FAcI&callback=initMap");
  $$("#avatar_doctor").attr("src", "img/avatar_doctor/"+localStorage.getItem("id_doctor")+".png");
  $$(".subnavbar .buttons-row .center").append(
    'Dr. ' + localStorage.getItem("nombre") + ' ' + localStorage.getItem("apellido") + ' <br>Pacientes Asignados'
  );

})

/*-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------*/




/*-----------------------------------------------------------------------------*/
/*------------------------------- Pacientes -----------------------------------*/
/*-----------------------------------------------------------------------------*/
/* Listado */
myApp.onPageInit('listado', function(page) {
  $$(".page-content").css("background","white");
  $$(".listado .subnavbar .buttons-row #avatar_doctor").attr("src", "img/avatar_doctor/1.png");
  $$(".listado .subnavbar .buttons-row .center").append(
    'Dr. ' + localStorage.getItem("nombre") + ' ' + localStorage.getItem("apellido") + ' <br>Pacientes Asignados'
  );
  /*Cargar listado*/
  var parametros = new Object();
  parametros.id_doctor = localStorage.getItem("id_doctor");
  $$.ajax({
    type: "POST",
    dataType: "jsonp",
    data: parametros,
    url: "http://190.98.210.37/jcr/webservices/pacientes_listado.php",
    success: function(response) {
      var objeto = JSON.parse(response);
      if (objeto.error == false) {
        var objeto = JSON.parse(response);
        localStorage.setItem("pacientes", JSON.stringify(objeto.pacientes));
        cargarPacientes();
      } else {
        myApp.alert(objeto.error_msg, 'Atención!');
      }
    },
    error: function(response) {
      myApp.hidePreloader();
      myApp.alert("Error de conexion", 'Error!');
    }
  });

  function cargarPacientes() {
    var pacientes = localStorage.getItem("pacientes");
    $$(".list-block-pacientes ul").html("");
    pacientes = JSON.parse(pacientes);
    for (var i = 0; i < pacientes.length; i++) {
      $$(".list-block-pacientes ul").append(
        '<li class="item-content" id="' + pacientes[i].id_paciente + '" onclick="paciente(this.id);">' +
        '<div class="item-media"><img src="img/avatar_paciente/' + pacientes[i].id_imagen + '.png" height="46" width="46"></div>' +
        '<div class="item-inner">' +
        '<div class="item-title"><strong>' + pacientes[i].nombre + " " + pacientes[i].apellido + '</strong></div>' +
        '<div class="item-title">' + pacientes[i].direccion + " - " + pacientes[i].comuna + '</div>' +
        '<div class="item-title" style="color: red">' + pacientes[i].fecha_revision + '</div>' +
        '</div>' +
        '<div class="item-media"><img src="img/listado_paciente/mapa_paciente.svg" height="28" width="28"></div>' +
        '</li>'
      );
    }
  }


})
function paciente(id_paciente){
  console.log(id_paciente);
  var parametros = new Object();
  parametros.id_paciente = id_paciente;
  $$.ajax({
    type: "POST",
    dataType: "jsonp",
    data: parametros,
    url: "http://190.98.210.37/jcr/webservices/detalle_paciente.php",
    success: function(response) {
      var objeto = JSON.parse(response);
      console.log(objeto);
      if (objeto.error == false) {
        var objeto = JSON.parse(response);
        localStorage.setItem("paciente", JSON.stringify(objeto.paciente));
        mainView.router.loadPage('paciente/detalle.html');
      } else {
        myApp.alert(objeto.error_msg, 'Atención!');
      }
    },
    error: function(response) {
      myApp.hidePreloader();
      myApp.alert("Error de conexion", 'Error!');
    }
  });

}
/*-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------*/
/*------------------------------- Pacientes -----------------------------------*/
/*-----------------------------------------------------------------------------*/
/* Listado */
myApp.onPageInit('detalle', function(page) {
  var paciente = localStorage.getItem("paciente");
  paciente_detalle = JSON.parse(paciente);
  $$(".paciente-detalle .navbar .navbar-inner .center").append(
    'Movimiento: '+paciente_detalle.tipo
  );
  $$(".paciente-detalle .subnavbar .buttons-row .center").append(
    paciente_detalle.nombre+' '+paciente_detalle.apellido
  );
  $$(".paciente-detalle .subnavbar .buttons-row #avatar_paciente").attr("src", "img/avatar_paciente/"+paciente_detalle.id_paciente+".png");
  $$(".list-info ul li:nth-child(1) .item-content .item-inner .item-title").append(
    '<strong>'+paciente_detalle.enfermedad_cronica+'.</strong>'
  );
  $$(".list-info ul li:nth-child(2) .item-content .item-inner .item-title").append(
    paciente_detalle.direccion+' - '+paciente_detalle.comuna
  );
  $$(".list-info ul li:nth-child(3) .item-content .item-inner .item-title").append(
    '<strong>Último control online:</strong> Indefinido <br> <strong>Próximo monitoreo:</strong> Indefinido'
  );

})
/*-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------*/
