////////////// Initialize variables and constants ////////////////

var WINDOWBORDERSIZE = 10
var HUGE = 999999 //Sometimes useful when testing for big or small numbers
var animationDelay = 200 //controls simulation and transition speed
var isRunning = false // used in simStep and toggleSimStep
var surface // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
var simTimer // Set in the initialization function

//The drawing surface will be divided into logical cells
var maxCols = 80
var cellWidth    //cellWidth is calculated in the redrawWindow function
var cellHeight   //cellHeight is calculated in the redrawWindow function
var numCols;     //numCols is calculated in the redrawWindow function
var numRows;     //numRows is calculated in the redrawWindow function

// heather added
const urlHealthyPatient = "images/YellowPatient.png";
const urlUndiagnosedPatient = "images/OrangePatient.png"; // not yet included in basic code but means infected and undiagnosed
const urlInfectedPatient = "images/RedPatient.png"; // infected and diagnosed
const urlDischargedPatient = "images/GreenPatient.png";
const urlDeadPatient = "images/BlackPatient.png";
const urlHealthyDoctor = "images/GreenDoctor.png";
const urlUndiagnosedDoctor = "images/OrangeDoctor.png";
const urlInfectedDoctor = "images/RedDoctor.png";
const urlImmuneDoctor = "images/BlueDoctor.png";
const urlHealthyVisitor = "images/GreenVisitor.png";
const urlUndiagnosedVisitor = "images/OrangeVisitor.png";
// heather end

// divya added
const exitRow = 13
const exitCol = 2 // leftmost
const deadCol = 78 // rightmost 
const deadRow = 9 // center of top half of page
// divya end

// divya added
// Patient States
const ENTER = 0; 				// once entered system and not yet at ward
const STANDARDWARD = 1; 		// at standard ward
const TOISOLATIONWAITING = 2; 	// diagnosed and moving to isolation waiting
const ISOLATIONWAITING = 3; 	// at isolation waiting area
const TOISOLATIONWARD = 4; 		// diagnosed and moving to isolation ward
const ISOLATIONWARD = 5; 		// reached isolation ward
const LEAVING = 6; 				// once recovered
const EXITED = 7; 				// once discharged or dead
// divya end

// suzanne added
// Doctor States
const GOTOWARD = 0;        // going to a ward to treat patients
const TREATING = 1;        // treating a patient (stationary at ward)
const GOTOREST = 2;        // going to the communal area
const RESTING = 3;         // resting at the communal area
const GOTOISOLATION = 4;   // moving to the isolation ward (as they are infected)
const ISOLATED = 5;        // staying in the isolation ward (officially admitted as infected)
const GOTOWAIT = 6;        // going to isolation waiting room 
const WAITING = 7;         // in the isolation waiting room

//a ward can be AVAILABLE (has at least 1 bed available) or FULL (reached max capacity)
const AVAILABLE = 0;
const FULL = 1;
// suzanne end

// heather added
// Spontaneously created agents
// a dynamic list, initially empty
var patients = [];
var visitors = [];
var doctors = [];
var infectedwaitinglist = []  

// Required ID variables
var nextPatientID = 0 // a value to ensure that each patient has a unique id number, increment before assignment
var nextWaitingID = 1 // track the next unique value to be assigned to the next infected person going to iso waiting area, increment after assigning 
var nextIsolationID = 1 // value for comparison to determine next person to go to iso ward from waiting room, increment after a patient is assigned a place in iso ward from waiting room 

/// Resources (to be toggled by user) ///
var numDoctors;        // total number of healthcare workers
var numBedsPerWard;    // ward capacity

// Environment Variables
// We can section our screen into different areas. In this model, the waiting area and the staging area are separate.
var areas =[{ // areas[0]
	"label":"Standard Ward 1", // one ward at top left hand corner
	"startRow":2, 
	"numRows":6, 
	"startCol":4, 
	"numCols":16, 
	"color":"white",
	"capacity":numBedsPerWard, 
	"numPatients":0 
}, 
{ // areas[1]
	"label":"Waiting Area",
	"startRow":2,
	"numRows":5,
	"startCol":42,
	"numCols":16,
	"color":"powderblue", 
	"numPatients":0
},    // assume infinite capacity for waiting area 
	// helpful for healthcare workers since they have no beds to stay in and the waiting area gets congregated instead
{ // areas[2]
	"label":"Isolation Ward",
	"startRow":2,
	"numRows":6,
	"startCol":58,
	"numCols":20,
	"color":"white", 
	"capacity":numBedsPerWard, 
	"numPatients":0    // to count how many patients are currently in the ward
},
{ //areas[3]
	"label":"Communal Area",
	"startRow":10, // row 10 to 14
	"numRows":5,
	"startCol":28, // col 28 to 51
	"numCols":24,
	"color":"lightyellow"
},
{ // areas[4]
	"label":"Standard Ward 2", // ward at bottom left hand corner
	"startRow":12, 
	"numRows":6, 
	"startCol":4, 
	"numCols":16, 
	"color":"white", 
	"capacity":numBedsPerWard, 
	"numPatients":0 
},
{ //areas[5]
	"label":"Standard Ward 3", // ward at bottom right hand corner
	"startRow":12, 
	"numRows":6, 
	"startCol":62, 
	"numCols":16, 
	"color":"white", 
	"capacity":numBedsPerWard,
	"numPatients":0 
},
{   //areas[6]
	"label":"Entry point", // left side
	"startRow":5, 
	"numRows":2, 
	"startCol":2, 
	"numCols":1, 
	"color":"black",
},
{   //areas[7]
	"label":"Exit point", // left side
	"startRow":13, 
	"numRows":2, 
	"startCol":2, 
	"numCols":1, 
	"color":"black",
},
{   //areas[8]
	"label":"Dead point", // right side
	"startRow":9, 
	"numRows":2, 
	"startCol":78, 
	"numCols":1, 
	"color":"black",
}
];

var hospitalStartRow = areas[0].startRow - 1
var hospitalStartCol = areas[6].startCol
var hospitalEndRow = areas[4].startRow + areas[4].numRows + 1
var hospitalEndCol = areas[8].startCol + areas[8].numCols

var standardWard = areas[0]; // the standardWard is the first element of the areas array

var standardWards = [areas[0], areas[4], areas[5]]   //indexes 0, 1, 2 represent each ward
// in our code we define:
// var i = getRandomInt(0,2)
// var standardWard = standardWards[i]

var waitingArea = areas[1];

var isolationWard = areas[2]; 

var communalArea = areas[3]; // row 10 to 15, col 28 to 52
// heather end


// divya added
var communalCoordinates = [] // nrow is 5, ncol is 24
for (let i = 10; i < 16; i++) {
	for (let j = 28; j < 53; j++){
		var newspace = {
			"row":i, 
			"col":j
		};
	    communalCoordinates.push(newspace); 
	}
}
// divya end


var standardWard2 = areas[4];

var standardWard3 = areas[5];

var entryPoint = areas[6];


// Statistics Variables
var currentTime = 0
// At each simulation step we want to know how many individuals are infected,
// what is the number of patients turned away due to full capacity at standard and isolation ward,
// what is the total number of deaths
var statistics = [{
		"name":"Total Number of Acquired Infections: ",      // index 0
		"location":{
			"row":19,
			"col":24
		},
			"count":0
	},
    {
		"name":"No. of Patients Turned Away due to Full Capacity at Standard Ward: ",     // index 1
		"location":{
			"row":20,
			"col":24
		},
			"count":0
	},
    {
		"name":"No. of Patients Turned Away due to Full Capacity at Isolation Ward: ",    // index 2
		"location":{
			"row":21,
			"col":24
		},
		"count":0
	},
    {
		"name":"No. of Deaths: ",                                                         // index 3
		"location":{
			"row":23,
			"col":24
		},
		"count":0
	}, { // divya added: no. of people in waiting area at the present time
		"name": "No. of Patients at Waiting Area: ",                                      // index 4
		"location":{
			"row": 22,
			"col": 24
		},
		"count":0
	}
];

// TODO: configure if we want to use
//var cumratioinfected=0;
//var totinfected=0;
//var totnewinfected=0

// These variables define probability of agent movements
// The probability of a patient arriving, probArrivalP; 
var probArrivalP;	 // if generated no. < probArrival, arrival of patient occurs.

// suzanne added
// The probability that the doctor is currently resting, probResting
// The probability that the doctor is currently treating a patient, probTreating
var probResting = 0.2; // rest at communal area
var probTreating = 0.7; // stay at ward location to treat patient
var probStandardTarget = 0.6 // probability that the doctor is going to a standard ward to administer treatment (instead of isolation ward)
// suzanne end

// heather added
/////// For incoming patients (initial state of health)
var probUndiagnosed = 0.1; // probability that an incoming patient or an initialized doctor is infected and undiagnosed

/////// For spread of infection and diagnosis of infection
// These variables define what is the probability of being undiagnosed (orange) when a notinfected citizen is near to an infected citizen, UndiagnosedRate.
// It also specifies the minimum distance for an infection opportunity to take place

var DistTransmission;
// once come into contact: infectionrate % chance of getting infected
var InfectionRate;  // Probability that someone gets infected upon close contact
// once infected: the rate of diagnosis governs whether the infected person is diagnosed or not

var DiagnosisRate; // Probability that an infected person gets diagnosed

// Doctors gain immunity to the infection after recovering
// This variable governs the probability that the immune doctors would lose their immunity at each time step
var probImmunityLoss = 0.01

// This variable defines what is the probability of recovering with no infection and exiting (for patient only), probRecoveryNo; 
// and after getting infected and exiting, probRecoveryYes.
var probRecoveryNo = 0.7; // recover from injury aka reason for coming to hospital
var probRecoveryYes; // recover from hospital infection with no difference between doc and patient?
// heather end

// divya added
var probDeath = 0.2; // if generated no < probDeath, death of patient occurs.
// divya end

//////////// Additional defined functions /////////////
// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location) {
	var row = location.row
	var col = location.col
	var x = (col - 1) * cellWidth //cellWidth is set in the redrawWindow function
	var y = (row - 1) * cellHeight //cellHeight is set in the redrawWindow function
	return {
		"x": x,
		"y": y
	}
}

// suzanne added

// function to get a random integer between and inclusive of the defined upper and lower bounds
// used to randomly assign starting points and target locations
function getRandomInt(min, max) { // using whole ward as space instead of specific cell locations
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 
}

// function to choose a random location in the wards (either standard or iso ward) for doctors to move to 
// used to assign doctor to a target location for them to treat patients
function getRandomWardTarget(){ 

	var i = getRandomInt(0,2)
	var standardWard = standardWards[i]
    
    if (Math.random() < probStandardTarget){
        var wardRow = getRandomInt(standardWard.startRow, (standardWard.startRow + standardWard.numRows));
        var wardCol = getRandomInt(standardWard.startCol, (standardWard.startCol + standardWard.numCols));
    } else {
        var wardRow = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows));
        var wardCol = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols));
    }

    return [wardRow, wardCol]
}

// function to find the next person in the waiting room that gets a spot in the isolation ward
// loops through infectedwaitinglist, checks if nextWaitingID == nextIsolationID
// finds the entry in the infectedwaitinglist where nextWaitingID == nextIsolationID
// stores that agent's "type" (patient or doctor), and original list id (patients.id or doctors.id) 
function findNextIsoPerson(){

	for (let i = 0; i < infectedwaitinglist.length; i++){

		// initialize variables to store info
		var type;
		var id;
		var waitingID = infectedwaitinglist[i].waitingid;

		// find the next person to be assigned a spot in the isolation ward
		if (waitingID == nextIsolationID){
			type = infectedwaitinglist[i].type; // stores agent type
			id = infectedwaitinglist[i].id      // stores original id
		}
	}
	return [type, id]   // when using function, call on findNextIsoPerson[0] and findNextIsoPerson[1] to get agent type and original id respectively
}
// suzanne end

////////////////////////////////////// end of defining additional functions ///////////////////////////////

// suzanne added
// initialize all doctor entries
for (let i = 0; i < numDoctors; i++) {    // loop through each doctor to add them to the dynamic list
	// random starting points 
	var randomCol = getRandomInt(hospitalStartCol, hospitalEndCol);
	var randomRow = getRandomInt(hospitalStartRow, hospitalEndRow);

	// random target wards
	var ward = getRandomWardTarget();

	// create an entry for each healthcare worker as an entry in the doctors list variable
	var newdoctor = {
		"id":1+i, 
		"type":"H",     // type: H for healthy, I for infected
		"location":{
			"row":randomRow, 
			"col":randomCol
		},        // begin with all doctors being healthy
		"target":{
			"row":ward[0], 
			"col":ward[1]
		}, 
		"state": GOTOWARD, 
		"color":"green"
	};

	// remove this if all doctors are initially healthy
	if (Math.random() < probUndiagnosed) {  // doctor is initially infected if the random number is less than the predefined probability (probDocInfected)
		newdoctor.type = "I";                 
		newdoctor.color = "orange";
		//statistics[0].count++;
		//totnewinfected++; 
	} else {
		newdoctor.type = "H";
		newdoctor.color = "green"
	};		
	
	// add each healthcare worker as an entry in the doctors list variable
	doctors.push(newdoctor);      // "push" your new patient into the list of patients (adds a new entry in the patient table)
}
//console.log(doctors)

// suzanne end


///////////////////////////// end of Initializing variables/constants and defining additional functions ///////////////////////


// This next function is executed when the script is loaded. It contains the page initialization code.
;
	// do not touch these functions
(function () {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener('resize', redrawWindow) //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, animationDelay) // call the function simStep every animationDelay milliseconds
	redrawWindow()
})()

// We need a function to start and pause the the simulation.
function toggleSimStep() {
	//this function is called by a click event on the html page.
	// Search BasicAgentModel.html to find where it is called.
	isRunning = !isRunning // since a true/false variable where only binary options, change it when clicked via !=
	console.log('isRunning: ' + isRunning) // to track over time
}

// heather added
function redrawWindow() {
	isRunning = false // used by simStep
	window.clearInterval(simTimer) // clear the Timer
	animationDelay = 550 - document.getElementById('slider1').value // access slider value where max is 550 aka fastest
	probArrivalP = document.getElementById("slider2").value; 	// Arrival Rate Parameters are no longer defined in the code but through the sliders
	InfectionRate = document.getElementById("slider3").value;	// Infection Rate Parameters are no longer defined in the code but through the sliders
	DistTransmission = document.getElementById("slider4").value;// Distance of Transmission Parameters are no longer defined in the code but through the sliders
	DiagnosisRate = document.getElementById("slider5").value;	// Infecton Diagnosis Rate Parameters are no longer defined in the code but through the sliders
	probRecoveryYes = document.getElementById("slider6").value;	// Infection Recovery Rate Parameters are no longer defined in the code but through the sliders
	numBedsPerWard = document.getElementById("slider7").value;	// No. of beds per ward Parameters are no longer defined in the code but through the sliders
	numDoctors = document.getElementById("slider8").value;		// No. of Healthcare Workers Parameters are no longer defined in the code but through the sliders
	simTimer = window.setInterval(simStep, animationDelay) 		// call the function simStep every animationDelay milliseconds

	// Re-initialize simulation variables which are the only variables to change

	currentTime = 0;
	nextPatientID = 0;
	nextWaitingID = 1;
	nextIsolationID = 1;
    statistics[0].count=0; // affected indiv total
    statistics[1].count=0; // patients turned away due to full standard ward
    statistics[2].count=0; // infected people turned away due to full isolation ward
    statistics[3].count=0; // death count
	statistics[4].count=0; // divya added: patient at waiting area
    // cumratioinfected=0;
    // totinfected=0;
    // totnewinfected=0

	patients = [];
	doctors = []; 
	visitors = [];
	infectedwaitinglist = [];

	// redefine area variables
	areas[0].numPatients = 0
	areas[1].numPatients = 0
	areas[2].numPatients = 0
	areas[4].numPatients = 0
	areas[5].numPatients = 0
	areas[0].capacity = numBedsPerWard
	areas[2].capacity = numBedsPerWard
	areas[4].capacity = numBedsPerWard
	areas[5].capacity = numBedsPerWard
	// heather end

	//resize the drawing surface; remove all its contents;
	var drawsurface = document.getElementById('surface')
	var creditselement = document.getElementById('credits')
	var w = window.innerWidth
	var h = window.innerHeight
	var surfaceWidth = w - 3 * WINDOWBORDERSIZE // account for border width
	var surfaceHeight = h - creditselement.offsetHeight - 3 * WINDOWBORDERSIZE // account for border height

	// assign values for css to access
	drawsurface.style.width = surfaceWidth + 'px'
	drawsurface.style.height = surfaceHeight + 'px'
	drawsurface.style.left = WINDOWBORDERSIZE / 2 + 'px'
	drawsurface.style.top = WINDOWBORDERSIZE / 2 + 'px'
	//drawsurface.style.border = 'thick solid #0000FF' //The border is mainly for debugging; okay to remove it
	drawsurface.innerHTML = '' //This empties the contents of the drawing surface, like jQuery erase().

	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	numCols = maxCols
	cellWidth = surfaceWidth / numCols
	numRows = Math.ceil(surfaceHeight / cellWidth)
	cellHeight = surfaceHeight / numRows

	// In other functions we will access the drawing surface using the d3 library.
	//Here we set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface')
	surface.selectAll('*').remove() // we added this because setting the inner html to blank may not remove all svg elements
	surface.style('font-size', '100%')

	// suzanne aded
	for (let i = 0; i < numDoctors; i++) {    // loop through each doctor to add them to the dynamic list
		// random starting points 
		var randomCol = getRandomInt(hospitalStartCol, hospitalEndCol);
		var randomRow = getRandomInt(hospitalStartRow, hospitalEndRow);

	
		// random target wards
		var ward = getRandomWardTarget();
	
		// create an entry for each healthcare worker as an entry in the doctors list variable
		var newdoctor = {
			"id":1+i, 
			"type":"H",     // type: H for healthy, I for infected
			"location":{
				"row":randomRow, 
				"col":randomCol
			},        // begin with all doctors being healthy
			"target":{
				"row":ward[0], 
				"col":ward[1]
			}, 
			"state": GOTOWARD, 
			"color":"green"
		};
	
		// remove this if all doctors are initially healthy
		if (Math.random() < probUndiagnosed) {                 // doctor is initially infected if the random number is less than the predefined probability (probDocInfected)
			newdoctor.type = "I";                 
			newdoctor.color = "orange";
			//statistics[0].count++;
			//totnewinfected++; 
		} else {
			newdoctor.type = "H";
			newdoctor.color = "green"
		};		
		
		// add each healthcare worker as an entry in the doctors list variable
		doctors.push(newdoctor);      // "push" your new patient into the list of patients (adds a new entry in the patient table)
	}
	// suzanne end


	// rebuild contents of the drawing surface
	updateSurface()
}

function updateSurface(){
	// This function is used to create or update most of the svg elements on the drawing surface.
	// See the function removeDynamicAgents() for how we remove svg elements
	
	// divya added
	var allpatients = surface.selectAll('.patient').data(patients)

	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	allpatients.exit().remove() //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the patients array)

	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	// The first time this is called, all the elements of data will be in the .enter() list.
	// Create an svg group ("g") for each new entry in the data list; give it class "patient"
	var newpatients = allpatients.enter().append('g').attr('class', 'patient')
	//Append an image element to each new patient svg group, position it according to the location data, and size it to fill a cell
	// Also note that we can choose a different image to represent the patient based on the patient type
	newpatients.append('svg:image')
		.attr('x', function (d) {
			var cell = getLocationCell(d.location)
			return cell.x + 'px'
		})
		.attr('y', function (d) {
			var cell = getLocationCell(d.location)
			return cell.y + 'px'
		})
		.attr('width', Math.min(cellWidth, cellHeight) + 'px')
		.attr('height', Math.min(cellWidth, cellHeight) + 'px')
		.attr('xlink:href', function (d) { 
			if (d.type == 'Uninfected') return urlHealthyPatient
			else if (d.type == 'Undiagnosed') return urlUndiagnosedPatient
			else return urlInfectedPatient // implies diagnosis
		})

	// For the existing patients, we want to update their location on the screen
	// but we would like to do it with a smooth transition from their previous position.
	// D3 provides a very nice transition function allowing us to animate transformations of our svg elements.

	//First, we select the image elements in the allpatients list
	var images_patients = allpatients.selectAll('image')
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images_patients
		.transition()
		.attr('x', function (d) {
			var cell = getLocationCell(d.location)
			return cell.x + 'px'
		})
		.attr('y', function (d) {
			var cell = getLocationCell(d.location)
			return cell.y + 'px'
		})
		.attr('xlink:href', function (d) {
			if (d.type == 'Uninfected') return urlHealthyPatient
			else if (d.type == 'Undiagnosed') return urlUndiagnosedPatient
			else if (d.type == 'Infected') return urlInfectedPatient
			else if (d.type == 'Discharged') return urlDischargedPatient
			else return urlDeadPatient
		})
		.duration(animationDelay)
		.ease('linear') // This specifies the speed and type of transition we want.

	// Patients will leave the clinic when they have been discharged.
	// That will be handled by a different function: removeDynamicAgents
	// divya end
	
	// The simulation should serve some purpose 
	// so we will compute and display the average length of stay of each patient type.
	// We created the array "statistics" for this purpose.
	// Here we will create a group for each element of the statistics array (five elements) 
	var allstatistics = surface.selectAll(".statistics").data(statistics);
	var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
		// For each new statistic group created we append a text label
		newstatistics.append("text")
		.attr("x", function(d) { 
			var cell= getLocationCell(d.location); 
			return (cell.x+cellWidth)+"px"; 
		})
		.attr("y", function(d) { 
			var cell= getLocationCell(d.location); 
			return (cell.y+cellHeight/2)+"px"; })
		.attr("dy", ".35em")
		.text(""); 

	// The data in the statistics array are always being updated.
	// So, here we update the text in the labels with the updated information.
	allstatistics.selectAll("text").text(function(d) {
		var nopatients = d.count; // cumulativeValue and count for each statistic are always changing
		return d.name+nopatients.toFixed(1); }); //The toFixed() function sets the number of decimal places to display

	// Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.

	//First a box representing the hospital and respective wards.
	var allareas = surface.selectAll(".areas").data(areas);
	var newareas = allareas.enter().append("g").attr("class", "areas");
	// For each new area, append a rectangle to the group
	newareas.append("rect")
		.attr("x", function(d){
			return (d.startCol-1)*cellWidth;})
		.attr("y",  function(d){
			return (d.startRow-1)*cellHeight;})
		.attr("width",  function(d){
			return d.numCols*cellWidth;})
		.attr("height",  function(d){
			return d.numRows*cellWidth;})
		.style("fill", function(d) { 
			return d.color; })
		.style("stroke","black")
		.style("stroke-width",1);

	//Select all svg elements of class "doctors" and map it to the data list called doctors
	var alldoctors = surface.selectAll(".doctor").data(doctors);
	
	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	// suzanne commented out the line below (please check)
	//alldoctors.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the citizens array)
	
	//suzanne added
	var newdoctors = alldoctors.enter().append('g').attr('class', 'doctor')
	newdoctors
		.append('svg:image')
		.attr('x', function (d) {
			var cell = getLocationCell(d.location)
			return cell.x + 'px'
		})
		.attr('y', function (d) {
			var cell = getLocationCell(d.location)
			return cell.y + 'px'
		})
		.attr('width', Math.min(cellWidth, cellHeight) + 'px')
		.attr('height', Math.min(cellWidth, cellHeight) + 'px')
		.attr('xlink:href', function (d) { 
			if (d.color == 'blue') return urlImmuneDoctor              
			else if (d.color == 'red') return urlInfectedDoctor        
			else if (d.color == 'orange') return urlUndiagnosedDoctor  
			else return urlHealthyDoctor   // d.color == 'green'       
		})

	var images_doctors = alldoctors.selectAll('image')
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images_doctors
		.transition()
		.attr('x', function (d) {
			var cell = getLocationCell(d.location)
			return cell.x + 'px'
		})
		.attr('y', function (d) {
			var cell = getLocationCell(d.location)
			return cell.y + 'px'
		})
		.attr('xlink:href', function (d) { 
			if (d.color == 'blue') return urlImmuneDoctor              
			else if (d.color == 'red') return urlInfectedDoctor        
			else if (d.color == 'orange') return urlUndiagnosedDoctor  
			else return urlHealthyDoctor   // d.color == 'green'       
		})
		.duration(animationDelay)
		.ease('linear') // This specifies the speed and type of transition we want.
	 
}
// suzanne end

////////////////////////////////////////////// divya patient start //////////////////////////////////////////////
function addDynamicPatients() {
	// Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
	// All patients are green for this.
	if (Math.random() < probArrivalP) { // if patient arrives
		nextPatientID++
		var newpatient = {
			"id" : nextPatientID, // divya added: increment id later on when queuing for waiting area and include into infected waiting dynamic list
			"type": 'Uninfected',
			"location": {
				"row": entryPoint.startRow, 	// appear from entry point
				"col": entryPoint.startCol 		// appear from leftmost
			},
			"target": {
				"row": 10, 
				"col": 3 
			},
			"state": ENTER,
			"ward": 'None',
			
			"initialstay": Math.floor(Math.random() * (20 - 3 + 1)) + 3, // Math.floor(Math.random() * (max - min + 1)) + min
			"lengthofstay": 0, // total length  = initial stay + infected stay
			"currentstay" : 0 // to be incremented at every time step and compared against length of stay
			// divya added: add length of stay variables that change upon infection 
			// divya added: add initial stay variable for patient 
			// divya added: add initial stay variable for patient 
		}
			if (Math.random() < probUndiagnosed) {newpatient.type = 'Undiagnosed'}
			else {newpatient.type = 'Uninfected'}
		patients.push(newpatient) // array.push(object)
	}
}

function updatePatient(patientIndex) {
	//patientIndex is an index into the patients data array
	patientIndex = Number(patientIndex) //it seems patientIndex was coming in as a string
	var patient = patients[patientIndex]
	// get the current location of the patient
	var row = patient.location.row
	var col = patient.location.col
	var type = patient.type 	// Uninfected or Infected or Discharged or Dead
	var state = patient.state 	// ENTER or STANDARDWARD or TOISOLATIONWAITING or ISOLATIONWAITING or TOISOLATIONWARD or ISOLATIONWARD or LEAVING or EXITED

	// determine if patient has arrived at destination
	var hasArrived =
		Math.abs(patient.target.row - row) + Math.abs(patient.target.col - col) == 0
	
	// Behavior of patient depends on his or her state
	switch (state) {
		case ENTER:
			if (hasArrived) { // check if patient reached random checkpoint
				// check standard ward space
				// if no space for PATIENT
					// patient.state = LEAVING
					// patients turned away to + 1 stats.cumulativeValue = stats.cumulativeValue + 1
				console.log('enter state: current standard ward patient count is  ' + standardWard.numPatients)
				var standardWards = [standardWard, standardWard2, standardWard3]
				var emptyWards = []
				for (i in standardWards) {
					console.log('patient is ' + standardWards[i].numPatients)
					console.log('type is ' + typeof(standardWards[i].capacity))
					console.log('capacity is ' + standardWards[i].capacity)
					if (standardWards[i].numPatients < standardWards[i].capacity) {
						emptyWards.push(standardWards[i]) // array.push(object)
					}
				}
				console.log('length of emptywards is ' + emptyWards.length)
				if (emptyWards.length == 0) { // no space
					patient.state = LEAVING  
					statistics[1].count++ // count total no. of patients turned away due to full standard ward
					patient.target.row = exitRow // exit is a few rows above entry
					patient.target.col = exitCol // first col
					//console.log('turned away due to full standard ward patient count is ' + statistics[1].count)
				}
				// if space in standard ward
				else {
					//console.log('space for patients, patient entering standard ward')
					patient.state = STANDARDWARD
					// randomize ward choice out of three after checking for capacity across wards and edit the randomization below, as well as numPatients
					var randomWard = Math.floor(Math.random() * emptyWards.length)
					var selectedWard = emptyWards[randomWard]
					if (selectedWard.label == 'Standard Ward 1') {
						patient.ward = standardWard
					} else if (selectedWard.label == 'Standard Ward 2') {
						patient.ward = standardWard2
					} else {
						patient.ward = standardWard3
					}
					// randomize space in ward
					var selectedwardRow = getRandomInt(selectedWard.startRow, (selectedWard.startRow + selectedWard.numRows - 1));
					var selectedwardCol = getRandomInt(selectedWard.startCol, (selectedWard.startCol + selectedWard.numCols - 1));
					patient.target.row = selectedwardRow
					patient.target.col = selectedwardCol
					//console.log('enter state: current standard ward patient count before is  ' + selectedWard.numPatients)
					selectedWard.numPatients++ // checked that increment here
					//console.log('enter state: current standard ward patient count after is  ' + selectedWard.numPatients)
				}
			}
			break
		case STANDARDWARD: // divya added: while moving to ward aka hasnotarrived, have not accounted for infection
			if (hasArrived){
				switch (type) { 
					case 'Uninfected':
						// no patient target position since in place already
						// check if patient is infected
						// else check if patient has gotten better from injury

						// borrowed from suzanne
						//identify the doctors/patients infected 
						var infecteddoctors=doctors.filter(function(d){return d.type=="I";});
						var infectedpatients=patients.filter(function(d){return d.type=="Infected";});
						var undiagnosedpatients=patients.filter(function(d){return d.type=="Undiagnosed";});
						// combine them into a single array of all infected people for future use  
						var undiagnosedpeople = infecteddoctors.concat(undiagnosedpatients)
						var infectiouspeople = infectedpatients.concat(undiagnosedpeople)
						//console.log(infectedpeople)

						//determine if any infected doctor/patient is nearby
						// infection by proximity
						i=0
						if (infectiouspeople.length > 0 && patient.type == "Uninfected") { // for uninfected patients where infected and undiagnosedpatients exist
							while (patient.type == "Uninfected" && i < infectiouspeople.length){
							var infected = infectiouspeople[i];
							var infectedrow = infected.location.row
							var infectedcol = infected.location.col
							var distance = Math.sqrt((infectedrow-row)*(infectedrow-row)+(infectedcol-col)*(infectedcol-col))
							//console.log(infectedpeople.length)

							// determine if the patient gets infected
							if (distance<DistTransmission){
								if (Math.random() < InfectionRate) { // if infected
									patient.type = 'Undiagnosed'
									statistics[0].count++ // increment infected since uninfected becomes infected
									//console.log('standardward loop: uninfected patient is infected')
									//patient.lengthofstay = Math.floor(Math.random() * (10 - 1 + 1)) + 1 // change to length of stay if infected where Math.floor(Math.random() * (max - min + 1)) + min
									// check if isolation ward is empty
									// done: account for diagnosis rate!!
									
									if (Math.random() < DiagnosisRate) { // patient is diagnosed
										patient.type = 'Infected'
										if (isolationWard.numPatients >= isolationWard.capacity) { // iso is completely full
											console.log('standardward: no space in iso ward, isolation ward patient count is ' + isolationWard.numPatients)
											statistics[2].count++ // turned away due to iso ward fullness
											// divya added: state changes to isolationwaiting
											//console.log('standardward loop: patient is turned away due to full iso')
											patient.state = TOISOLATIONWAITING
											var waitingAreaRow = getRandomInt(waitingArea.startRow, (waitingArea.startRow + waitingArea.numRows - 1));
											var waitingAreaCol = getRandomInt(waitingArea.startCol, (waitingArea.startCol + waitingArea.numCols - 1));
											patient.target.row = waitingAreaRow
											patient.target.col = waitingAreaCol
											//console.log('turned away due to full isolation ward patient count is ' + statistics[2].count)

											newinfectedpatient = {
												"type": "patient",
												"id": patient.id, // helps you find that agent in their original list (patients or doctors), possibly for updating their state if needed
												"waitingid": nextWaitingID  // tracks who came first 
											}
											nextWaitingID++ // increment waiting id
											// add to infected waiting area list
											infectedwaitinglist.push(newinfectedpatient)
											//console.log('standardward loop: current standard ward patient count before is  ' + standardWard.numPatients)
											var patientward = patient.ward
											patientward.numPatients--; // leave standard ward, assuming diagnosed
											//console.log('standardward loop: current standard ward patient count after is  ' + standardWard.numPatients)

										} else { // iso has space
											console.log('standardward: iso has space')
											patient.state = TOISOLATIONWARD
											// randomize empty iso bed
											var isolationwardRow = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1));
											var isolationwardCol = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1));
											patient.target.row = isolationwardRow
											patient.target.col = isolationwardCol
											console.log('standardward: there is space in iso ward, old isolation ward patient count is ' + isolationWard.numPatients)
											isolationWard.numPatients++
											console.log('standardward: there is space in iso ward, new isolation ward patient count is ' + isolationWard.numPatients)
											//console.log('standardward loop: current standard ward patient count before is  ' + standardWard.numPatients)
											var patientward = patient.ward
											patientward.numPatients--; // leave standard ward, assuming diagnosed
											//console.log('standward loop: current standard ward patient after count is  ' + standardWard.numPatients)

										}
									} else { // undiagnosed and infected
										// chance to leave the system while still undiagnosed
										// if (Math.random() < probRecoveryNo) { // recovered from injury
										// 	patient.state = LEAVING
										// 	patient.type = 'Undiagnosed' // keep this the same
										// 	patient.target.row = exitRow
										// 	patient.target.col = exitCol
										// 	//console.log('standardward loop: patient is recovered and leaving')
										// 	//console.log('standardward loop: current standard ward patient count before is  ' + standardWard.numPatients)
										// 	var patientward = patient.ward
										// 	patientward.numPatients--; // leave standard ward
										// 	//console.log('standardward loop: current standard ward patient count after is  ' + standardWard.numPatients)
										// } // do not include death here
									} 
								} else { // not infected
									//console.log('standardward loop: patient is not infected')
									if (Math.random() < probRecoveryNo) { // recovered from injury
										patient.state = LEAVING
										patient.type = 'Discharged' 
										patient.target.row = exitRow
										patient.target.col = exitCol
										//console.log('standardward loop: patient is recovered and leaving')
										//console.log('standardward loop: current standard ward patient count before is  ' + standardWard.numPatients)
										var patientward = patient.ward
										patientward.numPatients--; // leave standard ward
										//console.log('standardward loop: current standard ward patient count after is  ' + standardWard.numPatients)
									}
								}
							}
							i=i+1 
							}	
						} else { // no infected and undiagnosed patients
							//console.log('no infected patients present')
							if (Math.random() < probRecoveryNo) { // recovered from injury
								patient.state = LEAVING
								patient.type = 'Discharged' 
								patient.target.row = exitRow
								patient.target.col = exitCol
								//console.log('standardward loop: no infected patients and patient is recovered and so leaving')
								//console.log('standard loop: current standard ward patient count before is  ' + standardWard.numPatients)
								var patientward = patient.ward
								patientward.numPatients--; // leave standard ward
								//console.log('standardward loop: current standard ward patient count after is  ' + standardWard.numPatients)
							}
						}
						break;
					case 'Undiagnosed': // if infected but still in standard ward (aka undiagnosed and infected) 
					 	// done: account for diagnosis rates here
						if (Math.random() < DiagnosisRate) {
							patient.type = 'Infected'
							if (isolationWard.numPatients >= isolationWard.capacity) { // iso is completely full
								// don't recount patient in count of iso turned away patients
								// divya added: account for waiting area when infected
								//console.log('standardward state: infected patient cannot go to iso ward as full capacity')
								patient.state = TOISOLATIONWAITING
								var waitingAreaRow = getRandomInt(waitingArea.startRow, (waitingArea.startRow + waitingArea.numRows - 1));
								var waitingAreaCol = getRandomInt(waitingArea.startCol, (waitingArea.startCol + waitingArea.numCols - 1));
								patient.target.row = waitingAreaRow
								patient.target.col = waitingAreaCol
								//console.log('standardward state: current standard ward patient count before is  ' + standardWard.numPatients)

								newinfectedpatient = {
									"type": "patient",
									"id": patient.id, // helps you find that agent in their original list (patients or doctors), possibly for updating their state if needed
									"waitingid": nextWaitingID  // tracks who came first 
								}
								nextWaitingID++ // increment waiting id
								// add to infected waiting area list
								infectedwaitinglist.push(newinfectedpatient)

								var patientward = patient.ward
								patientward.numPatients--; // leave standard ward
								//console.log('standardward state: current standard ward patient count after is  ' + standardWard.numPatients)

								//console.log('turned away due to full isolation ward patient count is where expecting no change ' + statistics[2].count)
							} else { // iso has space
								//console.log('standardward state: infected patient can go to iso ward')
								patient.state = TOISOLATIONWARD
								// randomize empty iso bed
								var isolationwardRow = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1));
								var isolationwardCol = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1));
								patient.target.row = isolationwardRow
								patient.target.col = isolationwardCol
								console.log('infected standard: there is space in iso ward')
								console.log('there is space in iso ward, old isolation ward patient count is ' + isolationWard.numPatients)
								isolationWard.numPatients++
								console.log('there is space in iso ward, new isolation ward patient count is ' + isolationWard.numPatients)
								//console.log('standardward state: current standard ward patient count before is  ' + standardWard.numPatients)
								var patientward = patient.ward
								patientward.numPatients--; // leave standard ward
								//console.log('standardward state: current standard ward patient count after is  ' + standardWard.numPatients)
							}
						} else { // undiagnosed patient
							// if (Math.random() < probDeath) { // if patient dies
							// 	patient.state = LEAVING
							// 	patient.type = 'Dead' 
							// 	statistics[3].count++ // increment death coun
							// 	patient.target.row = deadRow
							// 	patient.target.col = deadCol
							// 	var patientward = patient.ward
							// 	patientward.numPatients--; // leave standard ward
							// } 
						}
						break;
				}
			} else { //if have not arrived aka moving to standard ward, nothing	
				// borrowed from suzanne
				//identify the doctors/patients infected 
				var infecteddoctors=doctors.filter(function(d){return d.type=="I";});
				var infectedpatients=patients.filter(function(d){return d.type=="Infected";});
				var undiagnosedpatients=patients.filter(function(d){return d.type=="Undiagnosed";});
				// combine them into a single array of all infected people for future use  
				var undiagnosedpeople = infecteddoctors.concat(undiagnosedpatients)
				var infectiouspeople = infectedpatients.concat(undiagnosedpeople)
				//console.log(infectedpeople)

				//determine if any infected doctor/patient is nearby
				// infection by proximity
				i=0
				if (infectiouspeople.length > 0 && patient.type == "Uninfected") { // for uninfected patients
					while (patient.type == "Uninfected" && i < infectiouspeople.length){
					var infected = infectiouspeople[i];
					var infectedrow = infected.location.row
					var infectedcol = infected.location.col
					var distance = Math.sqrt((infectedrow-row)*(infectedrow-row)+(infectedcol-col)*(infectedcol-col))

					// determine if the patient gets infected
					if (distance<DistTransmission){
						if (Math.random() < InfectionRate) { // if infected after being uninfected
							patient.type = 'Undiagnosed'
							statistics[0].count++ // increment infected
							//console.log('moving to standardward loop: patient is infected')
							//patient.lengthofstay = Math.floor(Math.random() * (10 - 1 + 1)) + 1 // change to length of stay if infected where Math.floor(Math.random() * (max - min + 1)) + min
							// check if isolation ward is empty
							// patient must still head to standardward before eventually being diagnosed
						}
					}
					i=i+1 
					}	
				}
			}
			break;
		case TOISOLATIONWAITING: // reached isolation waiting
			if (hasArrived) {
				patient.state = ISOLATIONWAITING
				statistics[4].count++ // increment the number of people at waiting area
			}
			break;
		case ISOLATIONWAITING: // check if isolation ward has space 
			console.log('patient at isolation waiting area and isolation ward patient count is ' + isolationWard.numPatients)
			if (isolationWard.numPatients < isolationWard.capacity) { // has space
				// infectedwaitinglist = [
				//	{'patient', 5},
				// {'doctor', 7}
				// ]
				//
				// patient = patients[i]
				// infectedwaitinglist = [
				//	{"type" = "patient",              
				//    "id" = patient.id,                 // helps you find that agent in their original list (patients or doctors), possibly for updating their state if needed
				//    "waitingid" = nextWaitingID},      // tracks who came first 
				//  {...
				//  } 
				//]

				var nextIsoPerson = findNextIsoPerson() // output is type, id
				if (nextIsoPerson[0] == 'patient' && patient.id == nextIsoPerson[1]) { // if this patient is to go to iso ward
					// change state
					patient.state = TOISOLATIONWARD
					// randomize empty iso bed
					var isolationwardRow = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1));
					var isolationwardCol = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1));
					patient.target.row = isolationwardRow
					patient.target.col = isolationwardCol
					console.log('iso waiting: there is space in iso ward, old isolation ward patient count is ' + isolationWard.numPatients)
					isolationWard.numPatients++
					console.log('iso waiting: there is space in iso ward, new isolation ward patient count is ' + isolationWard.numPatients)
					// leaving from iso waiting area
					statistics[4].count--; // decrement since leaving waiting area
					infectedwaitinglist = infectedwaitinglist.filter(function (d) { // remove from isowaitinglist
						return d.waitingid != nextIsolationID 
					}) 
					// increment nextIsolation
					nextIsolationID++
				}
				// else nothing happens
			}
			break;
		case TOISOLATIONWARD:
			if (hasArrived) { // reached isolation ward
				patient.state = ISOLATIONWARD
				// no target row since patient in position?
			}
			break;
		case ISOLATIONWARD:
			// Complete treatment randomly according to the probability of recovery
			if (Math.random() < probRecoveryYes) { // chance of recovery from infection
				patient.state = LEAVING
				patient.type = 'Discharged' 
				patient.target.row = exitRow
				patient.target.col = exitCol
				console.log('iso ward recovery: old isolation ward patient count is ' + isolationWard.numPatients)
				isolationWard.numPatients--; // leave isolation ward
				console.log('iso ward recovery: new isolation ward patient count is ' + isolationWard.numPatients)
			} else { // patient not recovered
				if (Math.random() < probDeath) { // if patient dies
					patient.state = LEAVING
					patient.type = 'Dead' 
					statistics[3].count++ // increment death coun
					patient.target.row = deadRow
					patient.target.col = deadCol
					console.log('iso ward death: old isolation ward patient count is ' + isolationWard.numPatients)
					isolationWard.numPatients--;
					console.log('iso ward death: new isolation ward patient count is ' + isolationWard.numPatients)
				} 
			}
			break;
		case LEAVING:
			if (hasArrived) {
				patient.state = EXITED
			}
			break;
		default:
			break;
	}
	// set the destination row and column
	var targetRow = patient.target.row
	var targetCol = patient.target.col
	// compute the distance to the target destination
	var rowsToGo = targetRow - row // row is current location
	var colsToGo = targetCol - col // col is current location
	// set the speed
	var cellsPerStep = 1
		// Math.min gives 0 when at target position so dont need to move
			// else gives 1 since one step to move
		// Math.sign gives +1 or -1
	var newRow = row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo)
	var newCol = col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo)
	// check if the new position is
	var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==newRow && d.col==newCol;});
	patient.location.row = newRow
	patient.location.col = newCol

	// if (nextstepiscommunalarea.length == 0){ // if next position is not in communal area
	// 	patient.location.row = newRow
	// 	patient.location.col = newCol
	// } else { // if next position is communal area
	// 	while (nextstepiscommunalarea.length > 0){ // stuck here?
	// 		var newRow = row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo)
	// 		var newCol = col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo)
	// 		var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==newRow && d.col==newCol;});
	// 	}
	// 	patient.location.row = newRow
	// 	patient.location.col = newCol

		// nextsteps=[];
		// for(const rowmove of [-1, 0, 1]) { 
		// 	for(const colmove of [-1, 0, 1]) {
		// 	if(rowmove === 0 && colmove === 0) continue; // 8 possibilities
		// 	nextonestep = { 
		// 		"row": row + rowmove, 
		// 		"col": col + colmove }
		// 	var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextonestep.row && d.col==nextonestep.col;});
		// 	if (nextstepiscommunalarea.length == 0) { // if next position is not in communal area
		// 		nextsteps.push(nextonestep);
		// 	} else {
		// 		console.log('next one steps is ' + nextonestep.row + 'and ' + nextonestep.col)
		// 	}
		// 	}
		// }

		// stepdistance=[]
		// for (i = 0; i < nextsteps.length-1; i++) {
		// 	var nextstep=nextsteps[i];
		// 	var nextrow=nextstep.row
		// 	var nextcol=nextstep.col
		// 	stepdistance[i]=Math.sqrt((nextrow-targetRow)*(nextrow-targetRow)+(nextcol-targetCol)*(nextcol-targetCol));
		// } 

		// //identify if the best next step (i.e. the step with the shortest distance to the target) is a building
		// var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
		// var minnexstep=nextsteps[indexMin];
		// var nextsteprow=minnexstep.row;
		// var nextstepcol=minnexstep.col;
		// var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});

		//compute the cell to move to
		// newposition = getRandomInt(0, nextsteps.length-1)
		// var newRow = nextsteps[newposition].row
		// var newCol = nextsteps[newposition].col
		// console.log('randomised position is ' + newRow + 'and ' + newCol)

		// var newRow =
		// 	row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo)
		// var newCol =
		// 	col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo)  
		// var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==newRow && d.col==newCol;});
		// while (nextstepiscommunalarea.length != 0) { // going towards communal area
		// 	newposition = getRandomInt(0, nextsteps.length-1)
		// 	var newRow = nextsteps[newposition].row
		// 	var newCol = nextsteps[newposition].col
		// 	var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==newRow && d.col==newCol;});
		// }

	// }	
	
	// var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==newRow && d.col==newCol;});
	// console.log('length of next step is ' + nextstepiscommunalarea.length)
	// if (nextstepiscommunalarea.length != 0) { // going towards the communal area
	// 	var currentrow=patient.location.row; // unupdated
	// 	var currentcol=patient.location.col; // unupdated

	// 	//Compute all possible directions of the patient
	// 	nextsteps=[];
	// 	for(const rowmove of [-1, 0, 1]) { 
	// 		for(const colmove of [-1, 0, 1]) {
	// 		if(rowmove === 0 && colmove === 0) continue; // 8 possibilities
	// 		nextonestep = { 
	// 			"row": currentrow + rowmove, 
	// 			"col": currentcol + colmove }
	// 		nextsteps.push(nextonestep);
	// 		console.log('next one steps is ' + nextonestep.row + 'and' + nextonestep.col)
	// 	}
	// 	}

	// 	// Compute distance of each possible step to the destination (does this matter?)
	// 	stepdistance=[]
	// 	for (let i = 0; i < nextsteps.length; i++) { // nextsteps.length-1 is 7 so it goes from 0 to 6 aka 7 iterations
	// 		var nextstep=nextsteps[i];
	// 		var nextrow=nextstep.row
	// 		var nextcol=nextstep.col
	// 		stepdistance[i]=Math.sqrt((nextrow-targetRow)*(nextrow-targetRow)+(nextcol-targetCol)*(nextcol-targetCol));
	// 		console.log('distance is' + stepdistance[i])
	// 	} 

	// 	//identify if the best next step (i.e. the step with the shortest distance to the target) is a communal area
	// 	var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
	// 	var minnexstep=nextsteps[indexMin];
	// 	var nextsteprow=minnexstep.row;
	// 	var nextstepcol=minnexstep.col;
	// 	console.log('best next step is ' + nextsteprow + 'col' + nextstepcol)
	// 	var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});

	// 	//If the best next step is a communal area, then we analyze the 2nd best next step...etc, until the next step is not a communal area
	// 	while (nextstepiscommunalarea.length>0){
	// 		nextsteps.splice((indexMin), 1);
	// 		stepdistance.splice((indexMin), 1);
	// 		var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
	// 		var minnexstep=nextsteps[indexMin];
	// 		var nextsteprow=minnexstep.row;
	// 		var nextstepcol=minnexstep.col;
	// 		var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});
	// 	}

	// 	// compute the cell to move to
	// 	var newRow = nextsteprow;
	// 	var newCol = nextstepcol;

	// 	// update the location of the citizen
	// 	patient.location.row = newRow;
	// 	patient.location.col = newCol;
	// } else {
	// 	// update the location of the patient
	// 	patient.location.row = newRow
	// 	patient.location.col = newCol
	// }
	

/////////////////////////////////////////////// communal area steps  start
// var currentrow=patient.location.row;
// var currentcol=patient.location.col;

// //Compute all possible directions of a citizen
// nextsteps=[];
// for(const dx of [-1,  1]) {
// 	for(const dy of [-1, 0, 1]) {
// 	  if(dx === 0 && dy === 0) continue;
// 	  nextsteps.push({ 
// 		  "row": currentrow + dx, 
// 		  "col": currentcol + dy });
//    }
// }

// // Compute distance of each possible step to the destination
// stepdistance=[]
// for (i = 0; i < nextsteps.length-1; i++) {
// 	var nextstep=nextsteps[i];
// 	var nextrow=nextstep.row
// 	var nextcol=nextstep.col
// 	stepdistance[i]=Math.sqrt((nextrow-targetRow)*(nextrow-targetRow)+(nextcol-targetCol)*(nextcol-targetCol));
// } 

// //identify if the best next step (i.e. the step with the shortest distance to the target) is a communal area
// var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
// var minnexstep=nextsteps[indexMin];
// var nextsteprow=minnexstep.row;
// var nextstepcol=minnexstep.col;
// var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});

// //If the best next step is a communal area, then we analyze the 2nd best next step...etc, until the next step is not a communal area
// while (nextstepiscommunalarea.length>0){
// 	nextsteps.splice((indexMin), 1);
// 	stepdistance.splice((indexMin), 1);
// 	var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
// 	var minnexstep=nextsteps[indexMin];
// 	var nextsteprow=minnexstep.row;
// 	var nextstepcol=minnexstep.col;
// 	var nextstepiscommunalarea=communalCoordinates.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});
// }

// // compute the cell to move to
// var newRow = nextsteprow;
// var newCol = nextstepcol;

// // update the location of the citizen
// patient.location.row = newRow;
// patient.location.col = newCol;
/////////////////////////////////////////////// communal area end 

}

function removeDynamicPatients() {
	// We need to remove patients who have been discharged.
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll('.patient').data(patients)
	//Select all the svg groups of class "patient" whose state is EXITED
	var treatedpatients = allpatients.filter(function (d, i) {
		return d.state == EXITED
	})
	// Remove the svg groups of EXITED patients: they will disappear from the screen at this point
	treatedpatients.remove()

	// Remove the EXITED patients from the patients list using a filter command
	patients = patients.filter(function (d) {
		return d.state != EXITED
	})
	// At this point the patients list should match the images on the screen one for one
	// and no patients should have state EXITED
}

function updateDynamicPatients() {
	// loop over all the agents and update their states
	for (var patientIndex in patients) {
		updatePatient(patientIndex)
	}
	updateSurface()
}

//////////////////////////////////////////////////////////// divya ends, other code below ////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////// suzanne update doctors start, code below ////////////////////////////////////////////////////////////

// update individual healthcare worker entries
function updateDoctors(doctorIndex){
	// doctorIndex is an index into the healthcare workers data array
	doctorIndex = Number(doctorIndex);
	var doctor = doctors[doctorIndex];

	// get the current location of the healthcare worker
	var row = doctor.location.row;
    var col = doctor.location.col;
	var state = doctor.state;
	
	// determine if healthcare worker has arrived at the target
	var hasArrived = (Math.abs(doctor.target.row-row)+Math.abs(doctor.target.col-col))==0;
	
	//identify the doctors/patients infected 
    var infecteddoctors=doctors.filter(function(d){return d.type == "I";});
    var infectedpatients=patients.filter(function(d){return d.type == "Infected" || "Undiagnosed";});
    // combine them into a single array of all infected people for future use  
    var infectedpeople = infecteddoctors.concat(infectedpatients)
    //console.log(infectedpeople)

    //determine if any infected doctor/patient is nearby
	// infection by proximity
    i=0
    if (infectedpeople.length > 0 && doctor.color == "green") {
        while (doctor.color == "green" && i < infectedpeople.length){
           var infected = infectedpeople[i];
           var infectedrow = infected.location.row
           var infectedcol = infected.location.col
           var distance = Math.sqrt((infectedrow-row)*(infectedrow-row)+(infectedcol-col)*(infectedcol-col))

           // determine if the doctor gets infected
           if (distance<DistTransmission){
                if (Math.random() < 0.1*InfectionRate) {
                    doctor.type="I"
					doctor.color="orange"    // infected but undiagnosed
                    statistics[0].count++  
                    //totnewinfected++ 
				}    
            }
           i=i+1 
        }
    }

	// determine if immune doctor gets loses immunity at each time step
	// doctor.type remains as "H"
	if (doctor.color == "blue") {       
		if (Math.random() < probImmunityLoss) {       
			doctor.color = "green"        // healthy with no immunity to the infection
		}
	}

	// Behavior of doctor depends on his or her state
	switch(state){
		case GOTOWARD:    
			if (hasArrived){        // doctor has arrived at the ward

                // determine if undiagnosed infected doctor gets diagnosed upon arrival
				// doctor.type remains as "I" during change in color state
				if (doctor.color == "orange") {       
					if (Math.random() < DiagnosisRate) {       
						doctor.color = "red"        // infected and diagnosed
					}
				}

                // check that doctor is not diagnosed as infected before treating patient
                if (!(doctor.color == "red")){      // doctor not red
                    doctor.state = TREATING;
                } 
                // if doctor is infected and diagnosed, send to isolation ward instead   
                else if (doctor.color == "red") {   // doctor is red

                    // check if isolation ward has available beds
                    if (isolationWard.numPatients < isolationWard.capacity){
                        doctor.state = GOTOISOLATION;

						// update numPatients (ie. infected doctor is assigned a spot in the isolation ward)
                        doctor.target.row = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1))
                        doctor.target.col = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1))
						isolationWard.numPatients++
 
						// TODO ensure no overlap of people in isolation ward positions (ADVANCED MODEL)
                    } 
                    // else infected doctor will go to isolation waiting area
                    else {
                        doctor.state = GOTOWAIT;
                        doctor.target.row = getRandomInt(waitingArea.startRow, (waitingArea.startRow + waitingArea.numRows - 1))
                        doctor.target.col = getRandomInt(waitingArea.startCol, (waitingArea.startCol + waitingArea.numCols - 1))
						
						statistics[2].count++    // no. of infected people turned away due to full isolation ward

						// add infected doctor to infectedwaitinglist
						var newinfected = {
							"id":doctor.id,
							"type":"doctor",
							"waitingid":nextWaitingID
						}; 
						nextWaitingID++
						infectedwaitinglist.push(newinfected)
                    }
                    
                }

                /// TODO add more when we include more color states (ADVANCED MODEL)
                
			}
		break;
        case TREATING:                    
			if (hasArrived){                  // doctor is treating patients at a ward

                // doctor will stay in the ward for a period of time then leave to next destination
                
                // if doctor has finished treatment
                if (Math.random() > probTreating) {

                    // doctor will go to communal area to rest next
                    if (Math.random() < probResting){
                        doctor.state = GOTOREST;
                        doctor.target.row = getRandomInt(communalArea.startRow, (communalArea.startRow + communalArea.numRows - 1))
                        doctor.target.col = getRandomInt(communalArea.startCol, (communalArea.startCol + communalArea.numCols - 1))
                    }
                    // else doctor will get another target ward location to move to 
                    else {
                        doctor.state = GOTOWARD;
                        var ward = getRandomWardTarget()
                        doctor.target.row = ward[0]
                        doctor.target.col = ward[1]
                    }
                }  

			}
		break;
        case GOTOREST:
			if (hasArrived){             // doctor has arrived at communal area

                // determine if undiagnosed infected doctor gets diagnosed upon arrival
				// doctor.type remains as "I" during change in color state
				if (doctor.color == "orange") {       
					if (Math.random() < DiagnosisRate) {       
						doctor.color = "red"        // infected and diagnosed
					}
				}

                // check that doctor is not diagnosed as infected
                if (!(doctor.color == "red")) {    // doctor not red
                    doctor.state = RESTING
                } 
                // if doctor is diagnosed as infected, go to isolation ward
                else if (doctor.color == "red") {  // doctor is red

                    // check if isolation ward has available beds
                    if (isolationWard.numPatients < isolationWard.capacity){
                        doctor.state = GOTOISOLATION;
                        doctor.target.row = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1))
                        doctor.target.col = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1))
                        isolationWard.numPatients++   // infected doctor is assigned a bed in the isolation ward
                    } 
                    // else infected doctor will go to isolation waiting area
                    else {
                        doctor.state = GOTOWAIT;
                        doctor.target.row = getRandomInt(waitingArea.startRow, (waitingArea.startRow + waitingArea.numRows - 1))
                        doctor.target.col = getRandomInt(waitingArea.startCol, (waitingArea.startCol + waitingArea.numCols - 1))

						statistics[2].count++     // no. of infected people turned away due to full isolation ward

						// add infected doctor to infectedwaitinglist
						var newinfected = {
							"id":doctor.id,
							"type":"doctor",
							"waitingid":nextWaitingID
						}; 
						nextWaitingID++
						infectedwaitinglist.push(newinfected)

                    }
                }
                /// add more when we deal with more color states/types

			}
		break;
        case RESTING:
			if (hasArrived){                 // doctor is resting at communal area
                
                // if doctor will not continue resting
                if (Math.random() > probResting) {
                    doctor.state = GOTOWARD;
                    var ward = getRandomWardTarget()
                    doctor.target.row = ward[0]
                    doctor.target.col = ward[1]
                }
			}
		break;
        case GOTOISOLATION:
			if (hasArrived){                // infected doctor has arrived at isolation ward 
                doctor.state = ISOLATED  

                // isolationWard.numPatients has been updated in the other states, upon assignment of a bed in the isolation ward
				
			}
		break;
		case ISOLATED:
			if (hasArrived){
                
                // if recovered, doctor goes back to work (but let them go to communal rest area first)
                if (Math.random() < probRecoveryYes){      // TODO consider a different probability value for doctors (lower prob) or consider 0.1*probRecoveryYes
                    doctor.state = GOTOREST;
                    doctor.target.row = getRandomInt(communalArea.startRow, (communalArea.startRow + communalArea.numRows - 1))
                    doctor.target.col = getRandomInt(communalArea.startCol, (communalArea.startCol + communalArea.numCols - 1))

					doctor.type = "H"       // doctor is now healthy
					doctor.color = "blue"   // doctor is immune upon recovery

					// decrement number of infected people in isolation ward
					isolationWard.numPatients--
                }

			}
		break;
        case GOTOWAIT:
			if (hasArrived){                            // infected doctor has arrived at isolation waiting area
                doctor.state = WAITING

                /// update number of patients in isolation waiting area in stats (if we want to include this in our stats display)
				statistics[4].count++;
                
			}
		break;
        case WAITING:                                   // infected doctor is waiting in the isolation waiting area
			if (hasArrived){

                // check if isolation ward has available beds
                if (isolationWard.numPatients < isolationWard.capacity){

					var nextIsoPerson = findNextIsoPerson()

					if (nextIsoPerson[0] == "doctor" && doctor.id == nextIsoPerson[1]){
						
						doctor.state = GOTOISOLATION;
                    	doctor.target.row = getRandomInt(isolationWard.startRow, (isolationWard.startRow + isolationWard.numRows - 1))
                    	doctor.target.col = getRandomInt(isolationWard.startCol, (isolationWard.startCol + isolationWard.numCols - 1))
                    	isolationWard.numPatients++   // infected doctor is assigned a bed in the isolation ward
					
						// update number of patients in isolation waiting area (-1)
						statistics[4].count--;

						// remove this infected doctor from the infectedwaitinglist
						infectedwaitinglist = infectedwaitinglist.filter(function (d) {
							return d.waitingid != nextIsolationID 
						})

						// update nextIsolationID
						nextIsolationID++
	
					}
                    
                }
                
			}
		break;
		default:
        break;
        
        
	}
    
    
   // set the destination row and column
	var targetRow = doctor.target.row
	var targetCol = doctor.target.col
	// compute the distance to the target destination
	var rowsToGo = targetRow - row
	var colsToGo = targetCol - col
	// set the speed
	var cellsPerStep = 1
	// compute the cell to move to
	var newRow =
		row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo)
	var newCol =
		col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo)
	// update the location of the patient
	doctor.location.row = newRow
	doctor.location.col = newCol
	
}

function updateDynamicDoctors() {
	// loop over all the agents and update their states
	for (var doctorIndex in doctors) {
		updateDoctors(doctorIndex)
	}
	updateSurface()
}

/////////////////////////////////////////   suzanne doctors code end    ///////////////////////////////////////////////////

function simStep(){
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning){ //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		currentTime++;
		// Sometimes new agents will be created in the following function
		// divya added
		addDynamicPatients();
		// In the next function we update each agent
        updateDynamicDoctors();
		updateDynamicPatients();
		// Sometimes agents will be removed in the following function
		removeDynamicPatients();
		// divya end
		
		//TODO CHANGE: Update statistics
		//cumratioinfected=cumratioinfected+(statistics[1].count/(statistics[0].count+0.001)); //tbc if we're using cumratioinfected
        //statistics[4].count=; //TODO: figure out how to decrement from statistics[2]
	}
}