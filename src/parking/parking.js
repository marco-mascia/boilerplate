import './scss/parking.scss';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

let data;

let messages = {
    toggleOpenMessage: 'mostra dettagli',
    toggleCloseMessage: 'nascondi dettagli',
    addItem: 'prenota',
    removeItem: 'cancella'
};

export function init(jsonData) {
    data = jsonData;


    let template = require("./parking-vendor.handlebars");
    let $temporary = template({
         book: jsonData.dictionary.bookYourParking,
         name: jsonData.vendor.name,
         departure: jsonData.vendor.departureAirport,
         map: jsonData.vendor.map,
         featuresTitle: jsonData.dictionary.featuresTitle,
         features: jsonData.vendor.features,
         toggleMessage: messages.toggleOpenMessage
    });

    $(document.body).append($temporary);
 
    jsonData.parkings.map(function(parking) {
        $('.flex__container').append(createParkingElement(parking));
    });

    /* events */
    $('.toggle-box .toggle').click(function(e){
        e.preventDefault();
        $(this).next('.content').slideToggle();

        let text = $(this).text().trim();
        $(this).text(text == messages.toggleOpenMessage ? messages.toggleCloseMessage : messages.toggleOpenMessage);
    });

    $('.parking__slot').click(function(e){
        e.preventDefault();
        $(this).toggleClass('selected');
        $(this).children('.triangle').toggleClass('selected');
        
        let $button = $(this).children('.features').toggleClass('selected').children('.book');
        $button.toggleClass('selected');
        let buttonText = $button.text().trim();

        $button.text(buttonText == messages.addItem ? messages.removeItem : messages.addItem);

        let parkingId = $(this).attr('id');
        //manageFeedbackData(parkingId);

        var bc = new BroadcastChannel('parking_channel');
        bc.postMessage(manageFeedbackData(parkingId));
        bc.close();
    });
}

/* Not quite a to be honest... see readme */
function manageFeedbackData(parkingId){
    let slots = $('.vendor').attr('selected-slots');
    if (!slots){
        slots = [];
    }else{
        slots = slots.split(',');
    }

    let index = slots.indexOf(parkingId);
    
    if(index != -1){
        slots.splice(index, 1);
    }else{
        slots.push(parkingId);
    }
    $('.vendor').attr('selected-slots', slots);

    return slots;
}


function createParkingElement(pData){
   let template = require("./parking-slot.handlebars");
   let $element = template({
        id: pData.id,
        indoor: pData.indoor ? data.dictionary.indoorSpace : data.dictionary.outdoorSpace,
        insurance: pData.insurance ? data.dictionary.insuranceIncluded : data.dictionary.insuranceExcluded,
        price: pData.price
    });
    return $element;
}