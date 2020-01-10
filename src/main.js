import './scss/main.scss';
import flare3 from '../assets/flare3.json';
//import * as d3 from "d3";
import clicked from './chart.ts'
import drawChart from './chart.ts'
import flare from '../assets/flare.json';
import crop from '../assets/crop.json';
import artic from '../assets/artic.json';
import jobs from '../assets/jobs.json';

Promise.all([flare, crop, artic, jobs]).then(res => {
    drawChart(res);  
})

/**
 * 
 * USES D3.V3
 * 
 */
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

  });
  

/* --------------------------------------------------------- */

