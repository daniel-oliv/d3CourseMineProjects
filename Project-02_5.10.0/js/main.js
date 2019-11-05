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

var time = 0;

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
.range([height, 0])
.domain([0, 90]);
//= quando a população crescer 100x, 
//= a área tb cresce 100x, mas o raio cresce apenas 10x
var area = d3.scaleLinear()
	.domain([2e+3, 1.4e+9])
	.range([25*Math.PI, 1500]); //-raios de 5 a 39 pixels eu acho
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

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
	.tickFormat((d)=>{return +d;});
g.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(0," + height + ")")
	.call(yAxisCall);


var dataPromise = d3.json("data/data.json")

dataPromise.then(function(data){
	//console.log(data);

	const validatedData = data.map(
	(year)=>{
		return year.countries.filter(
			(country)=>{
				dataExist = country.income && country.life_exp;
				return dataExist;
			})
	}).map(
		(country)=>{
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		});
	//console.log(validatedData);

	d3.interval(()=>{
		time++;
		if(time >= validatedData.lenght) time = 0;

		PaymentRequestUpdateEvent(validatedData[time]);
	},100);

	//!First time, since the interval callback will just be called at the end of 100ms
	update(validatedData[0]);

	//! mínimo global das taxas obtido com dois d3.min incadiados
	//console.log(	d3.min(data, (d)=>{return 	d3.min(d.countries, (d)=>{return	d.income	 ;})	;})	);
	
})
.catch((error)=>{console.log(error);});

function update(data)
{
	var t = d3.transition()
		.duration(100);

	var circles = d3.selectAll("circle")
		.data(data, (d)=>{return d.country;});

	circles.exit()
		.attr("class", "exit")
		.remove();

	circles.enter()
		.append("circle")
		.attr("class", "enter")
		.attr("fill", (d)=>{return continentColor(d.continent);})
		//! a partir deste ponto tudo é aplicado para todos os elementos (os países que estavam no ano anterior e os que foram adicionados neste ano)
		//! assim, deve-se colocar apenas o que muda de um ano para o outro
		.merge(circles)
		.transition(t)
			.attr("cy", (d)=>{return height-y(d.life_exp);})
}