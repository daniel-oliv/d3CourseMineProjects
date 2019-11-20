/*
*    main.js
*    Mastering Data Visualization with D3.js
*    6.8 - Line graphs in D3
*/
var filteredData;
var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y");
var timeFormat = d3.timeFormat("%d/%m/%Y");
// For tooltip
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var t = function(){ return d3.transition().duration(1000); }

// Add line to chart
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom()
    .ticks(4);
var yAxisCall = d3.axisLeft();

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");
    
// X-Axis label
g.append("text")
    .attr("class", "x axisLabel")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Time");
// Y-Axis label
g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height/2)
    .attr("font-size", "20px")
    .style("text-anchor", "middle")
    .text("Price (USD)");

// Line path generator
// var line = d3.line();
    // .x(function(d) { return x(d.date); })
    // .y(function(d) { return y(d[selectedAttribute]); });

// Event listeners
$("#coin-select").on("change", function(){update();})
$("#var-select").on("change", function(){update();})

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(timeFormat(new Date(ui.values[0])));
        $("#dateLabel2").text(timeFormat(new Date(ui.values[1])));
        var dateValues = $("#date-slider").slider("values");
        //console.log("dateValues ", timeFormat(dateValues[0]) );
        //console.log("ui values ", timeFormat(ui.values[0]) );
        update(ui.values);
    }
});

/******************************** Tooltip Initialization Code ********************************/
var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

var overlay =  svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
overlay  
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    

d3.json("data/coins.json").then(function(data) {
    //console.log("data ", data);

    // getting the keys
    for (const coin in data) {
        //! Usado para evitar manipular uma propriedade herdada como o toString ou outra coisa kkkk
        //= hasOwnProperty retorna true se o obj possui a propriedade passada como parâmetro (exceto herdada, como toString) 
        if (!data.hasOwnProperty(coin)) {
            //! se não é uma coin, isto é, uma propriedade do obj não herdada,
            //! pula para a próxima propriedade do objeto 
            continue;
        }
        var coinKeys = d3.keys(data[coin][0]).filter((d)=>{return d != "date"});
        //console.log(coinKeys);
        break;
    }

    // Data cleaning
    filteredData = {};
    for (const coin in data) {
        //! Usado para evitar manipular uma propriedade herdada como o toString ou outra coisa kkkk
        //= hasOwnProperty retorna true se o obj possui a propriedade passada como parâmetro (exceto herdada, como toString) 
        if (!data.hasOwnProperty(coin)) {
            //! se não é uma coin, isto é, uma propriedade do obj não herdada,
            //! pula para a próxima propriedade do objeto 
            continue;
        }
        filteredData[coin] = data[coin].filter((d)=>{
            return !(d["price_usd"] == null);
        });

        filteredData[coin].forEach(d => {
            //= transformando em números
            for (const key of coinKeys) {
                d[key] = +d[key];
            }
            //= transformando em data Obj
            d["date"] = parseTime(d["date"])
        });
    }
   //console.log("filteredData ", filteredData);    

    //= acabando de carregar os dados, chamar a função update para construi o gráfico de acordo com os selects e controles de GUI
    update();
});

function update(dateLimits = $("#date-slider").slider("values"))
{
    var selectedCoin = $("#coin-select").val(),
        selectedAttribute = $("#var-select").val();

    //console.log("update - slider obj ", $("#date-slider").slider);
   //console.log("update - selectedCoin ", selectedCoin);
   //console.log("update - selectedAttribute ", selectedAttribute);
   //console.log("update - dateLimits ", dateLimits);
   //console.log("update - filteredData ", filteredData);
    var dataTimeFiltered = filteredData[selectedCoin].filter(function(d){
        return (d.date >= dateLimits[0] && d.date <= dateLimits[1]);
    });
   //console.log("dataTimeFiltered", dataTimeFiltered)

    x.domain(d3.extent(dataTimeFiltered, function(d){ return d.date; }));
    y.domain([d3.min(dataTimeFiltered, function(d){ return d[selectedAttribute]; }) / 1.005, 
        d3.max(dataTimeFiltered, function(d){ return d[selectedAttribute]; }) * 1.005]);

    //+ só para tirar o G e por o B de billion
    var formatSi = d3.format(".2s");
    function formatAbbreviation(value) {
      var s = formatSi(value);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    // Update axes
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

    //+ tooltip updating
    function onMousemove() {
        
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(dataTimeFiltered, x0, 1),
            d0 = dataTimeFiltered[i - 1],
            d1 = dataTimeFiltered[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[selectedAttribute]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[selectedAttribute].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", height - y(d[selectedAttribute]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));

        //console.log("x0", x0);
        //console.log("i", i);
        //console.log("d0", d0);
        //console.log("d1", d1);
    }
   //console.log("before updating");
    overlay.on("mousemove", null);
    overlay.on("mousemove", onMousemove);

    line = d3.line()
        .x(function(d){ return x(d.date);    })
        .y(function(d){ return y(d[selectedAttribute]);    })

    g.select(".line")
        .transition(t)
        .attr("d", line(dataTimeFiltered));

    

}

