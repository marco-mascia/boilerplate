import './scss/main.scss';
import flare3 from '../assets/flare3.json';
//import * as d3 from "d3";
import clicked from './chart.ts'
import drawChart from './chart.ts'
import flare from '../assets/flare.json';
import megaflare from '../assets/megaflare.json';
import crop from '../assets/crop.json';
import artic from '../assets/artic.json';
import artic2 from '../assets/artic2.json';
import jobs from '../assets/jobs.json';
import flaredefault from '../assets/flaredefault.json';
import { selectEntity } from './chart.ts';
import { deselectEntity } from './chart.ts';
import { toggleEntity } from './chart.ts';
import gen_fake_data from './fakedata.ts';

/**
 * 
 * USES D3.V3
 * 
 */
angular.module('ImpactAnalisysDemo', ['ngMaterial', 'ngMessages']);
angular.module('ImpactAnalisysDemo').controller('AccordionCtrl', function ($scope) {

    /*
    function editFlare(){
        $scope.flaredata = jobs.filter((item) => {        
            let arr = item.name.split(".");
            item.group = arr[1];    
            return item;
        })        
    }
    */
    
    //editFlare();

    $scope.isCubes = false;
    $scope.isEntities = false;
    $scope.isCapsules = false;

    $scope.cubeSourceList = [];
    $scope.entitiesSourceList = [];   
    $scope.capsulesSourceList = [];   

    $scope.datasourceList = [
        {name:'megaflare', value: megaflare},
        {name:'flare', value: flare},
        {name:'artic', value: artic},
        //{name:'artic2', value: artic2},        
        //{name:'crop', value: crop},
        {name:'jobs', value: jobs},
        //{name:'flaredefault', value: flaredefault}   
    ];


    /*

    FAKE DATA GENERATION

    let fakeSizeNr = getRandomInt(10, 100);
    let fakeGroupsNr = getRandomInt(10, 100);
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
      }

    $scope.datasourceList.push({name:'random', value: gen_fake_data(fakeSizeNr, fakeGroupsNr)})
  
    */
    $scope.select = function(item){           
        clicked();
    }

    $scope.selectedDatasource = $scope.datasourceList[0];
    drawChart($scope.selectedDatasource.value);  
    buildCombo();
    
    $scope.switchDatasource = function(){        
        d3.select("#impact").remove();  
        drawChart($scope.selectedDatasource.value);   
        buildCombo();
    }

    function buildCombo(){
        let entities = $scope.selectedDatasource.value.map(
            (item) => {
                let arr = item.name.split(".");
                return arr[1];
            } );

        entities = entities.filter((v,i) => entities.indexOf(v) === i);
              
        $scope.cubeSourceTitle = entities[0]; 
        $scope.cubeSourceList = $scope.selectedDatasource.value.filter((item) => {
            item.selected = true;
            let arr = item.name.split(".");
            return arr[0] + '.' + arr[1] === 'flare.'+entities[0];        
        });

        $scope.entitiesSourceTitle = entities[1]; 
        $scope.entitiesSourceList = $scope.selectedDatasource.value.filter((item) => {
            item.selected = true;
            let arr = item.name.split(".");                     
            return arr[0] + '.' + arr[1] === 'flare.'+entities[1];        
        });

        $scope.capsulesSourceTitle = entities[2];    
        $scope.capsulesSourceList = $scope.selectedDatasource.value.filter((item) => {
            item.selected = true;
            let arr = item.name.split(".");                         
            return arr[0] + '.' + arr[1] === 'flare.'+entities[2];        
        }); 
    }


    $scope.selectGroup = function(list){
        console.log('selectGroup');
        event.stopPropagation();       
        list.forEach(item => {
            toggleEntity(item.name);  
        });
    }


    /*
    $scope.getItemName = function(item){
        let arr = item.name.split(".");
        return arr[arr.length-1];
    }
    */

    $scope.selectEntity = function(item){  
      //item.selected = !item.selected;
      toggleEntity(item.name);     
    }

  });  

/* --------------------------------------------------------- */


/* JQUERY --------------------------------------------------- */
$( document ).ready(function() {
    
});
/* --------------------------------------------------------- */

