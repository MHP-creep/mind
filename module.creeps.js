import { findEnergyDemands } from "./room";

/**
 * 
 * @param {Creep} creep 
 * @returns {boolean}
 */
export function cm_playgenshin (creep) {
    switch (Game.time % 3) {
        case 1: 
            creep.say ("Genshin");
            break;
        case 2: 
            creep.say ("Impact");
            break;
        default: 
            creep.say ("Launch!");
            break;
    }
    return creep.store.getFreeCapacity (RESOURCE_ENERGY) > 0;
}

/**
 * 
 * @param {Creep} creep 
 * @returns {boolean}
 */
export function cm_harvest (creep) {
    let source = null;
    if (creep.memory.source) {
        source = Game.getObjectById (creep.memory.source);
    }
    else {
        source = creep.pos.findClosestByPath (FIND_SOURCES);
    }
    if (!source) {
        creep.say ("frick");
    }
    else {
        let result = creep.harvest (source);
        if (result == ERR_NOT_IN_RANGE) creep.moveTo (source);
        return creep.store.getFreeCapacity (RESOURCE_ENERGY) == 0;
    }
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean} 
 */
export function cm_supply (creep) {
    if (!creep.memory.target) {
        let demands = findEnergyDemands (creep.room);
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
export function cm_findenergy (creep) {
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
export function cm_upgrade (creep) {
    let result = creep.upgradeController (creep.room.controller);
    if (result == ERR_NOT_IN_RANGE) creep.moveTo (creep.room.controller);
    return creep.store.getUsedCapacity () == 0;
}

/**
 * 
 * @param {Creep} creep
 * @returns {boolean}
 */
export function cm_build (creep) {
    if (!creep.memory.target) {
        creep.memory.target = creep.pos.findClosestByPath (FIND_CONSTRUCTION_SITES).id;
    }
    if (creep.memory.target) {
        let target = Game.getObjectById (creep.memory.target);
        if (target) {
            let result = creep.build (target);
            if (result == ERR_NOT_IN_RANGE) creep.moveTo (target);
        }
        else creep.memory.target = null;
    }
    return creep.store.getUsedCapacity () == 0;
}