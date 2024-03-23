// The most important creep module

import moduleRooms from "./module.rooms";

/**
 * 
 * @param {Creep} creep 
 * @returns {boolean}
 */
function harvest (creep) {
    let source = null;
    if (creep.memory.source) {
        source = Game.getObjectById (creep.memory.source);
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
    }
    return creep.store.getFreeCapacity (RESOURCE_ENERGY) == 0;
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean} 
 */
function supply (creep) {
    if (!creep.memory.target) {
        let demands = moduleRooms.findEnergyDemands (creep.room);
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
function withdraw_storage (creep) {
    if (creep.room.storage) {
        var result = creep.withdraw (creep.room.storage, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) creep.moveTo (creep.room.storage);
    }
    else {
        creep.say ("frick");
    }
    return creep.store.getFreeCapacity () == 0;
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
        let broken = creep.pos.findClosestByPath (FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType != STRUCTURE_RAMPART && structure.hits < structure.hitsMax * 0.8;
            }
        });
        if (broken) {
            let result = creep.repair (broken);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (target);
        }
    }
    return creep.store.getUsedCapacity () == 0;
}

const creep_modules = {
    harvest: harvest,
    supply: supply,
    withdraw_storage: withdraw_storage,
    upgrade: upgrade,
    build: build
};

const routines = {
    harvester: {source: creep_modules.harvest, target: creep_modules.supply},
    upgrader: {source: creep_modules.harvest, target: creep_modules.upgrade},
    builder: {source: creep_modules.harvest, target: creep_modules.build}
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