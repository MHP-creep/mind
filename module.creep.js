// The most important creep module
import logistics from "./logistics";

/**
 * 
 * @param {Creep} creep 
 * @returns {boolean}
 */
function harvest (creep) {
    let source = null;
    if (creep.memory.source) {
        source = Game.getObjectById (creep.memory.source);
        if (source.energy == 0) {
            source = null;
            creep.memory.source = null;
        }
    }
    else {
        source = creep.pos.findClosestByPath (FIND_SOURCES_ACTIVE);
    }
    if (!source) {
        creep.say ("frick");
    }
    else {
        let result = creep.harvest (source);
        if (result == ERR_NOT_IN_RANGE) creep.moveTo (source);
    };
    return creep.store.getFreeCapacity (RESOURCE_ENERGY) == 0;
}

/**
 * 
 * @param {Creep} creep 
 */
function energetize (creep) {
    if (creep.room.memory.split) {
        var storage = creep.room.storage;
        if (!storage) {
            creep.say ("bruh what");
            return false;
        }
        else {
            var result = creep.withdraw (storage, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (storage);
            return creep.store.getFreeCapacity (RESOURCE_ENERGY) == 0;
        }
    }
    else return harvest (creep);
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean} 
 */
function supply (creep) {
    if (!creep.memory.target) {
        let demands = logistics.findEnergyDemands (creep.room);
        if (demands.length) {
            demands.sort ((a, b) => creep.pos.getRangeTo (a) - creep.pos.getRangeTo (b));
            creep.memory.target = demands[0].id;
        }
    }
    if (creep.memory.target) {
        let target = Game.getObjectById (creep.memory.target);
        if (target) {
            let result = creep.transfer (target, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (target);
            else if (result == ERR_FULL) creep.memory.target = null;
        }
        else creep.memory.target = null;
    }
    return creep.store.getUsedCapacity (RESOURCE_ENERGY) == 0;
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean}
 */
function upgrade (creep) {
    let result = creep.upgradeController (creep.room.controller);
    if (result == ERR_NOT_IN_RANGE) creep.moveTo (creep.room.controller);
    return creep.store.getUsedCapacity () == 0;
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean}
 */
function build (creep) {
    if (!creep.memory.target) {
        creep.memory.target = creep.pos.findClosestByPath (FIND_CONSTRUCTION_SITES);
        if (creep.memory.target) creep.memory.target = creep.memory.target.id;
    }
    if (creep.memory.target) {
        let target = Game.getObjectById (creep.memory.target);
        if (target) {
            let result = creep.build (target);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (target);
        }
        else creep.memory.target = null;
    }
    else {
        let broken = creep.pos.findClosestByPath (FIND_STRUCTURES, {
            filter: function (structure) {
                return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax);
            }
        });
        if (broken) {
            let result = creep.repair (broken);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (broken);
        }
    }
    return creep.store.getUsedCapacity () == 0;
}

/**
 * 
 * @param {Creep} creep
 */
function carrier_task (creep) {
    return true;
}

/**
 * 
 * @param {Creep} creep
 */
function carrier_duty (creep) { // This code is temporary and will soon be replaced with corresponding code adapting to task-driven logistics network
    if (!creep.room.memory.split) creep.say ("bruh what");
    else {
        if (!creep.memory.substage) creep.memory.substage = "source";
        if (creep.memory.substage == "source") {
            if (!creep.memory.source) {
                var container = logistics.findEnergyProduction (creep.room);
                if (container) creep.memory.source = container.id;
            }
            var source = Game.getObjectById (creep.memory.source);
            if (!source || source.store.getUsedCapacity (RESOURCE_ENERGY) == 0) {
                creep.memory.source = null;
            }
            else {
                if (creep.withdraw (source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo (source);
                }
            }
            if (creep.store.getFreeCapacity (RESOURCE_ENERGY) == 0) {
                creep.memory.source = null;
                creep.memory.substage = "target";
            }
        }
        else {
            creep.memory.source = null;
            if (!creep.room.memory.split) {
                creep.say ("frick");
            }
            else {
                var result = creep.transfer (creep.room.storage, RESOURCE_ENERGY);
                if (result == ERR_NOT_IN_RANGE) creep.moveTo (creep.room.storage);
            }
            if (creep.store.getUsedCapacity (RESOURCE_ENERGY) == 0) {
                creep.memory.substage = "source";
            }
        }
    }
    return false;
}

/**
 * 
 * @param {Creep} creep
 */
function mine (creep) {
    if (!creep.room.memory.split) creep.say ("bruh what");
    else {
        var source_id = creep.memory.source;
        var container_id = creep.room.memory.mining.sources[source_id].container;
        if (!source_id || !container_id) {
            creep.say ("frick");
            return false;
        }
        var source = Game.getObjectById (source_id), container = Game.getObjectById (container_id);
        if (!source || !container_id) {
            creep.say ("frick");
            return false;
        }
        creep.moveTo (container);
        creep.harvest (source);
    }
    return false;
}

// harvester is non-directive, pre-RCL-4 harvesting role
// miner is directive harvesting role, targets one source at a time
// carrier is task-driven RCL 4 role, targets to be the primary power of logistics network, but excludes the storage-to-supply route
// hauler is non-task-driven RCL 4 role that targets on the last path
const routines = {
    harvester: {source: harvest, target: supply},
    upgrader: {source: energetize, target: upgrade},
    builder: {source: energetize, target: build},
    miner: {target: mine},
    hauler: {source: energetize, target: supply},
    carrier: {source: carrier_task, target: carrier_duty}
}
/**
 * 
 * @param {Creep} creep 
 */
function runBaseRoutine (creep) {
    var routine = routines[creep.memory.role];
    if (!routine[creep.memory.stage] || routine[creep.memory.stage] (creep)) {
        if (creep.memory.stage == "target") {
            creep.memory.stage = "source";
        }
        else creep.memory.stage = "target";
    }
}
export default {runBaseRoutine};
