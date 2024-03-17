import spawning from "./spawning";
import moduleCreep from "./module.creep";
import moduleRooms from "./module.rooms";

/**
 * 
 * @param {Room} room 
 */
function manageRoom (room) {
    spawning.manageSpawns (room);
    moduleRooms.maintainBaseCreeps (room);
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
    for (var key in Memory.creeps) {
        if (!Game.creeps[key]) {
            spawning.registerDeadCreep (Memory.creeps[key]);
            delete Memory.creeps[key];
        }
    }
}

export default {manageRoom, manageCreep, resolve};