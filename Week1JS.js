        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Task', 'Amount of fuel'],
          ['Empty',     5000000],
          ['Full',      15000000],
        ]);

        var options = {
          title: 'none',
          colors: ['#000920', '#00F0FF',],
          backgroundColor: '#000920',
          pieSliceBorderColor: '#00F0FF',
          pieSliceTextStyle: {color: '#FFFFFF', fontSize: '32', fontName: 'Roboto',},
          legend: 'none',
          chartArea: {width:'95%',height:'95%'},
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }


var data1 = [
  {
    date  : '2019-01-01',
    value : 0
  },
  {
    date  : '2019-01-10',
    value : 19000
  },
  {
    date  : '2019-03-10',
    value : 28000
  },
  {
    date  : '2019-06-15',
    value : 32000
  },
  {
    date  : '2019-07-24',
    value : 32500
  },
  {
    date  : '2019-08-30',
    value : 32500
  },
  {
    date  : '2019-09-15',
    value : 28000
  },
  {
    date  : '2019-10-28',
    value : 0
  },

];


$(document).ready(function(){
  init();
  render();
    updateData(data1);

  d3.select(window).on('resize', function(){
    resize();
  });
});

var chartContainer;
var svg;
var marginContainer;
var x;
var y;
var xAxis;
var yAxis;
var width;
var height;
var line;
var area;
var startData;
var currentData = 'data1';

var margin = {top: 20, right: 30, bottom: 30, left: 40};
var maxWidth = 800 - margin.left - margin.right;

var detailWidth  = 150;
var detailHeight = 75;
var detailMargin = 15;

  var options = {
  annotations: {
    boxStyle: {
      // Color of the box outline.
      stroke: '#888',
      // Thickness of the box outline.
      strokeWidth: 1,
      // x-radius of the corner curvature.
      rx: 10,
      // y-radius of the corner curvature.
      ry: 10,
      // Attributes for linear gradient fill.
      gradient: {
        // Start color for gradient.
        color1: '#fbf6a7',
        // Finish color for gradient.
        color2: '#33b679',
        // Where on the boundary to start and
        // end the color1/color2 gradient,
        // relative to the upper left corner
        // of the boundary.
        x1: '0%', y1: '0%',
        x2: '100%', y2: '100%',
        // If true, the boundary for x1,
        // y1, x2, and y2 is the box. If
        // false, it's the entire chart.
        useObjectBoundingBoxUnits: true
      }
    }
  }
};


function init(){
  chartContainer = d3.select('.chart-container');
  svg = chartContainer.append('svg');
  marginContainer = svg.append('g').attr('class', 'margin-container');
}

function render(){
  var data = eval(currentData);

  var parse = d3.time.format( '%Y-%m-%d' ).parse;

  data = data.map( function( datum ){
    if(typeof datum.date == 'string'){
      datum.date = parse(datum.date);
    }

    return datum;
  } );

  getDimensions();

  svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  marginContainer
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x = d3.time.scale().range( [ 0, width ] );
  y = d3.scale.linear().range( [ height, 0 ] );
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.value; }) * 1.25]);

  area = d3.svg.area()
    .x( function( d )  { return x( d.date ); } )
    .y0( height )
    .y1( function( d ) { return y( d.value ); } );

  line = d3.svg.area()
    .x( function( d )  { return x( d.date ); } )
    .y( function( d ) { return y( d.value ); } );

  startData = data.map( function( datum ) {
    return {
      date  : datum.date,
      value : 0
    };
  } );

  xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  marginContainer.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  marginContainer.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', '1.5em')
    .style('text-anchor', 'end')
    .text('Speed (Km/h)');

  marginContainer.append( 'path' )
    .datum( startData )
    .attr('class', 'line')
    .attr( 'd', line )
    .transition()
    .duration( 500 )
    .ease('quad')
    .attrTween( 'd', function() {
      var interpolator = d3.interpolateArray( startData, data );

      return function( t ) {
        return line( interpolator( t ) );
      }
    } )
    .each('end', function() {
      drawCircles( data, marginContainer );
    });

  marginContainer.append( 'path' )
    .datum( startData )
    .attr('class', 'area')
    .attr( 'd', area )
    .transition()
    .duration( 500 )
    .ease('quad')
    .attrTween( 'd', function() {
      var interpolator = d3.interpolateArray( startData, data );

      return function( t ) {
        return area( interpolator( t ) );
      }
    } );
}









function drawCircle( datum, index ) {
  circleContainer.datum( datum )
    .append( 'circle' )
    .attr( 'class', 'circle' )
    .attr( 'r', 0 )
    .attr(
      'cx',
      function( d ) {
        return x( d.date );
      }
    )
    .attr(
      'cy',
      function( d ) {
        return y( d.value );
      }
    )
    .on( 'mouseenter', function( d ) {
      d3.select( this )
        .attr(
          'class',
          'circle active'
        )
        .attr( 'r', 7 );

      d.active = true;

      showCircleDetail( d );
    } )
    .on( 'mouseout', function( d ) {
      d3.select( this )
        .attr(
          'class',
          'circle'
        )
        .attr( 'r', 6 );

      if ( d.active ) {
        hideCircleDetails();

        d.active = false;
      }
    } )
    .on( 'click touch', function( d ) {
      if ( d.active ) {
        showCircleDetail( d )
      } else {
        hideCircleDetails();
      }
    } )
    .transition()
    .delay( 100 * index )
    .duration(750)
    .ease('elastic', 1.5, .75)
    .attr( 'r', 6 )
  ;
}

function drawCircles( data, container ) {
  circleContainer = container.append( 'g').attr('class', 'circles');
  data.forEach( function( datum, index ) {
    drawCircle( datum, index );
  } );
}

function hideCircleDetails() {
  circleContainer.selectAll( '.bubble' )
    .remove();
}

function showCircleDetail( data ) {
  var details = circleContainer.append( 'g' )
    .attr( 'class', 'bubble' )
    .attr(
      'transform',
      function() {
        var result = 'translate(';

        var xVal = x( data.date ) - detailWidth/2;
        if(xVal + detailWidth > width ){
          xVal = width - detailWidth;
        }
        else if(xVal < 0){
          xVal = 0;
        }

        result += xVal;
        result += ', ';
        result += y( data.value ) - detailHeight - detailMargin;
        result += ')';

        return result;
      }
    );

  details.append( 'rect' )
    .attr( 'width', detailWidth )
    .attr( 'height', detailHeight )
    .attr('rx', 5)
    .attr('ry', 5);

  var text = details.append( 'text' )
    .attr( 'class', 'text' );

  var dateFormat = d3.time.format("%m/%d/%Y");

  text.append( 'tspan' )
    .attr( 'class', 'Speed (Km/h)' )
    .attr( 'x', detailWidth / 2 )
    .attr( 'y', detailHeight / 3 )
    .attr( 'text-anchor', 'middle' )
    .text( 'Speed (Km/h): ' + data.value );

  text.append( 'tspan' )
    .attr( 'class', 'date' )
    .attr( 'x', detailWidth / 2 )
    .attr( 'y', detailHeight / 4 * 3 )
    .attr( 'text-anchor', 'middle' )
    .text( 'Date: ' + dateFormat(data.date) );
}

function updateData(data) {

  var parse = d3.time.format( '%Y-%m-%d' ).parse;

  data = data.map( function( datum ){
    if(typeof datum.date == 'string'){
      datum.date = parse(datum.date);
    }
    return datum;
  } );

  getDimensions();

  svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  marginContainer
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x = d3.time.scale().range( [ 0, width ] );
  y = d3.scale.linear().range( [ height, 0 ] );
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.value; }) * 1.25]);

  xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  area = d3.svg.area()
    .x( function( d )  { return x( d.date ); } )
    .y0( height )
    .y1( function( d ) { return y( d.value ); } );

  line = d3.svg.area()
    .x( function( d )  { return x( d.date ); } )
    .y( function( d ) { return y( d.value ); } );

  startData = data.map( function( datum ) {
    return {
      date  : datum.date,
      value : 0
    };
  } );

  marginContainer.select('.x.axis')
    .transition()
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  marginContainer.select('.y.axis')
    .transition()
    .call(yAxis);

  marginContainer.select( '.circles' ).remove();

  marginContainer.select('.line')
    .transition()
    .duration( 500 )
    .ease('quad')
    .attrTween( 'd', function() {
      var interpolator = d3.interpolateArray( startData, data );

      return function( t ) {
        return line( interpolator( t ) );
      }
    } )
    .each('end', function() {
      drawCircles( data, marginContainer );
    });

  marginContainer.select( '.area' )
    .transition()
    .duration( 500 )
    .ease('quad')
    .attrTween( 'd', function() {
      var interpolator = d3.interpolateArray( startData, data );

      return function( t ) {
        return area( interpolator( t ) );
      }
    } );
}

function getDimensions() {
  var containerWidth = parseInt(d3.select('.chart-container').style('width'));
  margin.top = 20;
  margin.right = 30;
  margin.left = 40;
  margin.bottom = 30;

  width = containerWidth - margin.left - margin.right;
  if(width > maxWidth){
    width = maxWidth;
  }
  height = .75 * width;
}

function resize(){
  updateData(eval(currentData));
}