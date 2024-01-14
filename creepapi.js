import { cm_playgenshin, cm_findenergy, cm_harvest, cm_supply, cm_upgrade, cm_build } from "./module.creeps";

const configs = {
    earlygame: {
        upgrader: {
            source: cm_harvest,
            target: cm_upgrade
        },
        harvester: {
            source: cm_harvest,
            target: cm_supply
        },
        builder: {
            source: cm_harvest,
            target: cm_build
        }
    },
    lategame: {
        upgrader: {
            source: cm_findenergy,
            target: cm_upgrade
        },
        harvester: {
            source: cm_harvest,
            target: cm_playgenshin
        },
        builder: {
            source: cm_findenergy,
            target: cm_build
        }
    }
}
/**
 * 
 * @param {string} stage
 * @param {string} name
 */
function getCreepConfig (stage, name) {
    return configs[stage][name];
}

/**
 * 
 * @param {Creep} creep 
 */
export function runCreep (creep) {
    const next = {"prepare": "target", "source": "target", "target": "source"};
    let config = getCreepConfig (creep.room.memory.stage, creep.memory.role)[creep.memory.state];
    if (!config || config (creep)) {
        creep.memory.state = next[creep.memory.state];
    }
}