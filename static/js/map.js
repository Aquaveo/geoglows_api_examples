function plotForecastStats(id) {
    $.ajax({
        type: 'GET',
        async: true,
        url: 'https://geoglows.ecmwf.int/api/ForecastStats/?return_format=json&reach_id=' + id,
        success: function (data) {
            fc.html('');
            let ts = data['time_series']
            let dt_rv = ts['datetime'].concat(ts['datetime'].slice().reverse());
            let traces = [
                {
                    name: 'Max/Min Flow (m^3/s)',
                    x: dt_rv,
                    y: ts['flow_max_m^3/s'].concat(ts['flow_min_m^3/s'].slice().reverse()),
                    mode: 'lines',
                    type: 'scatter',
                    fill: 'toself',
                    fillcolor: 'lightblue',
                    line: {color: 'darkblue', dash: 'dash'},
                },
                {
                    name: '25-75% Flow (m^3/s)',
                    x: dt_rv,
                    y: ts['flow_75%_m^3/s'].concat(ts['flow_25%_m^3/s'].slice().reverse()),
                    mode: 'lines',
                    type: 'scatter',
                    fill: 'toself',
                    fillcolor: 'lightgreen',
                    line: {color: 'darkgreen', dash: 'dash'},
                },
                {
                    name: 'Average Flow (m^3/s)',
                    x: ts['datetime'],
                    y: ts['flow_avg_m^3/s'],
                    mode: 'lines',
                    type: 'scatter',
                    fill: 'none',
                    line: {color: 'blue'},
                },
                {
                    name: 'High Res Flow (m^3/s)',
                    x: ts['datetime_high_res'],
                    y: ts['high_res'],
                    mode: 'lines',
                    type: 'scatter',
                    fill: 'none',
                    line: {color: 'black'},
                },
            ]
            Plotly.newPlot('forecast-chart', traces, {title: 'Forecasted Flow<br>Reach ID: ' + reach_id});
        }
    })
}

function mapClickEvent(event) {
    $("#chart_modal").modal('show');
    L.esri.identifyFeatures({
        url: 'https://livefeeds2.arcgis.com/arcgis/rest/services/GEOGLOWS/GlobalWaterModel_Medium/MapServer'
    }).on(map).at([event.latlng['lat'], event.latlng['lng']])
        .tolerance(10)  // map pixels to buffer search point
        .precision(3)  // decimals in the returned coordinate pairs
        .run(function (error, featureCollection) {
            if (error) {
                updateStatusIcons('fail');
                alert('Error finding the reach_id');
                return
            }
            reach_id = featureCollection.features[0].properties["COMID (Stream Identifier)"];
            plotForecastStats(reach_id);
        })
};

var map = L.map('map').setView([22.882798103393746, 84.03812416255175], 5);
L.esri.basemapLayer('Topographic').addTo(map);

L.esri.dynamicMapLayer({
    url: 'https://livefeeds2.arcgis.com/arcgis/rest/services/GEOGLOWS/GlobalWaterModel_Medium/MapServer',
    useCors: false,
    layers: [0],
}).addTo(map);

const fc = $("#forecast-chart");
let reach_id;

map.on("click", function (event) {
    mapClickEvent(event)
});
