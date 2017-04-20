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

function onDeviceReady() {
  // TEST
  // console.log('device'+device.platform+'uuid'+device.uuid);
  // window.FirebasePlugin.getToken(function(token) {
  //     console.log("token es" + token);
  // }, function(error) {
  //     console.error(error);
  // });

}

/*-----------------------------------------------------------------------------*/
/*--------------------------------- Index -------------------------------------*/
/*-----------------------------------------------------------------------------*/
if (localStorage.getItem('login')=="on") {
    mainView.router.loadPage('home.html');
}
$$(".close-panel").on('click',function () {
    localStorage.setItem('login',"off");
    //mainView.router.reloadPage('index.html');
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
        //parametros.email = username;
        //parametros.password = password;
        //parametros.dispositivo = device.platform;
        //parametros.imei = device.uuid;
        //parametros.fcm = localStorage.getItem("registrationFCM");

        /* platform desktop */
        parametros.email = username;
        parametros.password = password;
        parametros.dispositivo = 'android';
        parametros.imei = 'cd83d9d3583c9360';
        parametros.fcm = 'enZ6ii9dESE:APA91bGoU_NyGqEQQAeF62WyzpKjZ5MDeWrpQVH7axVNjVfAv_K17C1oxWCV8gETjracT7zrGNU6pAjqd2vKNMLl9vt_Roo4viVecKwpa4dVzYJuJ-zdaWXmqhvy4pE6rrBa9J59c3Ea';
        console.log(JSON.stringify(parametros));
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
  $$("#avatar_doctor").attr("src", "img/avatar_doctor/"+localStorage.getItem("id_doctor")+".png");
  $$(".subnavbar .buttons-row .center").append(
    'Dr. ' + localStorage.getItem("nombre") + ' ' + localStorage.getItem("apellido") + ' <br>Pacientes Asignados'
  );


  /*Cargar listado*/
  var parametros = new Object();
  parametros.id_doctor = localStorage.getItem("id_doctor");
  $$.ajax({
    type: "GET",
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
        '<li class="item-content" id="' + pacientes[i].id_paciente + '" onclick="paciente(this.id)">' +
        '<div class="item-media"><img src="img/avatar_paciente/' + pacientes[i].id_imagen + '.png" height="40" width="40"></div>' +
        '<div class="item-inner">' +
        '<div class="item-title"><strong>' + pacientes[i].nombre + " - " + pacientes[i].apellido + '</strong></div>' +
        '<div class="item-title">' + pacientes[i].direccion + " - " + pacientes[i].comuna + '</div>' +
        '<div class="item-title" style="color: red">' + pacientes[i].fecha_revision + '</div>' +
        '</div>' +
        '<div class="item-media"><img src="img/listado_paciente/mapa_paciente.svg" height="29" width="29"></div>' +
        '</li>'
      );
    }
  }
})
/*-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------*/
