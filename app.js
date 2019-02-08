var rainbow = new Rainbow()
rainbow.setSpectrum("#42f4a7","#9941f2");

angular.module("myApp", [])
.controller("myCtrl", function($scope, $http) {
	// Initialize the structures that will hold the data
	$scope.dali_data = [] // All of the people, will call each person within this array a node
	$scope.projects = {} // All of the projects, this is an object becuase each project will have a number assigned to how many people are in it
	$scope.charts = { // The charts, for easy access and to display
		'termChart': 'On Terms', 
		'projectChart': "Project Distribution",
	}
	$scope.selectedChart = Object.keys($scope.charts)[0] // Start selected Shart at something simple
	$scope.geomapMarkers = [] // This will hold all of the people's markers for the map
	$http.get("/members.json").then(function(res){ // Fetch the data
			$scope.dali_data = res.data // Make our dali_data equal to the data we imported
			if ($scope.dali_data){  // Check to make sure it exists
				for (var node of $scope.dali_data) {  // iterate over each node (person)
					if (node.project.length == 0){ // If their project array is empty
						node.project = new Array("") // Make it an array with one element that is empty, this makes things easier for sorting
					}
				}
			}
			$scope.initCharts() // Initiate all the Charts
			$scope.initGeoMap() // Initiate the Geomap
			$scope.updateDataSets() // Update the Projects, Terms, and Markers lists. 
		});

	// Functions
	$scope.checkSort = function(actual, expected){ // Custom sort function for the query
		if (typeof expected == 'object') {
			if (expected.length == 0) {
				return true // Allow if our expected is an object, and it has length zero, this will return all of the nodes
			}
			for (var project of expected) {
				if (actual.indexOf(project) > -1){
					return true // If the node we are checking contains something from the node we are querying
				}  
			}
		}
		else if (typeof expected == 'string' && typeof actual == 'string'){
			if (actual.includes(expected)) {
				return true // If the string we are checking contains the string we are checking for
			}
		}
		return false
	}

	// Saves the data back to the .txt file so that we can keep our data safe and sound
	$scope.saveData = function() {
		$http.post('/saveData', $scope.dali_data).then(function(res){
			if (res.data){
				alert("Saved!")
			}
		})
	}

	// Initiates the Charts
	$scope.initCharts = function() {
		var ctx = $("#"+$scope.selectedChart) // This is DOM object that will be the canvas for each respective Chart
		var colorsArray = new Array()
		i = 0
		for (var key in $scope.projects){
			colorsArray.push("#"+rainbow.colorAt(i))
			i += parseInt(100 / Object.keys($scope.projects).length)
		}
		console.log(colorsArray)
		if (ctx[0] !== undefined){ // Checks to make sure that the canvas DOM element is there
			$scope.termChart = new Chart($("#termChart"), {
			    type: 'bar',
			    data: {
			        labels: [],
			        datasets: [{
			            label: [],
			            data: [],
			            backgroundColor:colorsArray,
			            borderWidth: 1
			        }]
			    },
			    options: {
			        scales: {
			            yAxes: [{
			                display:false
			            }]
			        },
			        legend: {
			        	display: false
			        }
		    	}
			});
			$scope.projectChart = new Chart($("#projectChart"), {
			    type: 'polarArea',
			    data: {
			        labels: [],
			        datasets: [{
			            label: [],
			            data: [],
			            backgroundColor:colorsArray,
			            borderWidth: 1
			        }]
			    },
			    options: {
			        scales: {
			            yAxes: [{
			            	display:false,		    
			            }]
			        },
			        legend: {
			        	display: false
			        }
		    	}
			});
		}
	}

	// This initiates the GeoMap. This is seperate, becuase we don't want to update the GeoMap everytime the <select> to change the chart is changed
	$scope.initGeoMap = function() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuamNhcGUiLCJhIjoiY2pydG83cHhjMDI5aTQ0bWtyMHh2dHc2cSJ9.JbWYHd47sCFP1hE1I8X_0Q';
		$scope.geomap = new mapboxgl.Map({
			container: 'geoChart', // container id
			style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
			center: [-72.2925909, 43.7047927], // starting position [lng, lat]
			zoom: 5, // starting zoom
			trackResize: true
		});
	}

	// Iterates over the information from dali_data and refreshes the information in terms dictionary
	$scope.updateTerms = function() {
		$scope.terms = {
			'19W' : 0,
			'19S' : 0,
			'19X' : 0,
			'19F' : 0,
			'20W' : 0
		}
		for (var node of $scope.dali_data) {
			for (var term of node.terms_on){
				if (term in $scope.terms) {
					$scope.terms[term] += 1
				} else {
					$scope.terms[term] = 1
				}
			}
		}
	}

	// Iterates over the information from dali_data and refreshes the information in projects dictionary
	$scope.updateProjects = function() {
		$scope.projects = {}
		for (var node of $scope.dali_data) {
			for (var project of node.project) {
				if (project in $scope.projects){
					$scope.projects[project] += 1
				} else if (project != "") {
					$scope.projects[project] = 1
				}
			}
		}
	}
	// Removes all of the old markers, and creates the new ones.
	$scope.updateMarkers = function() {
		for (var mark of $scope.geomapMarkers){
				mark.remove()
			}
		for (var node of $scope.dali_data){
			var popup = new mapboxgl.Popup({className: 'popup'})
				.setHTML("<a href='#"+node.name+"'>"+node.name+"</a>")
			var el = document.createElement('img')
			el.src = "http://mappy.dali.dartmouth.edu/"+node.iconUrl
			el.className = "marker"
			var marker = new mapboxgl.Marker(el)
			marker.setLngLat([node.lat_long[1],node.lat_long[0]])
				.setPopup(popup)
				.addTo($scope.geomap)
			$scope.geomapMarkers.push(marker)
		}
	}

	// Updates all the data sets
	$scope.updateDataSets = function() {
		$scope.updateTerms()
		$scope.updateProjects()
		$scope.updateMarkers()
	}

	// Update all the Charts together, not the GeoMap though.
	$scope.updateCharts = function() {
		$scope.initCharts()
		$scope.updateTerms()
		$scope.updateProjects()

		$scope.termChart.data.labels = Object.keys($scope.terms)
		$scope.termChart.data.datasets[0].data = Object.values($scope.terms)
		$scope.termChart.update();

		$scope.projectChart.data.labels = Object.keys($scope.projects)
		$scope.projectChart.data.datasets[0].data = Object.values($scope.projects)
		$scope.projectChart.update();
	}



	if ($scope.selectedChart == 'geomap'){
		$scope.geomap.resize()
	}
})