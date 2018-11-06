function initMap() {
  var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
  var icons = {
    info: {
      icon: iconBase + 'info-i_maps.png'
    }
  };  

  let sValue = new URLSearchParams(document.location.search.substring(1)).get("sValue");
  let resultList = $("#resultList")
  let cMarkers = [] //current marker
 $.ajax({
    url: 'http://localhost:8080/USWISCUWMAD',
    type: 'GET',
    crossDomain: true,
    dataType: 'jsonp',
    //callback~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    success: function(data) {
      var buildings = data.next//data array
      var center = [43.076592,-89.4124875]; 
      var hasLocation = false;
      var dist = 0;
      var utils = [];
      //how to graph map
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14.5,
        center: new google.maps.LatLng(43.076592, -89.4124875),
        mapTypeId: 'roadmap'
      });

      infoWindow = new google.maps.InfoWindow;

      // Try HTML5 geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          center = [];
          center.push(position.coords.latitude);
          center.push(position.coords.longitude);
          map.setCenter({lat:center[0],lng:center[1]});
          hasLocation = true;
          buildings.forEach((building)=>{
            building.utilities.forEach((utility)=>{
            if(utility.type === sValue){
              let tDist = measureDist(center[0],center[1],building.lat,building.lng);
              utils.push({dist:Math.round(tDist),name:building.name,description:utility.description,
                          lat:building.lat,lng:building.lng});
              dist = Math.max(tDist,dist);
              //create mark and list~~~~~~~~~~
              creatMark(building.lat,building.lng)
              // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          })
      })
      //furthest distance:dist
      //try to calculate the approporiate scale
      sortByDist(utils);
      utils.forEach((util)=>{
        resultList.append(createCard(util));
      });
        }, function() {
	   });
      } else {
          console.log("Browser doesn't support geolocation.");
      }
    },
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    error: function() { alert('Failed!'); }
});

const createCard = (obj)=>{
 let liTag = document.createElement("li"),
     imgTag = document.createElement("img"),
     hTag = document.createElement("h3"),
     desTag = document.createElement("label"),
     disTag = document.createElement("p") 
     $(hTag).text(obj.name)
     $(imgTag).attr("src","https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/bascom-hall-todd-klassy.jpg")
     $(disTag).text("Distance: " + obj.dist + " meters")
     $(desTag).text("description: " + obj.description)
     liTag.append(imgTag)
     liTag.append(hTag)
     liTag.append(disTag)
     liTag.append(desTag)
     $(liTag).on('click',function(){
       showSpcItem(obj)
     })
     return liTag
}

const showSpcItem = (obj) => {
  resultList.empty()
  cleanMarkers()
  creatMark(obj.lat,obj.lng)
  map.setCenter({lat:obj.lat,lng:obj.lng})
  $("#pageContainer").append('<p>' + obj.name +'</p>')
  $("#pageContainer").append('<p>'+ "Description: " + obj.description +'</p>')
  $("#pageContainer").append('<p>'+ "Distance: " + obj.dist + " meters" +'</p>')
  $("#pageContainer").append('<button>Get Direction</button>')
}

const cleanMarkers = () => {
  if(cMarkers.length > 0){
    cMarkers.forEach((cMarker)=>{
      cMarker.setMap(null)
    })
  }
}

//create mark on map
const creatMark = (lat,lng) =>{
  let marker = new google.maps.Marker({
              position: new google.maps.LatLng(lat, lng),
              icon: icons['info'].icon,
              map: map
            });
  cMarkers.push(marker)
}

const measureDist = (lat1, lng1, lat2, lng2) => {
  var R = 6378.137; 
  var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  var dLng = lng2 * Math.PI / 180 - lng1 * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d * 1000; 
}

const sortByDist = (list) => {
  //insertion sort
  for(var i=1;i<list.length;i++){
    var j = i-1;
    while(j>-1&&list[j].dist>=list[j+1].dist){
      var temp = list[j];
      list[j]=list[j+1];
      list[j+1]=temp;
      j--;
    }
  }
}

function getMapSize(){
  var container = document.getElementById('map');
  var width = container.offsetWidth;
  var height = container.offsetHeight;
  return {w:width,h:height};
}
}
