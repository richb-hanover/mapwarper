var warpedmap;
var warped_wmslayer;
var maxOpacity = 1;
var minOpacity = 0.1;


function warpedinit() {
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
    var options_warped = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        numZoomLevels: 20,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
            20037508, 20037508.34),
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar()
        ]
    };

    warpedmap = new OpenLayers.Map('warpedmap', options_warped);
    // create OSM layer
    mapnik3 = mapnik.clone();
    warpedmap.addLayer(mapnik3);

    for (var i = 0; i < layers_array.length; i++) {
        warpedmap.addLayer(get_map_layer(layers_array[i]));
    }

    var warped_wms_url = warpedwms_url;
    
    if (use_tiles === true){
      warped_wmslayer =  new OpenLayers.Layer.TMS(I18n['warped']['warped_map'], warpedtiles_url, {
        type: 'png',
        getURL: osm_getTileURL,
        displayOutsideMaxExtent: true,
        transitionEffect: 'resize'
      });
    }else{
      warped_wmslayer = new OpenLayers.Layer.WMS(I18n['warped']['warped_map'],
        warped_wms_url, {
            format: 'image/png',
            status: 'warped'
        }, {
            TRANSPARENT: 'true',
            reproject: 'true',
            transitionEffect: null
        }, {
            gutter: 15,
            buffer: 0
        }, {
            projection: "epsg:4326",
            units: "m"
        }
      );
    }
    var opacity = .7;
    warped_wmslayer.setOpacity(opacity);
    warped_wmslayer.setIsBaseLayer(false);
    warpedmap.addLayer(warped_wmslayer);

    clipmap_bounds_merc = warped_bounds.transform(warpedmap.displayProjection, warpedmap.projection);

    if (mask_geojson) {
      var vector = new OpenLayers.Layer.Vector("GeoJSON", {
        projection: "EPSG:4326"
      });
      var gformat = new OpenLayers.Format.GeoJSON();
      vector.addFeatures(gformat.read(mask_geojson));
      warpedmap.zoomToExtent(vector.getDataExtent());
    } else {
      warpedmap.zoomToExtent(clipmap_bounds_merc);
    }

    //set up slider
    jQuery("#slider").slider({
        value: 100 * opacity,
        range: "min",
        slide: function(e, ui) {
            warped_wmslayer.setOpacity(ui.value / 100);
            OpenLayers.Util.getElement('opacity').value = ui.value;
        }
    });


}

function get_map_layer(layerid) {
    var newlayer_url = layer_baseurl + "/" + layerid;
    var map_layer = new OpenLayers.Layer.WMS(I18n['warped']['warped_layer']+" " + layerid,
        newlayer_url, {
            format: 'image/png'
        }, {
            TRANSPARENT: 'true',
            reproject: 'true'
        }, {
            gutter: 15,
            buffer: 0
        }, {
            projection: "epsg:4326",
            units: "m"
        }
    );
    map_layer.setIsBaseLayer(false);
    map_layer.visibility = false;

    return map_layer;
}

function changeOpacity(byOpacity) {
    var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
    newOpacity = Math.min(maxOpacity,
        Math.max(minOpacity, newOpacity));
    OpenLayers.Util.getElement('opacity').value = newOpacity;
    wmslayer.setOpacity(newOpacity);
}
