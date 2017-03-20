mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zb25vc2VtcHJlaW8iLCJhIjoiOHpYSnpLQSJ9.2ZxP5dSbQhs-dH0PhXER9A';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
    center: [0, 0], // starting position
    zoom: 1 // starting zoom
});

map.on('moveend', function() {
  options.user_lat = map.getCenter().lat;
  options.user_lng = map.getCenter().lng;
  console.log(options.user_lng+', '+options.user_lat);
});

var inputGeoJson;

document.getElementById('inputGEOJSON')
  .addEventListener('change', function(e){
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      // var contents = e.target.result;
      // console.log(contents);
      inputGeoJson = JSON.parse(e.target.result);
      // console.log(inputGeoJson);

      var bbox = turf.extent(inputGeoJson);
      
      map.addSource("input_geometries", {
        "type": "geojson",
        "data": inputGeoJson
    });

    map.addLayer({
        "id": "search_boundaries",
        "type": "fill",
        "source": "input_geometries",
        "paint": {
            "fill-color": "#888888",
            "fill-opacity": 0.4
        },
        "filter": ["==", "$type", "Polygon"]
    });

    map.fitBounds(bbox, {padding: 20});

    };
    reader.readAsText(file);
  }, false);

var options = {
  'client_id' : '3092nxybyb0otqw18e8nh5nty',
  'locale' : 'it_IT',
  'currency' : 'EUR',
  '_format' : 'for_search_results',
  '_limit' : '50',
  '_offset' : '0',
  'guests' : '1',
  'ib' : 'false',
  'ib_add_photo_flow' : 'true',
  'min_bathrooms' : '0',
  'min_bedrooms' : '0',
  'min_beds' : '0',
  'price_min' : '0',
  'price_max' : '1000',
  'min_num_pic_urls' : '0',
  'sort' : '1',
  'suppress_facets' : 'true',
  // 'location' : '',
  'user_lat' : '',
  'user_lng' : ''
}

var results = [];

function buildURL(offset) {
  var url = 'https://cors-anywhere.herokuapp.com/https://api.airbnb.com/v2/search_results';
  var keys = Object.keys(options);
  url += '?';
  if (offset) {
    url += '_offset='+offset+'&';
  }
  keys.forEach(function(opt,i){
    url += opt + '=' + options[opt];
    if ( i < keys.length-1 ) {
      url += '&';
    }
  });
  console.log(url);
  return url;
}

function scrape(geojson) {
  console.log(geojson);
  var poly = geojson.features[0];
  console.log(poly);
  // options['location'] = encodeURIComponent(d3.select('#location').property('value'));
  var offset = 0;
  call(0);
  function call(value){
    d3.json(buildURL(value), function(err,data){
      if (err) { console.log(err); }
      
      console.log(offset, data.metadata.listings_count);
      data.search_results.forEach(function(r){
        var point = {
          "type": "Feature",
          "properties": {
            "marker-color": "#f00"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [r.listing.lng, r.listing.lat]
          }
        };
        var isInside = turf.inside(point, poly);
        if (isInside) {
          var obj = {};
          if (d3.select('#save-pictures').property('checked')) {
            obj.price = r.pricing_quote.nightly_price;
            obj.currency = r.pricing_quote.listing_currency;
            obj.bathrooms = r.listing.bathrooms;
            obj.beds = r.listing.beds;
            obj.city = r.listing.city;
            obj.instant_bookable = r.listing.instant_bookable;
            obj.lat = r.listing.lat;
            obj.lng = r.listing.lng;
            obj.name = r.listing.name;
            obj.person_capacity = r.listing.person_capacity;
            obj.reviews_count = r.listing.reviews_count;
            obj.type = r.listing.room_type;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            results.push(obj);
          } else {
            results.push(r);
          }
        }
      })
      if (data && data.metadata.pagination.next_offset < data.metadata.listings_count && offset <= 300) {
        offset += 50;
        setTimeout(function(){
          call(offset);
        }, 0);
      } else {
        console.log('finished', results);
        downloadData(results);
      }
    })
  }
}

function scrapeOLD(geojson) {
  if (geojson) {
    d3.json(geojson, function(err,poly){
      poly = poly.features[0];
      console.log(poly);
      // options['location'] = encodeURIComponent(d3.select('#location').property('value'));
      var offset = 0;
      call(0);
      function call(value){
        d3.json(buildURL(value), function(err,data){
          if (err) { console.log(err); }
          console.log(offset, data.metadata.listings_count);
          data.search_results.forEach(function(r){
            var point = {
              "type": "Feature",
              "properties": {
                "marker-color": "#f00"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [r.listing.lng, r.listing.lat]
              }
            };
            var isInside = turf.inside(point, poly);
            if (isInside) {
              var obj = {};
              if (d3.select('#save-pictures').property('checked')) {
                obj.price = r.pricing_quote.nightly_price;
                obj.currency = r.pricing_quote.listing_currency;
                obj.bathrooms = r.listing.bathrooms;
                obj.beds = r.listing.beds;
                obj.city = r.listing.city;
                obj.instant_bookable = r.listing.instant_bookable;
                obj.lat = r.listing.lat;
                obj.lng = r.listing.lng;
                obj.name = r.listing.name;
                obj.person_capacity = r.listing.person_capacity;
                obj.reviews_count = r.listing.reviews_count;
                obj.type = r.listing.room_type;
                obj.bedrooms = r.listing.bedrooms;
                obj.bedrooms = r.listing.bedrooms;
                obj.bedrooms = r.listing.bedrooms;
                obj.bedrooms = r.listing.bedrooms;
                obj.bedrooms = r.listing.bedrooms;
                obj.bedrooms = r.listing.bedrooms;
                results.push(obj);
              } else {
                results.push(r);
              }
            }
          })
          if (data && data.metadata.pagination.next_offset < data.metadata.listings_count && offset <= 900) {
            offset += 50;
            setTimeout(function(){
              call(offset);
            }, 0);
          } else {
            console.log('finished', results);
            downloadData(results);
          }
        })
      }
    });
  } else {
    options['location'] = encodeURIComponent(d3.select('#location').property('value'));
    var offset = 0;
    call(0);
    function call(value){
      d3.json(buildURL(value), function(err,data){
        if (err) { console.log(err); }
        console.log(offset, data.metadata.listings_count);
        data.search_results.forEach(function(r){
          var obj = {};
          if (d3.select('#save-pictures').property('checked')) {
            obj.price = r.pricing_quote.nightly_price;
            obj.currency = r.pricing_quote.listing_currency;
            obj.bathrooms = r.listing.bathrooms;
            obj.beds = r.listing.beds;
            obj.city = r.listing.city;
            obj.instant_bookable = r.listing.instant_bookable;
            obj.lat = r.listing.lat;
            obj.lng = r.listing.lng;
            obj.name = r.listing.name;
            obj.person_capacity = r.listing.person_capacity;
            obj.reviews_count = r.listing.reviews_count;
            obj.type = r.listing.room_type;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            obj.bedrooms = r.listing.bedrooms;
            results.push(obj);
          } else {
            results.push(r);
          }
        })
        if (data && data.metadata.pagination.next_offset < data.metadata.listings_count && offset <= 900) {
          offset += 50;
          setTimeout(function(){
            call(offset);
          }, 0);
        } else {
          console.log('finished', results);
          downloadData(results);
        }
      })
    }
  }
}

function downloadData(data) {
  var today = new Date();
  var dateOk = today.getFullYear()+'-'+today.getMonth()+1+'-'+today.getDate();
  var outputName = 'airbnb-['+ options.user_lng+'-'+options.user_lat +']-'+ dateOk +'.json';
  var blob = new Blob([JSON.stringify(data,null,2)], {type: "data:text/json;charset=utf-8"});
  saveAs(blob, outputName);
}