var visas = []
d3.csv("reduced_data/2012_2013_perm_newyorkcity.csv", function(data)
	{
		for(visa in data){
			visas.push(data[visa]);
		}
		//console.log("visas",visas);
		filteredData = targetData("All", "All","All")
		
		//console.log(mapTally(filteredData))
		drawBarGraph(barTally(filteredData))
		drawMap(mapTally(filteredData), "All")
		drawHistogram(mapTally(filteredData), "All")
		textTally(filteredData)
		d3.selectAll("#keyAll")
		.on("click", function(){
			drawWithKey("All")
		})
		d3.selectAll("#keyAccepted")
		.on("click", function(){
			drawWithKey("Accepted")
		})
		d3.selectAll("#keyWithdrawn")
		.on("click", function(){
			drawWithKey("Withdrawn")
		})
		d3.selectAll("#keyDenied")
		.on("click", function(){
			drawWithKey("Denied")
		})
	}
)
function drawWithKey(Status){
	
	
	if(Status == "All"){
		d3.selectAll("#vizTitle").html("All Applications")
	}else{
		d3.selectAll("#vizTitle").html("All "+ Status)
	}
	var filteredData = targetData("All", Status, "All")
	textTally(filteredData)
	d3.selectAll(".histogram rect").remove()
	d3.selectAll(".map path").remove()
	d3.selectAll(".stackedBarGraph rect").remove()
	d3.selectAll(".stackedBarGraph text").remove()
	d3.selectAll(".barchart svg").remove()
	drawBarGraph(barTally(filteredData))
	drawMap(mapTally(filteredData), Status)
	drawHistogram(mapTally(filteredData), Status)
	
}
function drawWithText(Sector){
	d3.selectAll(".histogram rect").remove()
	d3.selectAll(".map path").remove()
	drawMap(mapTally(targetData("All", "All",Sector)), "All")
	drawHistogram(mapTally(targetData("All","All",Sector)), "All")
}
//filters data
function targetData(Country, Status, Sector){
	targetCountry=[]
	targetCountryStatus=[]
	targetCountryStatusSector=[]
	for(visa in visas){
		if(Country == "All"){
			targetCountry.push(visas[visa])
		}else if (visas[visa]["Origin Country"].toLowerCase()== Country.toLowerCase()){
			targetCountry.push(visas[visa])
		}
	}
	for (visa in targetCountry){
		if(Status == "All"){
			targetCountryStatus.push(targetCountry[visa])
		}else if (targetCountry[visa]["Status"] == Status){
			targetCountryStatus.push(targetCountry[visa])
		}
	}
	for (visa in targetCountryStatus){
		if (Sector == "All"){
			targetCountryStatusSector.push(targetCountryStatus[visa])
		}else if(targetCountryStatus[visa]["Economic Sector"]== Sector){
			targetCountryStatusSector.push(targetCountryStatus[visa])
		}
	}
	return targetCountryStatusSector
}

// formats filtered data for stacked bar
function barTally(targetCountryStatusSector){
	//tally by sector then status
	var bySector = {
		    "Advanced Manufacturing":{},
		    "Aerospace":{},
		    "Agribusiness":{},
		    "Automotive":{},
		    "Biotechnology":{},
		    "Construction":{},
		    "Educational Services":{},
		    "Energy":{},
			"Finance":{},
		    "Geospatial":{},
		    "Health Care":{},
		    "Homeland Security":{},
		    "Hospitality":{},
		    "IT":{},
		    "Retail":{},
		    "Transportation":{},
			"Other":{}
		}
	for(visa in targetCountryStatusSector){
		var currentSector = targetCountryStatusSector[visa]["Economic Sector"];
		var currentStatus = targetCountryStatusSector[visa]["Status"];
		if(bySector[currentSector] != undefined){
		if(bySector[currentSector][currentStatus]== undefined){
			bySector[currentSector][currentStatus]=[]
			bySector[currentSector][currentStatus].push(targetCountryStatusSector[visa])
		}else{
			bySector[currentSector][currentStatus].push(targetCountryStatusSector[visa])
		}
	}
	}
	//console.log(bySector)
	barStats = []
	for (sector in bySector){
		var cCount = null
		var dCount = null
		var wCount = null
//		console.log(bySector[sector])
		if(bySector[sector]["Accepted"]!= undefined){
			cCount = bySector[sector]["Accepted"].length
		}
		if(bySector[sector]["Withdrawn"]!= undefined){
			wCount = bySector[sector]["Withdrawn"].length
		}
		if(bySector[sector]["Denied"]!= undefined){
			dCount = bySector[sector]["Denied"].length
		}
		var sum = cCount+wCount+dCount
		barStats.push([sector,cCount,wCount,dCount,sum])
	}
	//sort by decreasing value
	function sortByValue(a,b){return a[4]-b[4];}
	barStats.sort(sortByValue)
	barStats.reverse()
	return(barStats)
}

//formats filtered data for map and histogram
function mapTally(targetCountryStatusSector){
	//tally by country
	var byCountry = {}
	for(visa in targetCountryStatusSector){
		var currentCountry = targetCountryStatusSector[visa]["Origin Country"]
		if(byCountry[currentCountry]==undefined){
			byCountry[currentCountry]=[]
			byCountry[currentCountry].push(targetCountryStatusSector[visa])
		}else{
			byCountry[currentCountry].push(targetCountryStatusSector[visa])
		}
	}
	//console.log(byCountry)
	var mapStats=[]
	for(country in byCountry){
		var currentCountry = byCountry[country]
		mapStats.push([country.toLowerCase(), byCountry[country].length])
	}
	return mapStats
}

function histTally(targetCountryStatusSector){	
}
function textTally(targetCountryStatusSector){
	//tally by job description
	var jobDescription = {}
	for(visa in targetCountryStatusSector){
		var currentJob = targetCountryStatusSector[visa]["Job Title"]
		if(currentJob != "Not Available"){
		if(jobDescription[currentJob]==undefined){
			jobDescription[currentJob]=[]
			jobDescription[currentJob].push(targetCountryStatusSector[visa]["Job Title"])
		}else{
			jobDescription[currentJob].push(targetCountryStatusSector[visa]["Job Title"])
		}
	}
	}
	var jobDescriptionFreq = []
	for (job in jobDescription){
		jobDescriptionFreq.push([jobDescription[job][0], jobDescription[job].length])
	}
	jobDescriptionFreq.sort(function(a,b) {return a[1] > b[1];});
	var totalJobsDiversity = jobDescriptionFreq.length
	jobDescriptionFreq.reverse();
	jobDescriptionFreq.splice(5,jobDescriptionFreq.length-5);
	jobDescriptionFreq = jobDescriptionFreq.map(function(a){return a[0] + " " + a[1]})
	//console.log("Top Jobs: ", jobDescriptionFreq)
	//tally by status rate
	var totalVisas = targetCountryStatusSector.length 
	//console.log("Number of Visas:", totalVisas)
	//console.log("Job Diversity: ", totalJobsDiversity)
	var countryDiversity = 	mapTally(targetCountryStatusSector).length

	var statusPercentages = tallyStatus(targetCountryStatusSector)
	//console.log(statusPercentages.length)
	if(statusPercentages.length == 2){
		statusPercentages = ""
	}else{
	statusPercentages=statusPercentages.join(" ")
	}	
	jobDescriptionFreq=jobDescriptionFreq.join("</br>")
	if( countryDiversity == 1){
		d3.selectAll("#visaDetails").html("<span style = \"color: black;font-size:18px\">Details</span></br>"+totalVisas +" Visas in "+totalJobsDiversity+ " Types of Jobs</br>"+statusPercentages+"</br>Top Jobs:</br> "+ jobDescriptionFreq)
	}else{
	d3.selectAll("#visaDetails").html("<span style = \"color: black; font-size:18px\">Details</span></br>"+totalVisas +" Visas from "+countryDiversity+" countries in "+totalJobsDiversity+" Types of Jobs</br>"+statusPercentages+"</br>Top Jobs:</br> "+ jobDescriptionFreq)
	}
}
function tallyStatus(targetCountryStatusSector){
	var statusTally = {}
	for(visa in targetCountryStatusSector){
		var currentStatus = targetCountryStatusSector[visa]["Status"]
		if(statusTally[currentStatus]==undefined){
			statusTally[currentStatus]=[]
			statusTally[currentStatus].push(targetCountryStatusSector[visa]["Status"])
		}else{
			statusTally[currentStatus].push(targetCountryStatusSector[visa]["Status"])
		}
	}
	var total = targetCountryStatusSector.length
	var statusFreq = []
	for (Status in statusTally){
		statusFreq.push(d3.round(statusTally[Status].length/total*100)+"% "+statusTally[Status][0])
	}
	console.log(statusFreq)
	console.log(total)
	return statusFreq
}

//draw stacked bar
function drawBarGraph(dataset){
	var w = 280;
	var h = 400;
	
	var svg = d3.select("div.barchart")
		.append("svg:svg")
		.attr("width", h)
		.attr("height", w)
		.append("svg:g")
		.attr("class", "svg")
		.attr("transform", "rotate(90 0 0)");
	
	var svg2 = d3.select("div.barchart")
		.append("svg:svg")
		.attr("class", "svg2")
		.attr("width", 125)
		.attr("height", 242)
		.append("svg:g");
//	console.log("draw bar")
	p = [0, 50, 30, 20],
    x = d3.scale.ordinal().rangeRoundBands([0, w-30]),
    y = d3.scale.linear().range([0, h-140]),
    z = d3.scale.ordinal().range(["#59D984","#EDA52B","#E63D25"]);
	
	var remapped = ["Accepted", "Withdrawn", "Denied"].map(function(dat,i){
		//console.log(dat)
		return dataset.map(function(d, ii){
			return {x:ii, y: d[i+1], type: dat}
		})
	})
	//console.log("mapped: ",remapped)
	
	var stacked = d3.layout.stack()(remapped)
	//console.log("stacked: ", stacked)
	
	x.domain(stacked[0].map(function(d) { return d.x; }));
	y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);
	//console.log("x.domain(): " + x.domain())
	//console.log("y.domain(): " + y.domain())
	var max =d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })

	var yScale = d3.scale.linear().range([15, h-118])
		.domain([max,0]);
	var formatxAxis = d3.format('.0f');
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickValues(yScale.domain())
		.orient("right")
		.tickFormat(formatxAxis);	

	svg.append("g")
		.attr("class", "x axis")
		.attr("fill", "#aaa")
		//.attr("transform", "translate(245,-400)")
		.call(yAxis)
		.selectAll("text")
		.attr("y",12)
		    .attr("x", 0)
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "end");	
	var stackedBarGraph = svg.selectAll("g.stackedBarGraph")
	            .data(stacked)
	            .enter()
				.append("svg:g")
	            .attr("class", "stackedBarGraph")
	            .style("fill", function(d, i) { return z(i); });
				
	var rect = stackedBarGraph.selectAll("rect")	
	            .data(function(d){return d;})
	            .enter()
				.append("svg:rect")
	            .attr("x", function(d) { return x(d.x); })
	            .attr("y", function(d) { return -y(d.y0) - y(d.y)-120; })
	            .attr("height", function(d) { 
					if(y(d.y) < 2 && y(d.y)!=0 ){
						return 2
					}else{
					return y(d.y);}
				 })				 
	            .attr("width", x.rangeBand()-3)
				.attr("opacity", 0)
				.transition()
				.duration(400)
				.attr("opacity",.5)
	//labels
	stackedBarGraph.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d){return d[0]})
		.attr("fill", "#aaa")
		.attr("font-size", "9px")
		.attr("x", function(d,i){
			return 115
		})
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-90)")
		.attr("y", function(d,i){
			return 15+i*(w/(dataset.length)-2.5)
		})
		.on("mouseover", function(){
			d3.select(this).attr("fill", "black")
		})
		.on("mouseout", function(){
			d3.select(this).attr("fill", "#aaa")
		})
		.on("click", function(d,i){
			var Sector = dataset[i][0]
			console.log(Sector)
			drawWithText(Sector)
			d3.selectAll("#vizTitle").html("All "+Sector)
			var filteredData = targetData("All","All", Sector)
			textTally(filteredData)
			d3.selectAll(".stackedBarGraph rect").remove()
			d3.selectAll(".stackedBarGraph text").remove()
			d3.selectAll(".barchart svg").remove()
			drawBarGraph(barTally(filteredData))
		})
	//Interaction
	stackedBarGraph.selectAll("rect")
			.on("mouseover", function(){
					d3.select(this).attr("opacity", 1)
					//html text = stats
			})
			.on("mouseout", function(){
				d3.select(this).attr("opacity", .5)
				d3.selectAll(".clicked").attr("opacity", 1)
			})
			.on("click", function(d,i){
				d3.selectAll("rect").attr("class","unclicked")
				d3.select(this).attr("class","clicked")
				console.log(this)
				d3.selectAll(".unclicked").attr("opacity", .5)
				d3.selectAll(".clicked").transition().attr("opacity", 1)
				var Status = d.type
				var Sector = (dataset[i][0])
				var filteredData = targetData("All", Status, Sector)
				
				console.log("visas",visas.length)
				//erase map /redraw map
				d3.selectAll(".map path").remove()
				drawMap(mapTally(filteredData), Status)
				//reset bar / redraw histogram
				d3.selectAll(".histogram rect").remove()
				drawHistogram(mapTally(filteredData), Status)
				d3.selectAll("#vizTitle").html(Status+" "+Sector)
				textTally(filteredData )
				d3.selectAll(".stackedBarGraph rect").remove()
				d3.selectAll(".stackedBarGraph text").remove()
				d3.selectAll(".barchart svg").remove()
				drawBarGraph(barTally(filteredData))
			})
}

//draw map
function drawMap(dataset, Status){
	console.log("map")
	var width = 650;
	var height = 400;
	var mpa = d3.map();
	var projection = d3.geo.mercator()
		.scale(120)
		.translate([width/2-40, height/2+40]);
	var path = d3.geo.path()
		.projection(projection);
	var map = d3.select("div.map")
		.append("svg:svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height)
		.append("svg:g")
	if (Status == "Accepted"){
		maxColor = "green"
	}else if (Status == "Withdrawn"){
		maxColor = "orange"
	}else if (Status == "Denied"){
		maxColor = "red"
	}else if (Status == "All"){
		maxColor = "black"
	}
	
	
	d3.json("world.geojson", function(json){
		var mapValues = []
		for(var i = 0; i < dataset.length; i++){
			var dataCountry = dataset[i][0].toLowerCase();
			var dataValue = dataset[i][1];
			mapValues.push(dataValue);
			for(var j = 0; j < json.features.length; j++){
				var jsonCountry = json.features[j].properties.name.toLowerCase();
				if(dataCountry == jsonCountry){
					json.features[j].properties.value = dataValue;
					break;
				}				
			}
			
		}		
	function sortByValue(a,b){
		if(a["properties"]["value"] == undefined){
			a["properties"]["value"] = 0
		}else if(b["properties"]["value"] == undefined){
			b["properties"]["value"] = 0
		}
	return a["properties"]["value"]-b["properties"]["value"];
	}
	
	json.features.sort(sortByValue)
	json.features.reverse();
	console.log(json.features)
	
	var color = d3.scale.sqrt().range(["#fff", maxColor])	
		color.domain([0,d3.max(mapValues)])
	map.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		//.style("stroke", "#fff")
		.style("fill", function(d){
			var value = d.properties.value;
			if(d.properties.name == "United States"){
				return "#fff"
			}
			if(value){
				return color(value);
			}else{
				return "#fff";
			}
		})
		.attr("opacity",.5)
		.style("stroke", function(d){
			if(d.properties.name == "United States"){
				return "#eee"
			}
		})
	map.selectAll("path").attr("class","mapunclicked")
	
	map.selectAll("path")
	.on("mouseover", function(d,i){
		//var currentColor = this.style["fill"]
		d3.select(this).transition().attr("opacity", 1)
		d3.selectAll("#countryLabel").html(d.properties.name)
		var Country = json.features[i].properties.name.toLowerCase()
		d3.selectAll(".histogram rect")
		.transition()
		.attr("opacity", function(d,i){
			//console.log(Country, d[0])
			if (Country.toLowerCase() == d[0]){
				return 1
			}else{
				return .5
			}
		})
	})
	.on("mouseout", function(){
		var currentColor = this.style["fill"]
		d3.select(this).transition().attr("opacity", .5)
		//d3.selectAll(".mapunclicked").transition().attr("opacity", .5)
		d3.selectAll(".mapunclicked").attr("opacity", .5)
		d3.selectAll("#countryLabel").html("")
		
	})
	.on("click", function(d,i){		
		d3.selectAll("path").attr("class","mapunclicked")
		d3.selectAll(".mapunclicked").transition().style("fill", "#ddd")
		d3.selectAll(".mapunclicked").attr("opacity", .5)
		
		d3.select(this).attr("class","mapclicked")
		d3.selectAll(".mapclicked").transition().style("fill", "#444")
		
		//take away graph
		d3.selectAll(".stackedBarGraph rect").remove()
		d3.selectAll(".stackedBarGraph text").remove()
		d3.selectAll(".barchart svg").remove()
		
		//redraw histogram
		//d3.selectAll(".histogram rect").remove()
		//var allData = targetData("All", "All", "All")
		//drawHistogram(mapTally(allData),"All")
		//redraw graph
		var Status = "All"
		var Sector = "All"
		var Country = json.features[i].properties.name.toUpperCase()
		var currentData = targetData(Country, Status, Sector)
		d3.selectAll(".histogram rect")
		.transition()
		.attr("fill", function(d,i){
			//console.log(Country, d[0])
			if (Country.toLowerCase() == d[0]){
				return "#444"
			}else{
				return "#aaa"
			}
		})
		
		var filteredData = targetData(Country, "All","All")
		drawBarGraph(barTally(filteredData))
		var filteredData = targetData(Country, "All","All")
		textTally(filteredData)
		//format country string
		var countryNameCap =''
		var Country = Country.toLowerCase().split(' ')
		for(var c=0; c< Country.length; c++){
			countryNameCap += Country[c].substring(0,1).toUpperCase() + Country[c].substring(1,Country[c].length) +' ';
		}
		d3.selectAll("#vizTitle").html("All Applicatons from "+ countryNameCap)
		if(Country == "UNITED STATES"){
			console.log("USA")
			d3.selectAll("#vizTitle").html("United States: No Visas")
			d3.selectAll("#vizDetails").html("United States: No Visas")
		}
	})
	})
}

//draw histogram
function drawHistogram(dataset, Status){
console.log("histogram")
var width = 660;
var height = 100;
var heightScale =d3.scale.linear().domain([1,1000]).range([8,height])
if (Status == "Accepted"){
	maxColor = "green"
}else if (Status == "Withdrawn"){
	maxColor = "orange"
}else if (Status == "Denied"){
	maxColor = "red"
}else if (Status == "All"){
	maxColor = "black"
}
var histogramSVG = d3.select("div.histogram")
.append("svg:svg")
.attr("class", "histogram")
.attr("width", width)
.attr("height", height)
.append("svg:g");

function sortByValue(a,b){
return a[1]-b[1];
}
dataset.sort(sortByValue)
dataset.reverse();
//console.log("before x")
//console.log("sorted", dataset)
//console.log(dataset.length)
d3.json("world.geojson", function(json){
	var mapValues = []
	for(var i = 0; i < dataset.length; i++){
		var dataCountry = dataset[i][0].toLowerCase();
		var dataValue = dataset[i][1];
		mapValues.push(dataValue);
		for(var j = 0; j < json.features.length; j++){
			var jsonCountry = json.features[j].properties.name.toLowerCase();
			if(dataCountry == jsonCountry){
				json.features[j].properties.value = dataValue;
				break;
			}
		}
	}
	var color = d3.scale.sqrt().range(["#fff", maxColor])	
		color.domain([0,d3.max(mapValues)])

histogramSVG.selectAll("rect")
	.data(dataset)
	.enter()
	.append("svg:rect")
	.attr("x", function(d,i){
	return i*(width/dataset.length)
	})
	.attr("y", function(d,i){
	return height- heightScale(dataset[i][1])
	})
	.attr("width",function(d,i){
	return (width/dataset.length-1)
	})
	.attr("height", function(d,i){
	return heightScale(dataset[i][1])
	})
	.attr("fill", maxColor)
	.attr("opacity", .3);
	
histogramSVG.selectAll(".histogram rect").attr("class", "histunclicked");	
histogramSVG.selectAll("rect")
	.on("mouseover", function(d,i){
		var currentColor = this.style["fill"]
		d3.select(this).transition().attr("opacity", 1)
		var Country = dataset[i][0]
		var countryNameCap =''
		var Country = Country.toLowerCase().split(' ')
		for(var c=0; c< Country.length; c++){
			countryNameCap += Country[c].substring(0,1).toUpperCase() + Country[c].substring(1,Country[c].length) +' ';
		}
		d3.selectAll("#countryLabel").html(countryNameCap)
		var Country = d[0]
		var currentData = targetData(Country, Status, Sector)
		d3.selectAll(".map path")
		.attr("opacity", function(d,i){
		//	console.log(Country, d.properties.name.toLowerCase())
			if (Country.toLowerCase() == d.properties.name.toLowerCase()){
				return 1
			}else{
				return .1
			}
		})
	})
	.on("mouseout", function(){
		var currentColor = this.style["fill"]
		d3.selectAll(".histunclicked").transition().attr("opacity", .3)
		d3.selectAll(".histclicked").transition().attr("opacity", 1)
		d3.selectAll("#countryLabel").html("")
		
	})
	.on("click", function(d,i){
		histogramSVG.selectAll(".histogram rect").remove();
		
		histogramSVG.selectAll(".histogram rect").attr("class", "histunclicked");	
		d3.select(this).attr("class","hisclicked")
		
		d3.selectAll(".histunclicked").transition().attr("fill", "#aaa")
		d3.selectAll(".histclicked").transition().attr("fill", "#000")
		
		//take away graph
		d3.selectAll(".barchart svg").remove()
		d3.selectAll(".stackedBarGraph rect").remove()
		d3.selectAll(".stackedBarGraph text").remove()
		console.log("dataset",dataset[i])
		
		
		//redraw graph
		var Status = "All"
		var Sector = "All"
		var Country = dataset[i][0]
		var currentData = targetData(Country, Status, Sector)		
		drawBarGraph(barTally(targetData(Country, "All", "All")))
		drawHistogram(mapTally(targetData("All", "All", "All")), "All")
		
		var countryNameCap =''
		var Country = Country.toLowerCase().split(' ')
		for(var c=0; c< Country.length; c++){
			countryNameCap += Country[c].substring(0,1).toUpperCase() + Country[c].substring(1,Country[c].length) +' ';
		}
		d3.selectAll("#vizTitle").html("All "+ countryNameCap)
		textTally(currentData)
		
		var Country = d[0]
		var currentData = targetData(Country, Status, Sector)
		d3.selectAll(".mapclicked").attr("class", ".mapunclicked").attr("opacity",0)
		
		d3.selectAll(".map path")
		//.transition()
		.attr("opacity", function(d,i){
		//	console.log(Country, d.properties.name.toLowerCase())
			if (Country.toLowerCase() == d.properties.name.toLowerCase()){
				return 1
			}else{
				return .1
			}
		})
	})
	})
}


//ESSAY BOX DO NOT CHANGE
var essayBoxShown = false;
 $('#showMore').click(function(e){
     e.preventDefault();
     essayBoxShown = !essayBoxShown;
     if (essayBoxShown) {
         $('#essayBox').css('display', 'block');
         $('#essayBox').animate({'opacity':1.0}, 500);
         $(this).text(' ... view map ');
     } else {
         closeEssayBox();
         $(this).text(' ... more ');
     }
   })
   $('#essayBox-close').click(function(){
//	   console.log("close")
     closeEssayBox();
     $('#showMore').text(' ... more ');
   });


  function closeEssayBox(){
   $('#essayBox').animate({'opacity':0.0}, 500, function () {
     $('#essayBox').css('display', 'none');
   })
   essayBoxShown = false;
 }
// var newYork = d3.select("body").append("svg").attr("class","svg5").attr("width",20).attr("height",20)
// var nyCircle = newYork.append("circle").attr("cx",20).attr("cy",30).attr("r",30)
 	
