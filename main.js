/*
Generic Idea:
main.js contains only code to run the overlord calls and global calls that are irrelevant to the game
overlord.js maintain most resources to run and calls different modules
module.rooms contains API-like functions to be called by other codes
module.creeps contains functionalities to operate creeps
module.structures contains functionalities to operate structures

To be implemented:
1. Basic base creeps logic
2. Automated spawning
3. Room logistics
*/

import overlord from "./overlord";
import api from "./api";

export function loop () {  
    for (var key in Game.rooms) {
        var room = Game.rooms[key];
        if (room.controller?.my) {
            overlord.manageRoom (room);
        }
    }
    for (var key in Game.creeps) {
        var creep = Game.creeps[key];
        overlord.manageCreep (creep);
    }
    overlord.resolve ();
    
    api.load ();
}