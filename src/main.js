import './scss/main.scss';
import flare3 from '../assets/flare3.json';
//import * as d3 from "d3";
import clicked from './chart.ts'
import drawChart from './chart.ts'
import flare from '../assets/flare.json';
import crop from '../assets/crop.json';
import artic from '../assets/artic.json';
import jobs from '../assets/jobs.json';
import { selectEntity } from './chart.ts';
import drawCircles from './circles.ts';
import gen_fake_data from './fakedata.ts';

/*
Promise.all([flare, crop, artic, jobs]).then(res => {
    drawChart(res[0]);      
})
*/

/*
setTimeout(function(){     
    d3.select("#impact").remove();    
    Promise.all([flare, crop, artic, jobs]).then(res => {
        drawChart(res[1]);          
    })
}, 5000);
*/



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

    $scope.datasourceList = [
        {name:'artic', value: artic},
        {name:'flare', value: flare},
        {name:'crop', value: crop},
        {name:'jobs', value: jobs}        
    ];

    let fakeSizeNr = getRandomInt(10, 100);
    let fakeGroupsNr = getRandomInt(10, 100);
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
      }

    $scope.datasourceList.push({name:'random', value: gen_fake_data(fakeSizeNr, fakeGroupsNr)})
  
    $scope.select = function(item){           
        clicked();
    }

    $scope.selectedDatasource = $scope.datasourceList[0];
    buildCombo();
    drawChart($scope.selectedDatasource.value);  

    $scope.switchDatasource = function(){        
        d3.select("#impact").remove();    
        drawChart($scope.selectedDatasource.value);   
        buildCombo()  
    }

    function buildCombo(){
        let entities = $scope.selectedDatasource.value.map(
            (item) => {
                let arr = item.name.split(".");
                return arr[1];
            } );

        entities = entities.filter((v,i) => entities.indexOf(v) === i);
        
        $scope.cubeSourceList = $scope.selectedDatasource.value.filter((item) => {
            let arr = item.name.split(".");                     
            return arr[0] + '.' + arr[1] === 'flare.'+entities[0];        
        });

        $scope.entitiesSourceList = $scope.selectedDatasource.value.filter((item) => {
            let arr = item.name.split(".");                     
            return arr[0] + '.' + arr[1] === 'flare.'+entities[1];        
        });

        $scope.capsulesSourceList = $scope.selectedDatasource.value.filter((item) => {
            let arr = item.name.split(".");                     
            return arr[0] + '.' + arr[1] === 'flare.'+entities[2];        
        }); 
    }

    $scope.selectEntity = function(item){
       selectEntity(item.name);    
    }

  });  

/* --------------------------------------------------------- */


/* JQUERY --------------------------------------------------- */
$( document ).ready(function() {
    
});
/* --------------------------------------------------------- */

