var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -33.398981,
      lng: -70.557312
    },
    zoom: 13,
    scrollwheel: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
  });
  //definición de variables
  var listaprincipal;
  localStorage.setItem("pacientes", "[]");
  var markersArray = [];

  var parametros = new Object();
  parametros.id_doctor = localStorage.getItem("id_doctor");
  setInterval(function(){
  $$.ajax({
    type: "POST",
    dataType: "jsonp",
    data: parametros,
    url: "http://190.98.210.37/jcr/webservices/pacientes_listado.php",
    success: function(response) {
      var objeto = JSON.parse(response);
      if (objeto.error == false) {
        //define listaprincipal y recibe listaresponse
        var listaresponse = objeto.pacientes;
        listaprincipal = JSON.parse(localStorage.getItem("pacientes"));
        console.log("tamaño de listaprincipal " + listaprincipal.length);
        console.log("tamaño de listaresponse " + listaresponse.length);
        console.log("tamaño de markersArray " + markersArray.length);
        if (markersArray.length > 0) {
          //si no viene del listaresponse se elimina de listaprincipal
          for (var j = 0; j < listaprincipal.length; j++) {
            var camP = listaprincipal[j];
            var viene = 0;
            for (var i = 0; i < listaresponse.length; i++) {
              var camR = listaresponse[i];
              if (parseInt(camR.id_paciente) == parseInt(camP.id_paciente) && parseInt(camR.id_estado) != parseInt(camP.id_estado)) {
                viene = 0;
                break;
              }
              if (parseInt(camR.id_paciente) != parseInt(camP.id_paciente)) {
                viene = 0;
              } else {
                if (parseInt(camR.id_paciente) == parseInt(camP.id_paciente)) {
                  viene = 1;
                  break;
                }

              }

            }
            console.log("Viene " + viene);
            //console.log("Ids "+ camR.id+camP.id+" and "+camR.id_estado+" "+camP.id_estado);
            if (viene == 0) {
              console.log("eliminar");
              removeMarker(camP.id);
              listaprincipal.splice(j, 1);
              j--;
            }
          }
          // elimina de listaresponse el objeto existe listaprincipal para optimizar busqueda

          for (var j = 0; j < listaprincipal.length; j++) {
            var viene = false;
            for (var i = 0; i < listaresponse.length; i++) {
              var camR = listaresponse[i];
              var camP = listaprincipal[j];
              if (parseInt(camR.id_paciente) == parseInt(camP.id_paciente) && parseInt(camR.id_estado) == parseInt(camP.id_estado)) {
                //elimina objeto de listaresponse existente en listaprincipal
                listaresponse.splice(i, 1);
                i--;
                break;
              }
            }
          }
          console.log("agregar tamaño de listaresponse " + listaresponse.length);
          //encola listadoresponse a listaprincipal
          for (var i = 0; i < listaresponse.length; i++) {
            var largo = listaprincipal.length;
            listaprincipal[largo] = listaresponse[i];
            //agrega marcador a mapa
            console.log("agregar");
            markera(listaresponse[i]);
            //nuevas(listaresponse[i]);
          }
          //console.log("localStorage: "+localStorage.getItem("camera") );
          localStorage.setItem("camera", JSON.stringify(listaprincipal));
        } else {
          console.log("primera vez");
          localStorage.setItem("pacientes", JSON.stringify(listaresponse));
          //agrega cada uno de los marcadores de lista response
          for (var i = 0; i < listaresponse.length; i++) {
            var largo = listaprincipal.length;
            listaprincipal[largo] = listaresponse[i];
            //llama a la funcion para agregar marcador
            console.log("agrega");
            markera(listaresponse[i]);
            //if(i==0){
            //nuevas(listaresponse[i]);
            //}
            //localStorage.setItem("camera",JSON.stringify(listaprincipal) );
          }
        }
      } else {
        myApp.alert('alerta alerta', 'Atención!');
      }
    },
    error: function(response) {
      myApp.hidePreloader();
      myApp.alert("Error de conexion", 'Error!');
    }
  });
}, 2000);

  function removeMarker(position) {
    //console.log("markersArray "+ markersArray.length);
    for (var i = 0; i < markersArray.length; i++) {
      //console.log("position array "+markersArray[i].id);
      if (markersArray[i].id == position) {
        console.log("delete " + markersArray[i].id + "== " + position);
        markersArray[i].setMap(null);
        markersArray.splice(i, 1);
        i--;
      }

    }

    //console.log(markersArray.length);
  }

  function markera(pacientes) {
    var iconoMarca;
    //tipo de camara publica
    console.log(pacientes.id_estado);
    if (parseInt(pacientes.id_estado) == 0) {
      iconoMarca = 'img/marcador/marcador_gris.svg';
    }
    if (parseInt(pacientes.id_estado) == 1) {
      iconoMarca = 'img/marcador/marcador_camara.svg';
    }
    if (parseInt(pacientes.id_estado) == 2) {
      iconoMarca = 'img/marcador/marcador_camara_alerta.svg';
    }
    //marcador
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(pacientes.latitud, pacientes.longitud),
      animation: google.maps.Animation.DROP,
      icon: iconoMarca,
      optimized: false,
      id: pacientes.id_paciente,
    });
    //setea marcador en mapa
    marker.setMap(map);
    markersArray.push(marker);
    //card paciente
    marker.addListener('click', function() {
      var modal = myApp.modal({
        afterText: '<div class="swiper-container" id="paciente-modal" style="width: auto; margin:5px -15px -15px">' +
          '<div class="img-paciente">' +
          '<div class="swiper-slide"><img src="img/modal_paciente/paciente_tam_ori.jpg" height="150" style="display:block"></div>' +
          '<div class="text-paciente">' +
          '<div>Paciente</div>' +
          '<div>' + pacientes.nombre +' '+pacientes.apellido+  '</div>' +
          '</div>' +
          '</div>' +
          '<div class="info-paciente">' +
          '<div class="detalle">' +
          '<img src="img/modal_paciente/encama.svg"></img>' +
          '<div>' +
          '<div><strong>Movilidad: </strong>' + pacientes.tipo + '</div>' +
          '<div>' + pacientes.enfermedad_cronica + '</div>' +
          '</div>' +
          '</div>' +
          '<div class="control">' +
          '<img src="img/modal_paciente/pide_hora.svg"></img>' +
          '<div>' +
          '<div><strong>Ultimo control online: </strong>' + pacientes.fecha_revision + '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>',
        buttons: [
          {
           text: 'Cerrar'
         },
          {
            text: 'Detalle paciente',
            bold: true,
            onClick: function() {
              console.log("id "+pacientes.id_paciente);
              paciente(pacientes.id_paciente);
              mainView.router.refreshPage('paciente/detalle.html');
            }
          },
        ]
      })
      $$(".modal").css('width', '285px');
      $$(".modal").css('margin-top', '-120px');
      $$(".modal").css('left', '50%');
      $$(".modal").css('border-radius', '0px');
      $$(".modal-inner").css('padding', '0px 15px 10px');
      $$(".swiper-container").css('margin', '0px -15px -15px');
    });
  }
}
