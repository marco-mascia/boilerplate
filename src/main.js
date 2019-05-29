import './scss/main.scss';

/*
const arr = [1, 2, 3];
const iAmJavascriptES6 = () => console.log(...arr);
window.iAmJavascriptES6 = iAmJavascriptES6;
*/

let messages = {
    header: 'intestazione',
    main: 'corpo',
    aside: 'lato',
    footer: 'piè di pagina'
}

export function init() {

    /*
    let template = require("./index.handlebars");

    let $temporary = template({
        header: messages.header,
        main: messages.main,
        aside: messages.aside,
        footer: messages.footer
    });

    $(document.body).append($temporary);
    */

    /*
   var src = document.getElementById('#print-script'); //$("#print-script").html();
   var source = src.innerHTML();
   var template = Handlebars.compile(source);
   var data = {
       image:        'http://placekitten.com/100/100',
       title:        'title',
       caption:      'caption',
       category:     function() {
           console.log('category');
           return 'category';
       } 
   };

   */
   //$("#print-template").html(template(data));


   /*
   let template = require("./index.handlebars");
   let $compiled = template({});
   $(document.body).append($compiled)
   */


}

init();
