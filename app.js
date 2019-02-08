var rainbow = new Rainbow()
rainbow.setSpectrum("#42f4a7","#9941f2");

angular.module("myApp", [])
.controller("myCtrl", function($scope, $http) {
	$scope.dali_data = []
	$scope.projects = {}
	$scope.charts = {
		'termChart': 'On Terms', 
		'projectChart': "Project Distribution",
	}
	$scope.selectedChart = $scope.charts[0]
	$scope.geomapMarkers = []
	$http.get("/members.json").then(function(res){
			$scope.dali_data = res.data
			if ($scope.dali_data){
				for (var node of $scope.dali_data) {
					if (node.project.length == 0){
						node.project = new Array("")
					}
				}
			}
			$scope.updateTerms()
			$scope.updateProjects()
			$scope.init()
		});
	$scope.checkSort = function(actual, expected){
		if (typeof expected == 'object') {
			if (expected.length == 0) {
				return true
			}
			for (var project of expected) {
				if (actual.indexOf(project) > -1){
					return true
				}
			}
		}
		else if (typeof expected == 'string' && typeof actual == 'string'){
			if (actual.includes(expected)) {
				return true
			}
		}
		return false
	}
	$scope.saveData = function() {
		$http.post('/saveData', $scope.dali_data).then(function(res){
			if (res.data){
				alert("Saved!")
			}
		})
	}

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

	$scope.updateChartsView = function() {
		$scope.ctx = $("#"+$scope.selectedChart)
		var colorsArray = new Array()
		i = 0
		for (var key in $scope.projects){
			colorsArray.push("#"+rainbow.colorAt(i))
			i += parseInt(100 / Object.keys($scope.projects).length)
		}
		if ($scope.ctx[0] !== undefined){
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
		$scope.updateCharts()
	}

	$scope.updateCharts = function() {
		$scope.updateTerms()
		$scope.termChart.data.labels = Object.keys($scope.terms)
		$scope.termChart.data.datasets[0].data = Object.values($scope.terms)
		$scope.termChart.update();

		$scope.updateProjects()
		$scope.projectChart.data.labels = Object.keys($scope.projects)
		$scope.projectChart.data.datasets[0].data = Object.values($scope.projects)
		$scope.projectChart.update();

		$scope.updateGeoMap()
	}
	$scope.updateGeoMap = function() {
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
	$scope.init = function() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuamNhcGUiLCJhIjoiY2pydG83cHhjMDI5aTQ0bWtyMHh2dHc2cSJ9.JbWYHd47sCFP1hE1I8X_0Q';
		$scope.geomap = new mapboxgl.Map({
			container: 'geoChart', // container id
			style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
			center: [-72.2925909, 43.7047927], // starting position [lng, lat]
			zoom: 5, // starting zoom
			trackResize: true
		});
		$scope.updateGeoMap()
	}

	if ($scope.selectedChart == 'geomap'){
		$scope.geomap.resize()
	}
})