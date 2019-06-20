app.component('onOffToggle', {
    bindings: {
      value: '=',
      disabled: '='
    },
    transclude: true,
    template: '<form class="form-inline">\
                       <span ng-transclude></span>\
                       <switch class="small" ng-model="vm.value" ng-disabled="vm.disabled"/>\
                     </form>',
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      debugger;
      var vm = this;
      $scope.$watch("vm.disabled", function (val) {
        if (!val) {
          vm.value = undefined;
        }
      })
    }]
  });
  debugger;