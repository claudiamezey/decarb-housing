// Claudia Mezey v1 20210426
// Adapted from Meli Harvey, NYC Sidewalk Widths project: https://github.com/meliharvey/sidewalkwidths-nyc
var data = {};
var chartsActive = false;
/* var lineColor = ["step", ["get", 'width']] */
var MAPBOX_TOKEN = 'pk.eyJ1IjoiY2xhdWRpYW1lemV5IiwiYSI6ImNpazJ4dWZ3ODAzZmN1Z20wbmZkcmJjemwifQ.oSkXi8-5sqC31_EmyLMJkA'
var MAPBOX_STYLE = 'mapbox://styles/claudiamezey/cklfx9ulz5bwk17nwntlkao4w'
var SHD_LAYER = 'https://d127oqi12dpd7v.cloudfront.net/features.geojson'
var UNITS = 'ft' // change to 'm' for meters
var PRECISION = 0.1 // the number of decimal places
// Create array for property classes
var GROUPS = [
  {
    "value": 0,
    "rating": "Property is at very low risk of carbon fines.  Emissions are below 2024 limit.",
    "color": "#9FCA4A",
    "label": "Achieving initial emissions target."
  },
  {
    "value": 1,
    "rating": "Property is at low risk of carbon fines.  Emissions exceed 2024 limit, but property is exempt pending maintenance of affordability restrictions.",
    "color": "#308282",
    "label": "Polluter, yet highly affordable. No fines unless change in affordability."
  },
  {
    "value": 2,
    "rating": "Property is at high risk of carbon fines.  Emissions exceed 2024 limit, and property is not sufficiently affordable for exemption.",
    "color": "#D95050",
    "label": "Polluter with lower affordability. At risk of fines."
  },
  {
    "value": 3,
    "rating": "Data Not Available",
    "color": "#484848",
    "label": "Data Not Available"
  },
]

function enterMap() {
  var x = document.getElementById('infoWindow')
  x.style.display = "none";
  x.classList.remove("landing");
  x.classList.add("menu")
  var y = document.getElementById('enter')
  y.style.display = "none";
  var z = document.getElementById('landingClose')
  z.style.display = "block";
}

function toggleWindow(id) {
  var x = document.getElementById(id);
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    var windows = document.querySelectorAll('.window');
    Array.prototype.forEach.call(windows, function(element, index) {
      if (element.id != id) {
        element.style.display = 'none';
      }
    });
  }
}

mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10', // Set style URL
        center: [-73.937193, 40.741203],
        zoom: 10.7
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
    map.addSource('points', {
        'type': 'geojson',
        'data': '/shd_features.geojson'
        });
        // https://d127oqi12dpd7v.cloudfront.net/features.geojson
        // Add a layer showing the points.  Color points by category.
        map.addLayer({
        'id': 'shd-layer',
        'type': 'circle',
        'source': 'points',
        'paint': {
          'circle-color': [
            'match',
            ['get', 'cat'],
            '0',
            '#9FCA4A',
            '1',
            '#308282',
            '2',
            '#D95050',
            '3',
            '#484848',
  /* other */ '#000000'
          ],
          'circle-radius': {
            'base': 2,
            'stops': [
            [12, 4],
            [22, 30]
            ]
          },
          'circle-opacity': [
            'match',
            ['get', 'cat'],
            '3', 
            0,
            0.95,
          ],
          'circle-stroke-width': [
            'match',
            ['get', 'cat'],
            '3', 
            0.3,
            0.5,
          ],
          'circle-stroke-color': '#383838'
        },
        });

        
 //  loadSummaryData(data, loadDistrictData);

  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
  });

  function addPopup(e) {

    map.getCanvas().style.cursor = 'pointer';

    var circleColor = e.features[0].layer.paint['circle-color'];
    var coordinates = e.lngLat;
    var subsidyName = e.features[0].properties.sub_subsidy_name;
    var assessedVal = e.features[0].properties.assessed_value;

    var assessedValform = assessedVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Group index is already equal to group value
    groupIndex = e.features[0].properties.cat;

    var description =
    '<div class="name">' + e.features[0].properties.address + '</div>' + 
    '<div class="det"><h4>Subsidy Program: </h4>' + subsidyName + '</div>' +
    '<div class="det"><h4>Expiry Year: </h4>' + e.features[0].properties.end_year + '</div>' +
    '<div class="val"><h4>Assessed Value ($USD): </h4>' + assessedValform + '</div>' +
    '<div class="message">' + GROUPS[groupIndex].rating + '</div>'

    popup.setLngLat(coordinates)
    popup.setHTML(description)
    popup.addTo(map)

    popup._content.style.color = circleColor
    popup._content.style.borderColor = circleColor

    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-bottom')) {
      popup._tip.style.borderTopColor = circleColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-top')) {
      popup._tip.style.borderBottomColor = circleColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-right')) {
      popup._tip.style.borderLeftColor = circleColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-left')) {
      popup._tip.style.borderRightColor = circleColor
    }

    popup.addTo(map)
}  
    // Change the cursor to a pointer.
    // Must revise.
    
      map.on('mousemove', 'shd-layer', function(e) {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('click', 'shd-layer', function(e) {
        addPopup(e);
      });
    
      map.on('mouseleave', 'shd-layer', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });
});   

/*  // Additional layer for 2030-2034 data
map.addLayer({
  'id': '2030-2034',
  'type': 'circle',
  'source': 'points',
  'paint': {
    'circle-color': [
      'match',
      ['get', 'cat2'],
      '0',
      '#9FCA4A',
      '1',
      '#308282',
      '2',
      '#D95050',
      '3',
      '#484848',
'#000000'
],
'circle-radius': {
  'base': 2,
  'stops': [
  [12, 4],
  [22, 30]
  ]
},
'circle-opacity': [
  'match',
  ['get', 'cat2'],
  '3', 
  0,
  0.95,
],
'circle-stroke-width': [
  'match',
  ['get', 'cat2'],
  '3', 
  0.3,
  0.5,
],
'circle-stroke-color': '#383838'
},
'layout': {
'visibility': 'hidden'
}
});

// Toggle layers on/off
map.on('idle', function () {
      if (map.getLayer('2024-2029') && map.getLayer('2030-2034')) {
        // Enumerate ids of the layers.
        var toggleableLayerIds = ['2024-2029', '2030-2034'];
        // Set up the corresponding toggle button for each layer.
    
        for (var i = 0; i < toggleableLayerIds.length; i++) {
          var id = toggleableLayerIds[i];
          if (!document.getElementById(id)) {
          // Create a link.
            var link = document.createElement('a');
            link.id = id;
            link.href = '#';
            link.textContent = id;
            link.className = 'active';
        
            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
              var clickedLayer = this.textContent;
              e.preventDefault();
              e.stopPropagation();
              
              var visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
              );
            
              // Toggle layer visibility by changing the layout object's visibility property.
              if (visibility === 'visible') {
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'none'
                );
                this.className = '';
    
                } 
              else {
                this.className = 'active';
                map.setLayoutProperty(
                  clickedLayer,
                  'visibility',
                  'visible'
                  );
                }
            };
            
            var layers = document.getElementById('toggle');
            layers.appendChild(link);
          }
        }
}*/


// add a legend item
function addLegendItem(item) {

  var table = document.getElementById("legend-main");
  var trow = table.insertRow();

  var labelCell = trow.insertCell(0);
  var colorCell = trow.insertCell(1);


  trow.classList.add("trow");
  labelCell.classList.add("labelCell");
  colorCell.classList.add("colorCell");

  labelCell.innerHTML = item.label;

  //colorCell.setAttribute("style", "background: linear-gradient(90deg, #ffffff 0% 25%, " + item.color + " 25% 75%," + "#ffffff 75% 100%);");
  colorCell.setAttribute("style", "background: linear-gradient(180deg, #ffffff 0% 25%, " + item.color + " 25% 75%," + "#ffffff 75% 100%);");
  document.getElementById("legend-main").appendChild(trow);

}

GROUPS.forEach(addLegendItem);

// Create summary chart - code adapted from Mike Bostock 

// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 120, left: 40},
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart_toPlot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
     

// Parse the Data

d3.csv("./results.csv", function(data) {
  console.log(data)
  // List of subgroups = header of the csv file
  var subgroups = data.columns.slice(1)

  // List of groups = value of the first column called year
  var groups = d3.map(data, function(d){return(d.year)}).keys()
  

  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class","axes")
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 500])
    .range([ height, 0 ]);
  svg.append("g")
    .attr("class","axes")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#9FCA4A','#308282','#D95050'])

  svg.append("text")
    .attr("y",-20)
    .attr("x",25)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("No. of Properties")
    .style("fill","rgb(56,56,56)")
    .style("font-family","Andale Mono")
    .style("font-size","11px");

  // Add x axis label
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + 27) + ")")
    .style("text-anchor", "middle")
    .style("fill","rgb(56,56,56)")
    .style("font-family","Andale Mono")
    .style("font-size","11px")
    .text("Affordability Expiry Years");
  
  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
      .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return xSubgroup(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return color(d.key); });

  // Create legend for chart
  svg.append("rect")
  .attr('x', 1)
  .attr('y', 190)
  .attr('width', 8)
  .attr('height', 8)
  .attr('stroke', 'rgb(100,100,100)')
  .attr('fill', '#9FCA4A');
  svg.append("text")
  .attr('x', 13)
  .attr('y', 198)
  .style('text-anchor','left')
  .style('font-family', 'Andale Mono')
  .style('fill', 'rgb(100,100,100)')
  .style('font-size','8px')
  .text("Below 2024 CO2 limit");
  svg.append("rect")
  .attr('x', 1)
  .attr('y', 203)
  .attr('width', 8)
  .attr('height', 8)
  .attr('stroke', 'rgb(100,100,100)')
  .attr('fill', '#308282');
  svg.append("text")
  .attr('x', 13)
  .attr('y', 211)
  .style('text-anchor','left')
  .style('font-family', 'Andale Mono')
  .style('fill', 'rgb(100,100,100)')
  .style('font-size','8px')
  .text("Above limit, sufficiently affordable & no fines");
  svg.append("rect")
  .attr('x', 1)
  .attr('y', 216)
  .attr('width', 8)
  .attr('height', 8)
  .attr('stroke', 'rgb(100,100,100)')
  .attr('fill', '#D95050');
  svg.append("text")
  .attr('x', 13)
  .attr('y', 224)
  .style('text-anchor','left')
  .style('font-family', 'Andale Mono')
  .style('fill', 'rgb(100,100,100)')
  .style('font-size','8px')
  .text("Above limit, fined");
})