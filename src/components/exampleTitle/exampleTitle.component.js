
import { exampleController } from './exampleTitle.controller';

export default {
    template: require('./exampleTitle.template.html'),
    controller: exampleController,
    bindings: {
        mytext: '<'
    }
}