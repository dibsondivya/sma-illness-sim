// set global variables
const limit = 10000; // How many points can be on the graph before sliding occurs
const refreshInterval = 100; // Time between refresh intervals

// set functions to retrieve 
function getData1() {           // proportion of infected people in the system

	var infecteddoctors=doctors.filter(function(d){return d.type == "I";});
    var infectedpatients=patients.filter(function(d){return d.type == "Infected" || "Undiagnosed";});
    // combine them into a single array of all infected people for future use  
    var infectedpeople = infecteddoctors.concat(infectedpatients)
	var numInfected = infectedpeople.length

	var numAgents = patients.length + doctors.length

	return numInfected/numAgents;    
	}
function getData2() {     // Cumulative no. of patients turned away / Total no. of patients who entered the system
	var turnawaypercent = statistics[1].count/nextPatientID // patients turned away due to full standard ward
	return turnawaypercent;
	}	
	
// set chart layout
const layout1 = {
	paper_bgcolor: 'rgba(0,0,0,0)',
	plot_bgcolor: 'rgba(0,0,0,0)',
	xaxis: {title: 'Time'},
	yaxis: {title: '% Infected'}
	};

	const layout2 = {
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		xaxis: {title: 'Time'},
		yaxis: {title: '% Turned Away'}
	};

// plot all charts
Plotly.plot('chart1',[{
	y:[getData1()],
	mode:'lines',
	line: {
		color: 'rgb(255,0,255)',
		width: 3 }
	}], layout1);

Plotly.plot('chart2',[{
	y:[getData2()],
	mode:'lines',
	line: {
		color: 'rgb(255,0,0)',
		width: 3 }
}], layout2);	

// set refresh interval and graph limit
var cnt = 0;
setInterval(function(){
	if (isRunning == true) {
		Plotly.extendTraces('chart1',{ y:[[getData1()]]}, [0]);
		cnt++;
		if(cnt > limit) {
			Plotly.relayout("chart1", {
				xaxis: {
					range: [cnt-limit,cnt]
					}
				});
			}
		Plotly.extendTraces('chart2',{ y:[[getData2()]]}, [0]);
		if(cnt > limit) {
			Plotly.relayout("chart2", {
				xaxis: {
					range: [cnt-limit,cnt]
					}
				});
			}
	}},refreshInterval);
	
