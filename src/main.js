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


Promise.all([flare, crop, artic, jobs]).then(res => {
    drawChart(res[0]);      
})

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
        {name:'flare', value: flare},
        {name:'crop', value: crop},
        {name:'artic', value: artic},
        {name:'jobs', value: jobs}        
    ];

    $scope.datasourceList.push({name:'random', value: gen_fake_data(100, 10)})

    /*
    $scope.cubeSourceList = flare.filter((item) => {
        let arr = item.name.split(".");                     
        return arr[0] + '.' + arr[1] === 'flare.animate';        
    });
    */

    $scope.cubeSourceList = artic.filter((item) => {
        let arr = item.name.split(".");                     
        return arr[0] + '.' + arr[1] === 'flare.AllScales';        
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
        clicked();
    }

    $scope.switchDatasource = function(){        
        d3.select("#impact").remove();    
        drawChart($scope.selectedDatasource.value);     
    }

    function buildCombo(){

    }

  });  

/* --------------------------------------------------------- */


/* JQUERY --------------------------------------------------- */
$( document ).ready(function() {
    $('.cubeList').click(function() {
        selectEntity($(this).find('p').text());
    });
});
/* --------------------------------------------------------- */

