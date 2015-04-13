
zaa.controller("UploadController", function($scope) {

	$scope.bildId = 0;
	
	$scope.save = function()
	{
		console.log('save', $scope.bildId);
	}
	
})

zaa.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

zaa.directive('storageFileUpload', function() {
	return {
		restrict : 'E',
		scope : {
			ngModel : '='
		},
		controller : function($scope, $http) {
			if ($scope.ngModel) {
				$http.get('admin/api-admin-storage/file-path', { params: { fileId : $scope.ngModel } }).success(function(response) {
					$scope.filesrc = response.source_http;
				}).error(function(response) {
					console.log('error', response);
				})
			}
			
			$scope.showFileManager = true;
			
			$scope.$watch(function() { return $scope.ngModel }, function(newValue, oldValue) {
				if (newValue) {
					$scope.showFileManager = true;
				}
			});
			
			$scope.toggleFileManager = function() {
				console.log($scope.showFileManager);
				$scope.showFileManager = !$scope.showFileManager;
			}
			
			$scope.push = function()
			{
				var fd = new FormData();
		        fd.append('file', $scope.myFile);
		        $http.post('admin/api-admin-storage/files-upload', fd, {
		            transformRequest: angular.identity,
		            headers: {'Content-Type': undefined}
		        })
		        .success(function(r){
		        	if (!r[$scope.myFile.name]['error']) {
		        		$scope.ngModel = r[$scope.myFile.name]['id'];
		        		$scope.filesrc = r[$scope.myFile.name]['file']['source_http'];
		        	} else {
		        		alert('ERROR WHILE FILE UPLOAD' + r[$scope.myFile.name]['message']);
		        	}
		        	
		        })
		        .error(function(r){
		        	alert('ERROR WHILE FILE UPLOAD');
		        	console.log(r);
		        });
				
			}
		},
		templateUrl : 'storageFileUpload'
	}
});

zaa.directive('storageImageUpload', function() {
	return {
		restrict : 'E',
		scope : {
			ngModel : '='
		},
		controller : function($scope, $http, ApiAdminFilter) {
			
			if ($scope.ngModel) {
				$http.get('admin/api-admin-storage/image-path', { params: { imageId : $scope.ngModel } }).success(function(response) {
					$scope.imagesrc = response.source;
					$scope.fileId = response.file_id;
				}).error(function(response) {
					console.log('error', response);
				})
			}
			
			$scope.filters = ApiAdminFilter.query();
			
			$scope.push2 = function() {
				$http.post('admin/api-admin-storage/image-upload', $.param({ fileId : $scope.fileId, filterId : $scope.filterId }), {
		        	headers : {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		        }).success(function(success) {
		        	if (!success) {
		        		alert('IMAGE UPLOAD ERROR!');
		        	} else {
		        		$scope.ngModel = success.id;
		        		
		        		$scope.imagesrc = success.image.source;
		        		
		        	}
				}).error(function(error) {
					console.log('err', error);
				});
			}
			
		},
		templateUrl : 'storageImageUpload'
	}
});

zaa.directive("storageFileManager", function() {
	return {
		restrict : 'E',
		transclude : false,
		scope : {
			ngModel : '=',
			isHidden : '=',
			allowSelection : '@selection'
		},
		transclude : false,
		controller : function($scope, $http) {
			$scope.files = [];
			$scope.folders = [];
			$scope.breadcrumbs = [];
			$scope.currentFolderId = 0;
			$scope.allowSelection = $scope.allowSelection || true; 
			
			$scope.createNewFolder = function(newFolderName) {
				newFolderName
				$http.post('admin/api-admin-storage/folder-create', $.param({ folderName : newFolderName , parentFolderId : $scope.currentFolderId }), {
		        	headers : {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		        }).success(function(transport) {
		        	if (transport) {
		        		$scope.getFiles($scope.currentFolderId);
		        	}
		        });
			}
			
			$scope.selectFile = function(file) {
				$scope.ngModel = file.id;
			}
			
			$scope.loadFolder = function(folderId) {
				$scope.currentFolderId = folderId;
				$scope.getFiles(folderId);
			}
			
			$scope.getFiles = function(folderId) {
				$http.get('admin/api-admin-storage/files', { params : { folderId : folderId } }).success(function(response) {
					$scope.folders = response.folders;
					$scope.files = response.files;
					$scope.breadcrumbs = response.breadcrumbs;
				});
			}
			
			$scope.getFiles(0);
		},
		templateUrl : 'storageFileManager'
	}
})