
import angular from 'angular'
import exampleTitle from './exampleTitle/exampleTitle.component'
import { exampleController } from './exampleTitle/exampleTitle.controller.js';

export default angular.module('app.components', [])
  .component('exampleTitle', exampleTitle)
  .name