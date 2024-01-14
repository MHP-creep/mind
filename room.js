/**
 * 
 * @param {Structure} structure 
 */
function getEnergyCap (structure) {
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
export function findEnergyDemands (room) {
    let structures = room.find (FIND_STRUCTURES);
    let demands = _.filter (structures, (structure) => structure.store && structure.store.getUsedCapacity (RESOURCE_ENERGY) <= getEnergyCap (structure));
    return demands;
}

/**
 * 
 * @param {Room} room 
 */
export function manageSpawning (room) {
    
}