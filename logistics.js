/**
 * 
 * @param {Room} room 
 */
function initializeMemory (room) {
    if (!room.memory.init_status.includes ("directives.split")) {
        room.memory.init_status.push ("directives.split");
        room.memory.split = false; // simple way of indicating whether execute harvest-carry splitting
        room.memory.mining = {sources: {}};
        var sources = room.find (FIND_SOURCES);
        for (var source of sources) {
            room.memory.mining.sources[source.id] = {container: null, claimed: false};
        }
    }
}

/**
 * 
 * @param {Room} room 
 */
function manageRoomLogistics (room) {
    if (Game.time % 20 == 0) {
        var split = true;
        // The conditions of splitting:
        // 1. Storage is built
        // 2. All sources are established with containers
        if (!room.storage) split = false;
        // Iterate through the sources
        var sources = room.find (FIND_SOURCES);
        for (var source of sources) {
            var containers = source.pos.findInRange (FIND_STRUCTURES, 1, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            if (containers.length) {
                room.memory.mining.sources[source.id].container = containers[0].id;
            }
            else split = false;
        }
        // And the winner is...
        room.memory.split = split;
    }
}

/**
 * 
 * @param {Room} room 
 */
function findEnergyProduction (room) {
    if (!room.memory.split) return null;
    var containers = [];
    var sources = room.find (FIND_SOURCES);
    for (var source of sources) {
        var container = Game.getObjectById (room.memory.mining.sources[source.id].container);
        if (container) containers.push (container);
    }
    if (!containers.length) return null;
    console.log ("YIP");
    containers.sort ((a, b) => b.store.getUsedCapacity (RESOURCE_ENERGY) - a.store.getUsedCapacity (RESOURCE_ENERGY));
    if (containers[0].store.getUsedCapacity (RESOURCE_ENERGY) > 0) return containers[0];
    else return null;
}

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

export default {initializeMemory, manageRoomLogistics, findEnergyProduction, findEnergyDemands};