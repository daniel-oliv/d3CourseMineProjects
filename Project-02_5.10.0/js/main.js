/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var completeHeight = 500; 
	completeWidth = 800;

//= left and top are bigger to comport axis' labels
var margin = { left: 80, right: 20, top:50, bottom: 100 };
console.log("transform", "translate(" + margin.left + "," + margin.top +")");
//= drawing area dimensions
var height = completeHeight - margin.top - margin.bottom;
	width = completeWidth - margin.left - margin.right;

//= create a group that is positioned at begining of the drawing area
var g = d3.select("#chart-area")
	.append("svg")
		.attr("width", completeWidth)
		.attr("height", completeHeight)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top +")");

// Labels
var xLabel = g.append("text")
	.attr("x", width / 2 )
	.attr("y", height + 50 )
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)");
var yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("x", -170 )
	.attr("y", -40)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)");
var timeLabel = g.append("text")
	.attr("x", width - 40)
	.attr("y", height - 10 )
	.attr("font-size", "40px")
	.attr("text-anchor", "middle")
	.attr("opacity", "0.4")
	.text("1800");

// Scales
//- income
var x = d3.scaleLog()
	.base(10)
	.domain([142, 150000])
	.range([0, width]);
//- life expenctancy
var y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0]);

// Axis

var baseGDPTick = 150;
var numOfTicks = 4;
var xTicksToShow = [baseGDPTick];
for (let index = 1; index < numOfTicks; index++) {
	xTicksToShow.push(xTicksToShow[index-1]*10);
}
var xAxisCall = d3.axisBottom(x)
	.tickValues([baseGDPTick, baseGDPTick*10, baseGDPTick*100])
	.tickFormat(d3.format("$"));
g.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxisCall);

var yAxisCall = d3.axisLeft(y)
	//.tickFormat(d3.format("$"));
g.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxisCall);


var dataPromise = d3.json("data/data.json")

dataPromise.then(function(data){
	console.log(data);

	var yData = data[0].countries;
	// console.log(yData);
	// yData.forEach(element => {
	// 	console.log(element.income);
	// });

	//! mínimo global das taxas obtido com dois d3.min incadiados
	//console.log(	d3.min(data, (d)=>{return 	d3.min(d.countries, (d)=>{return	d.income	 ;})	;})	);
	
});
