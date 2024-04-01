import spawning from "./spawning";
import moduleCreep from "./module.creep";
import defense from "./defense";
import logistics from "./logistics";

/**
 * 
 * @param {Room} room 
 */
function initializeMemory (room) {
    if (!room.memory.init_status) {
        room.memory.init_status = [];
    }
    
    spawning.initializeMemory (room);
    logistics.initializeMemory (room);
}

function cleanupMemory () {
    
}

/**
 * 
 * @param {Room} room 
 */
function manageRoom (room) {
    initializeMemory (room);

    logistics.manageRoomLogistics (room);
    spawning.manageSpawns (room);
    spawning.maintainBaseCreeps (room);
    defense.operateTowers (room);
}
/**
 * 
 * @param {Creep} creep
 */
function manageCreep (creep) {
    if (creep.memory.type == "base") {
        moduleCreep.runBaseRoutine (creep);
    }
}
function resolve () {
    if (Game.time % 1500 == 0) cleanupMemory ();
    for (var key in Memory.creeps) {
        if (!Game.creeps[key]) {
            spawning.registerDeadCreep (Memory.creeps[key]);
            delete Memory.creeps[key];
        }
    }
}

export default {manageRoom, manageCreep, resolve};