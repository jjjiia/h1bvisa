
function titleCase(input) {
	var output = ""

	input = input.toLowerCase().split(' ')

	for(var c = 0; c < input.length; c++){
		output += input[c].substring(0,1).toUpperCase() + input[c].substring(1,input[c].length) + ' ';
	}

	return output.trim()
}

var companiesSelect = true;
var visas = []
d3.csv(csv, function(data)
	{
		for(visa in data){
			visas.push(data[visa]);
		}
		
		filteredData = targetData("All", "All","All")
		function sortByValue(a,b){return a[4]-b[4];}
		var initialData = barTally(filteredData).sort(sortByValue)
		initialData.reverse()
		//console.log(mapTally(filteredData))
		drawBarGraph(initialData)
		drawMap(mapTally(filteredData), "All")
		drawHistogram(mapTally(filteredData), "All")
		textTally(filteredData)
		histogramText(filteredData)
		
		d3.selectAll("#resetHistogram")
		.on("click", function(){
			d3.selectAll(".histogram rect").attr("opacity",1).transition().duration(100).attr("opacity", .0).remove()
			d3.selectAll(".map path").attr("opacity",1).transition().duration(100).attr("opacity", .0).remove()
			drawHistogram(mapTally(filteredData), "All")
			drawBarGraph(barTally(filteredData))
			drawMap(mapTally(filteredData), "All")
			d3.selectAll("#vizTitle").html("All Applications")
			textTally(filteredData)
			d3.selectAll("#histogramRollover").html("")
		})
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
	d3.selectAll(".histogram rect").attr("opacity",.8).transition().duration(100).attr("opacity", .0).remove()
	d3.selectAll(".map path").attr("opacity",.8).transition().duration(100).attr("opacity", .0).remove()
	drawBarGraph(barTally(filteredData))
	drawMap(mapTally(filteredData), Status)
	drawHistogram(mapTally(filteredData), Status)
	
}
function drawWithText(Sector){
	d3.selectAll(".histogram rect").remove()
	d3.selectAll(".map path").attr("opacity",.8).transition().duration(100).attr("opacity", .0).remove()
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
		}else if(visas[visa]["Origin Country"]!=undefined){
		if (visas[visa]["Origin Country"].toLowerCase()== Country.toLowerCase()){
			targetCountry.push(visas[visa])
		}
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
			"IT":{},
		    "Health Care":{},
		    "Educational Services":{},
		    "Retail":{},
			"Finance":{},
		    "Transportation":{},
		    "Aerospace":{},
		    "Hospitality":{},
		    "Energy":{},
		    "Homeland Security":{},
		    "Geospatial":{},
		    "Construction":{},
		    "Biotechnology":{},
		    "Automotive":{},
		    "Agribusiness":{},
		    "Advanced Manufacturing":{}
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

function histogramText(targetCountryStatusSector){
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
	var allTotal = visas.length
	//console.log(allTotal)
	var total = targetCountryStatusSector.length
	var countryPercentage = d3.round(total/allTotal*100)
	
	if(total/allTotal*100 < 1){
		var countryPercentage = "less than 1"
	}
	
	if(total == 0){
		var sentence = "had no visa applications."
	}else{
		var statusFreq = []
		for (Status in statusTally){
			if(statusTally[Status].length == 1){
				statusFreq.push(statusTally[Status].length+" was "+statusTally[Status][0])
			}else{
				statusFreq.push(statusTally[Status].length+" were "+statusTally[Status][0])
			}
		}
		statusFreq=statusFreq.join(", ")
		var sentence = "had "+total+" visa applications, or "+countryPercentage+"% of global applications, <br/>of which "+ statusFreq.toLowerCase()+"."
	}
	//console.log(sentence)
	return sentence
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
		//overall pay for selection
	}
	}
	//console.log(overallPaySum, overallDividBy, overallAveragePay)
	var companies = {}
	for(visa in targetCountryStatusSector){
		var currentCompany = targetCountryStatusSector[visa]["Company"]
		
		if(currentCompany != "Not Available"){
		if(companies[currentCompany]==undefined){
			companies[currentCompany]=[]
			companies[currentCompany].push(targetCountryStatusSector[visa]["Company"])
		}else{
			companies[currentCompany].push(targetCountryStatusSector[visa]["Company"])
		}
		//overall pay for selection
	}
	}
	
	
	var jobDescriptionFreq = []
	var companiesFreq = []
	
	var allJobDescriptions = []
	var allCompanies = []
	
	for (acompany in companies){
		var company = 	companies[acompany][0]
		var companyCap =''
		var company = company.toLowerCase().split(' ')
		for(var c=0; c<  company.length; c++){
			companyCap +=  company[c].substring(0,1).toUpperCase() +  company[c].substring(1, company[c].length) +' ';
		}
		//console.log(companyCap)
		companiesFreq.push([companyCap, companies[acompany].length])
	}
	companiesFreq.sort(function(a,b) {return a[1] - b[1];});
	
	var companyDiversity = companiesFreq.length
	companiesFreq.reverse();
	allCompanies = companiesFreq.map(function(a){return a[1] + " " + a[0]})
	
	companiesFreq.splice(5,companiesFreq.length-5);
	companiesFreq = companiesFreq.map(function(a){return a[1] + " " + a[0]})
	
	
	for (job in jobDescription){
		jobDescriptionFreq.push([jobDescription[job][0], jobDescription[job].length])
	}
	
	jobDescriptionFreq.sort(function(a,b) {return a[1] - b[1];});
	var totalJobsDiversity = jobDescriptionFreq.length
	jobDescriptionFreq.reverse();
	allJobDecriptions = jobDescriptionFreq.map(function(a){return a[1] + " " + a[0]})
	
	jobDescriptionFreq.splice(5,jobDescriptionFreq.length-5);
	jobDescriptionFreq = jobDescriptionFreq.map(function(a){return a[1] + " " + a[0]})
	//console.log(companies)
	//console.log(companiesFreq)
	//console.log(allCompanies)
	
	var totalVisas = targetCountryStatusSector.length 
	
	var countryDiversity = 	mapTally(targetCountryStatusSector).length
	
	var statusPercentages = tallyStatus(targetCountryStatusSector)
	if(statusPercentages.length == 1){
		statusPercentages = ""
	}else{
	statusPercentages=statusPercentages.join(" ")
	}	
	jobDescriptionFreq=jobDescriptionFreq.join("</br>")
	companiesFreq=companiesFreq.join("</br>")
	
	if(countryDiversity == 1){
		d3.selectAll("#visaDetailTitle").html("<span style = \"font-size:16px\">Details</span></br><span style = \"color: #aaa\">"+totalVisas +" Applications in "+totalJobsDiversity+ " Types of Jobs</br>"+statusPercentages+"</span>")	
	}else{
	d3.selectAll("#visaDetailTitle").html("<span style = \"font-size:16px\">Details</span></br><span style = \"color: #aaa\">"+totalVisas +" Applications from "+countryDiversity+" Countries in "+totalJobsDiversity+" Types of Jobs </br>"+statusPercentages+"</span> ")
}
	d3.selectAll("#visaDetails").html("<span style = \"font-size:14px; color: #444\">Top Companies</span> </br>"+companiesFreq+"</br><span style = \"font-size:14px; color: #444\">Top Job Titles</span> </br>"+jobDescriptionFreq)
	d3.selectAll("#companyList").html(allJobDecriptions + allCompanies)
//	d3.selectAll("#companies").html("<span style = \"font-size:14px; text-decoration:underline;color: #000\">Top Companies</span>")	
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

	return statusFreq
}

//draw stacked bar
function drawBarGraph(dataset){

	var remapped = ["Accepted", "Withdrawn", "Denied"].map(function(dat,i){
		//console.log(dat)
		return dataset.map(function(d, ii){
			return {x:ii, y: d[i+1], type: dat}
		})
	})
	
	var stacked = d3.layout.stack()(remapped)

	var w = 280;
	var h = 400;

	p = [0, 50, 30, 20],
    x = d3.scale.ordinal().rangeRoundBands([0, w-30]),
    y = d3.scale.linear().range([0, h-140]),
    z = d3.scale.ordinal().range(["#59D984","#EDA52B","#E63D25"]);

	x.domain(stacked[0].map(function(d) { return d.x; }));
	y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);
	var max = d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })

	var yScale = d3.scale.linear().range([15, h-118])
		.domain([max,0]);
	var formatxAxis = d3.format('.0f');
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickValues(yScale.domain())
		.orient("right")
		.tickFormat(formatxAxis);	


	if(d3.selectAll(".barchart svg").size() == 0) {
		var svg = d3.select("div.barchart")
			.append("svg:svg")
			.attr("width", h)
			.attr("height", w)
			.append("svg:g")
			.attr("class", "svg")
			.attr("transform", "rotate(90 0 0)");

		svg.append("g")
			.attr("class", "x axis")
			.attr("fill", "#aaa")
			//.attr("transform", "translate(245,-400)")
			//.call(yAxis)
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
				drawWithText(Sector)
				d3.selectAll("#vizTitle").html("All "+Sector)
				var filteredData = targetData("All","All", Sector)
				textTally(filteredData)
				drawBarGraph(barTally(targetData("All", "All", "All")))
				d3.select(this).transition().attr("fill", "black")
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
					d3.selectAll("#histogramRollover").html("")
				})
				.on("click", function(d,i){
					d3.selectAll("rect").attr("class","unclicked")
					d3.select(this).attr("class","clicked")
					d3.selectAll(".unclicked").attr("opacity", .5)
					d3.selectAll(".clicked").transition().attr("opacity", 1)
					var Status = d.type
					var Sector = (dataset[i][0])
					var filteredData = targetData("All", Status, Sector)
				
					//erase map /redraw map
					d3.selectAll(".map path").attr("opacity",.5).transition().duration(100).attr("opacity", .0).remove()
					drawMap(mapTally(filteredData), Status)
					//reset bar / redraw histogram
					d3.selectAll(".histogram rect").attr("opacity",.5).transition().duration(100).attr("opacity", .0).remove()
					drawHistogram(mapTally(filteredData), Status)
					d3.selectAll("#vizTitle").html(Status+" "+Sector)
					textTally(filteredData )
					//d3.selectAll(".stackedBarGraph rect").attr("opacity",.5).transition().duration(100).attr("opacity", .0).remove()
					//d3.selectAll(".stackedBarGraph text").attr("opacity",.5).transition().duration(100).attr("opacity", .0).remove()
					//d3.selectAll(".barchart svg").remove()
					//drawBarGraph(barTally(filteredData))
					CURRENTDATA = filteredData
					textTally(CURRENTDATA)			
				
				})
	} else {

		var svg = d3.select("div.barchart")

		var stackedBarGraph = svg.selectAll(".stackedBarGraph")


		svg.selectAll(".stackedBarGraph").each(function(d, i) {
			d3.select(this).selectAll("rect")
			.transition()
			.duration(1000)
			.attr("x", function(d, j) {
				d = stacked[i][j]
				return x(d.x); 
			})
			.attr("y", function(d, j) {
				d = stacked[i][j]
				return -y(d.y0) - y(d.y)-120; 
			})
			.attr("height", function(d, j) {
				d = stacked[i][j]

				if(y(d.y) < 2 && y(d.y)!=0) {
					return 2
				} else {
					return y(d.y);
				}
			})
		})
        
	}
}

//draw map
function drawMap(dataset, Status){
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
		maxColor = "#59D984"
	}else if (Status == "Withdrawn"){
		maxColor = "#EDA52B"
	}else if (Status == "Denied"){
		maxColor = "#E63D25"
	}else if (Status == "All"){
		maxColor = "#000000"
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
	map.selectAll("path").attr("class", "d3-unclicked")
	
	map.selectAll("path")
	.on("mouseover", function(d,i){
		var Country = d.properties.name.toLowerCase()


		// Update the color of the country
		var item = d3.select(this)
		item.property("current-color", item.style("fill"))
		d3.select(this).style("fill", "#F67C1B")


		// Update the color of the bar
		var matchedBars = d3.selectAll(".histogram rect")
		.filter(function(d, i) {
			return d[0] == Country
		})
		
		if(matchedBars.size() == 1) {
			matchedBars.property("current-color", matchedBars.style("fill"))
			matchedBars.style("fill", "#F67C1B")
		}



		// Who the fuck even knows...

		d3.select("#histogramRollover").html(d.properties.name+" "+histogramText(targetData(Country, "All","All")))

		if(Country.toUpperCase() == "UNITED STATES"){
			d3.selectAll("#vizDetails").html("United States: No Visas")
		}
	})
	.on("mouseout", function(d, i){
		var Country = d.properties.name.toLowerCase()


		// Restore the country
		var item = d3.select(this)
		if(!d3.select(this).classed("d3-clicked")) {
			item.style("fill", item.property("current-color"))
		}

		// Restore the bar
		var matchedBars = d3.selectAll(".histogram rect")
		.filter(function(d, i) {
			return d[0] == Country
		})

		if(matchedBars.size() == 1) {
			if(!matchedBars.classed("d3-clicked")) {
				matchedBars.style("fill", matchedBars.property("current-color"))
			}
		}

		
		
		
		//var currentColor = this.style["fill"]
		//d3.select(this).transition().attr("opacity", .5)
		////d3.selectAll(".mapunclicked").transition().attr("opacity", .5)
		//d3.selectAll(".mapunclicked").attr("opacity", .5)
		////d3.selectAll("#countryLabel").html("")
//		//d3.selectAll("#histogramRollover").html("")		
	})
	.on("click", function(d,i){
		var countryName = json.features[i].properties.name.toLowerCase()

		d3.selectAll(".d3-clicked").attr("class", "").each(function(d, i) {
			var item = d3.select(this)
			item.attr("opacity", 0.5)
			item.style("fill", item.property("current-color"))
		})


		var matchedBars = d3.selectAll(".histogram rect")
		.filter(function(d,i){
			return d[0].toLowerCase() == countryName 
		});

		if(matchedBars.size() == 1) {
			matchedBars.style("fill", "#F67C1B").attr("opacity", 1).attr("class", "d3-clicked")
		}
		d3.select(this).style("fill", "#F67C1B").attr("opacity", 1).attr("class", "d3-clicked")

		
		setTimeout(function() {
			//redraw histogram
			//d3.selectAll(".histogram rect").remove()
			//var allData = targetData("All", "All", "All")
			//drawHistogram(mapTally(allData),"All")
			//redraw graph
			var Status = "All"
			var Sector = "All"
			var Country = json.features[i].properties.name.toUpperCase()
			var currentData = targetData(Country, Status, Sector)
		
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
			d3.selectAll("#vizTitle").html("All Applications from "+ countryNameCap)
			if(Country == "UNITED STATES"){
				d3.selectAll("#vizTitle").html("United States: No Visas")
				d3.selectAll("#vizDetails").html("United States: No Visas")
			}
		}, 0);
	})
	})
}

//draw histogram
function drawHistogram(dataset, Status){
var width = 660;
var height = 100;
var heightScale =d3.scale.linear().domain([1,1000]).range([8,height])
if (Status == "Accepted"){
	maxColor = "#59D984"
}else if (Status == "Withdrawn"){
	maxColor = "#EDA52B"
}else if (Status == "Denied"){
	maxColor = "#E63D25"
}else if (Status == "All"){
	maxColor = "#000"
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
	.attr("opacity", .5);
	
histogramSVG.selectAll(".histogram rect").attr("class", "d3-unclicked");
histogramSVG.selectAll("rect")
	.on("mouseover", function(d,i){
		var item = d3.select(this)

		// Update the bar
		item.property("current-color", item.style("fill"))
		d3.select(this).style("fill", "#F67C1B")
		
		
		// Update the map
		var countryName = d[0]
		var matchedCountries = d3.selectAll(".map path")
		.filter(function(d,i){
			return d.properties.name.toLowerCase() == countryName
		});

		if(matchedCountries.size() == 1) {
			matchedCountries.property("current-color", matchedCountries.style("fill"))
			matchedCountries.style("fill", "#F67C1B")
		}

		// Update the text
		var countryNameCap = titleCase(d[0])
		d3.select("#histogramRollover").html(countryNameCap+" "+histogramText(targetData(countryName, "All","All")))
	})
	.on("mouseout", function(d,i){
		var item = d3.select(this)
		
		// Restore old bar color
		if(!d3.select(this).classed("d3-clicked")) {
			d3.select(this).style("fill", item.property("current-color"))
		}
		
		// Restore old map color
		var countryName = d[0]
		var matchedCountries = d3.selectAll(".map path")
		.filter(function(d,i){
			return d.properties.name.toLowerCase() == countryName 
		});
		
		if(matchedCountries.size() == 1) {
			if(!matchedCountries.classed("d3-clicked")) {
				matchedCountries.style("fill", matchedCountries.property("current-color"))
			}
		}
	})
	.on("click", function(d,i){
		//console.log("dataset",dataset[i])
		//redraw graph
		var Status = "All"
		var Sector = "All"
		var Country = dataset[i][0]
		var currentData = targetData(Country, Status, Sector)
		drawBarGraph(barTally(targetData(Country, "All", "All")))
		
		var countryNameCap = titleCase(d[0])
		d3.selectAll("#vizTitle").html("All "+ countryNameCap)
		textTally(currentData)
		
		
		
		
		
		
		
		
		d3.selectAll(".d3-clicked").attr("class", "").each(function(d, i) {
			var item = d3.select(this)
			item.attr("opacity", 0.5)
			item.style("fill", item.property("current-color"))
		})
		
		var matchedCountries = d3.selectAll(".map path")
		.filter(function(d,i){
			return d.properties.name.toLowerCase() == Country 
		});

		if(matchedCountries.size() == 1) {
			matchedCountries.style("fill", "#F67C1B").attr("opacity", 1).attr("class", "d3-clicked")
		}
		d3.select(this).style("fill", "#F67C1B").attr("opacity", 1).attr("class", "d3-clicked")
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
 
 //ESSAY box 2
 var essayBoxShown2 = false;
  $('#detailMore').click(function(e){
      e.preventDefault();
      essayBoxShown2 = !essayBoxShown2;
      if (essayBoxShown2) {
          $('#essayBox2').css('display', 'block');
          $('#essayBox2').animate({'opacity':1.0}, 500);
          $(this).text(' ... less ');
      } else {
          closeEssayBox2();
          $(this).text(' See All Job Titles and Companies ');
      }
    })
    $('#essayBox-close2').click(function(){
 //	   console.log("close")
      closeEssayBox2();
      $('#detailMore').text(' See All Job Titles and Companies ');
    });


   function closeEssayBox2(){
    $('#essayBox2').animate({'opacity':0.0}, 500, function () {
      $('#essayBox2').css('display', 'none');
    })
    essayBoxShown2 = false;
  }	
