"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
//const utils = require("@iobroker/adapter-core");
//import { utils } from "@iobroker/adapter-core";
//import('linky.Session');
import  * as utils   from '@iobroker/adapter-core';
import { Session } from "linky";
// Load your modules here, e.g.:
//import * as fs from 'fs';
/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;
/*
 * Starts the adapter instance
 * @param {Partial<utils.AdapterOptions>} [options]
 */
function cleanInt(x) {
    x = Number(x);
    return x >= 0 ? Math.floor(x) : Math.ceil(x);
}
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: "linky",

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                // Here you must clear all timeouts or intervals that may still be active
                // clearTimeout(timeout1);
                // clearTimeout(timeout2);
                // ...
                // clearInterval(interval1);

                callback();
            } catch (e) {
                callback();
            }
        },

        // If you need to react to object changes, uncomment the following method.
        // You also need to subscribe to the objects with `adapter.subscribeObjects`, similar to `adapter.subscribeStates`.
        // objectChange: (id, obj) => {
        //     if (obj) {
        //         // The object was changed
        //         adapter.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        //     } else {
        //         // The object was deleted
        //         adapter.log.info(`object ${id} deleted`);
        //     }
        // },

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            if (state) {
                // The state was changed
                adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            } else {
                // The state was deleted
                adapter.log.info(`state ${id} deleted`);
            }
        },

        // If you need to accept messages in your adapter, uncomment the following block.
        // /**
        //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
        //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
        //  */
        // message: (obj) => {
        //     if (typeof obj === "object" && obj.message) {
        //         if (obj.command === "send") {
        //             // e.g. send email or pushover or whatever
        //             adapter.log.info("send command");

        //             // Send response in callback if required
        //             if (obj.callback) adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
        //         }
        //     }
        // },
    }));
}

async function main() {
    
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.setObjectNotExistsAsync("conso_electrique", {
        type: 'folder',
        common: {
			name: 'consomation_electrique',
			type: 'string',
			read: true,
			write: true,
			role: '',
		},
		native: {}
	});
    adapter.setObjectNotExistsAsync("puissance_moyenne", {
        type: 'folder',
        common: {
			name: 'courbe_puissance_moyenne',
			type: 'string',
			read: true,
			write: true,
			role: '',
		},
		native: {}
	});
    adapter.log.info("config token_enedis: " + adapter.config.token_enedis);
    const token =  adapter.config.token_enedis;
    console.log(token);
    const session = new Session(token);

    adapter.setObjectNotExistsAsync("conso_electrique.wh_d", {
		type: 'state',
		common: {
			name: 'Wh_Day',
			type: 'mixed',
			read: true,
			write: true,
			role: 'state',
		},
		native: {}
	});
    adapter.setObjectNotExistsAsync("conso_electrique.w_d", {
		type: 'state',
		common: {
			name: 'Watt_Day',
			type: 'mixed',
			read: true,
			write: true,
			role: 'state',
		},
		native: {}
	});
    adapter.setObjectNotExistsAsync("conso_electrique.date", {
		type: 'state',
		common: {
			name: 'date',
			type: 'string',
			read: true,
			write: true,
			role: 'state',
		},
		native: {}
	});
var  i=0;
    while  (i<48) {var j=i.toString();
        if (i<10) {j="0"+j;}
        adapter.setObjectNotExistsAsync("puissance_moyenne."+j , {
            type: 'folder',
            common: {
                name: 'date',
                type: 'string',
                read: true,
                write: true,
                role: 'state',
            },
            native: {}
        });
        adapter.setObjectNotExistsAsync("puissance_moyenne."+j+".pmoy_d", {
            type: 'state',
            common: {
                name: 'power_Day',
                type: 'mixed',
                read: true,
                write: true,
                role: 'state',
            },
            native: {}
        });
        adapter.setObjectNotExistsAsync("puissance_moyenne."+j+".heure", {
            type: 'state',
            common: {
                name: 'date',
                type: 'string',
                read: true,
                write: true,
                role: 'state',
            },
            native: {}
        });
    i++;}
    adapter.sendTo('sql.0', 'query', 'CREATE TABLE IF NOT EXISTS conso_elec (Date timestamp,Wh VARCHAR(10),W VARCHAR(10),detail_w);');
        
    await session.getDailyConsumption('2024-10-14', '2024-10-15').then((result) =>  { 
        try {
            console.log(result);
            var w0= cleanInt(result.interval_reading[0].value); 
            var d0= result.interval_reading[0].date ;
            //const w = JSON.stringify(w1);
            console.log(w0) ; 
            
            if (w0) {
                adapter.setState('conso_electrique.wh_d', {
                    val: Number(w0),
                    ack: true,
                });
                adapter.setState('conso_electrique.date', {
                    val: d0,
                    ack: true,
                });
       } 

    }
        catch {
            console.log('erreur');  }           
      
    
     } 
 ); 
 // Récupère la puissance moyenne consommée le 1er mai 2023, sur un intervalle de 30 min*/
 await session.getLoadCurve('2024-10-14','2024-10-15').then((result) => {
    try {
    console.log(result);
    let n=0;let response=result.interval_reading;let now=Date.now();
    
    while  (typeof response[n] !== 'undefined') {
        var j=n.toString();
        if (i<10) {n="0"+n;}
        var valeur = response[n].value ;
        var heure = response[n].date ;
        adapter.setState('puissance_moyenne.'+j+'.heure', {
            val: heure,
            ack: true,
        });
        adapter.setState('puissance_moyenne.'+j+'.pmoy_d', {
            val: valeur,
            ack: true,
        });
        n++;
        }
    
        //var v= JSON.stringify(valeur);
        
   
} 
catch {
    console.log('erreur');  } 
}
);
// Récupère la puissance maximale de consommation atteinte quotidiennement du 1er au 3 mai 2023
await session.getMaxPower('2024-10-14','2024-10-15').then((result) => {
    try {
    console.log(result);
            var p0= cleanInt(result.interval_reading[0].value);
            //const p = JSON.stringify(p1);
            console.log(p0) ; 
            
            if (p0) {
                adapter.setState('conso_electrique.w_d', {
                    val: Number(p0),
                    ack: true,
                });
       }
} 
catch { 
    console.log('erreur');    }
}   
);    
    /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
    *//*
    await adapter.setObjectNotExistsAsync("testVariable", {
        type: "state",
        common: {
            name: "testVariable",
            type: "boolean",
            role: "indicator",
            read: true,
            write: true,
        },
        native: {},
    });*/
   

    // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
    adapter.subscribeStates("wh_day");
    // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
    // adapter.subscribeStates("lights.*");
    // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
    // adapter.subscribeStates("*");

    /*
        setState examples
        you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
    */
   
        

    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword("admin", "iobroker", (res) => {
        adapter.log.info("check user admin pw iobroker: " + res);
    });

    adapter.checkGroup("admin", "admin", (res) => {
        adapter.log.info("check group user admin group admin: " + res);
    });
    

}

    startAdapter();
