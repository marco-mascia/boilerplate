import './scss/main.scss';
import flare3 from '../assets/flare3.json';
//import * as d3 from "d3";

export function init() {
    console.log('init');
    /*
    d3.json('assets/grafo.json').then(res => {
        console.log('local json: ', res);
    })
    */     
}
//init();


import clicked from './chart.ts'
import drawChart from './chart.ts'
import flare from '../assets/flare.json';
import crop from '../assets/crop.json';
import artic from '../assets/artic.json';

Promise.all([flare, crop, artic]).then(res => {
    drawChart(res);  
})

/*
import(
    '../assets/flare.json'
).then(({ default: jsonData }) => {
    drawChart(jsonData);     
})
*/

/*
import drawChart from './filteredChart.ts'
import(
    '../assets/flare3.json'
).then(({ default: jsonData }) => {
    drawChart(jsonData);  
});
*/

/*
import drawChart from './tensionChart.ts'
import(
    '../assets/flare.json'
).then(({ default: jsonData }) => {
   drawChart(jsonData);  
});
*/
function test(){
    console.log('test');
}


angular.module('ImpactAnalisysDemo', ['ngMaterial', 'ngMessages']);
angular.module('ImpactAnalisysDemo').controller('AccordionCtrl', function ($scope) {

    $scope.isCubes = false;
    $scope.isEntities = false;
    $scope.isCapsules = false;

    $scope.cubeSourceList = [];
    $scope.entitiesSourceList = [];   
    $scope.capsulesSourceList = [];   

    $scope.cubeSourceList = flare.filter((item) => {
        let arr = item.name.split(".");                     
        return arr[0] + '.' + arr[1] === 'flare.animate';        
    });

    $scope.entitiesSourceList = flare.filter((item) => {
        let arr = item.name.split(".");                     
        return arr[0] + '.' + arr[1] === 'flare.query';        
    });

    $scope.capsulesSourceList = flare.filter((item) => {
        let arr = item.name.split(".");                     
        return arr[0] + '.' + arr[1] === 'flare.analytics';        
    });

    
    $scope.select = function(item){
        console.log('item ', item);        
        clicked();
    }
    

    /*
    
    const cubeNr = 20;
    const entitiesNr = 20;
    const capsulesNr = 20;

    for (let index = 0; index < cubeNr; index++) {        
        $scope.cubeSourceList.push({ name: 'Cube name '+ index });        
    }    
       
    for (let index = 0; index < entitiesNr; index++) {        
        $scope.entitiesSourceList.push({ name: 'Entity name '+ index });        
    }

    for (let index = 0; index < capsulesNr; index++) {        
        $scope.capsulesSourceList.push({ name: 'Capsule name '+ index });        
    }
    */

    //$scope.cubesStyle = {'height': cubeNr * 32 + 'px'};

    /*
    $scope.oneAtATime = true; 
  
    $scope.items = ['Item 1', 'Item 2', 'Item 3'];
  
    $scope.addItem = function() {
      var newItemNo = $scope.items.length + 1;
      $scope.items.push('Item ' + newItemNo);
    };
  
    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };
    */
   
  });
  

//init();

/* --------------------------------------------------------- */

