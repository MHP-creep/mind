import spawning from "./spawning";
/**
 * 
 * @param {Structure} structure 
 */
function getEnergyDemandCap (structure) {
    switch (structure.structureType) {
        case STRUCTURE_SPAWN:
            return 300;
        case STRUCTURE_EXTENSION:
            let rcl = structure.room.controller.level;
            if (rcl <= 6) return 50;
            else if (rcl == 7) return 100;
            else return 200;
        case STRUCTURE_TOWER:
            return 600;
        default:
            return 0;
    }
}
/**
 * 
 * @param {Room} room 
 */
function findEnergyDemands (room) {
    let structures = room.find (FIND_STRUCTURES);
    let demands = _.filter (structures, (structure) => structure.store && structure.store.getUsedCapacity (RESOURCE_ENERGY) < getEnergyDemandCap (structure));
    return demands;
}
/**
 * 
 * @param {Room} room 
 */
function maintainBaseCreeps (room) {
    if (spawning.getBaseCreepCount (room, "harvester") < 2) {
        spawning.registerBaseCreep (room, "harvester");
    }
    if (spawning.getBaseCreepCount (room, "upgrader") < 2) {
        spawning.registerBaseCreep (room, "upgrader");
    }
    if (spawning.getBaseCreepCount (room, "builder") < 2) {
        spawning.registerBaseCreep (room, "builder");
    }
}
export default {findEnergyDemands, maintainBaseCreeps};