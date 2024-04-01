/**
 * 
 * @param {Room} room 
 */
function initializeMemory (room) {
    if (!room.memory.init_status.includes ("base.spawn")) {
        room.memory.init_status.push ("base.spawn");
        room.memory.spawn_queue = [];
        room.memory.base_count = {};
    }
    if (!room.memory.init_status.includes ("base.spawn.size_control")) {
        room.memory.init_status.push ("base.spawn.size_control");
        room.memory.size_control = {rsg: 1, fullticks: 0, streak: 0, cooldown: 0};
    }
}
function getBaseCreepCount (room, type) {
    if (!room.memory.base_count [type]) return 0;
    else return room.memory.base_count [type];
}
function registerDeadCreep (memory) {
    if (memory.type == "base") {
        var room = Game.rooms[memory.room];
        room.memory.base_count [memory.role] -= 1;
        if (memory.role == "miner") {
            room.memory.mining.sources[memory.source].claimed = false;
        }
    }
}
/**
 * 
 * @param {Room} room 
 * @param {string} type 
 * @param {*} data 
 */
function registerSpawn (room, type, data) {
    room.memory.spawn_queue.push ({
        type: type,
        data: data
    });
}
function registerBaseCreep (room, role, memory) {
    registerSpawn (room, "base", {role: role, memory: memory});
    if (!room.memory.base_count [role]) room.memory.base_count[role] = 0;
    room.memory.base_count [role] += 1;
}
const base_setup = {
    harvester: [WORK, CARRY, MOVE],
    upgrader: [WORK, CARRY, MOVE],
    builder: [WORK, CARRY, MOVE],
    miner: [WORK, WORK, MOVE],
    carrier: [CARRY, CARRY, MOVE],
    hauler: [CARRY, CARRY, MOVE]
};
var firstnames = [
    "Ice",
    "Dragon",
    "Wither",
    "Undead",
    "Spider",
    "Diamond",
    "Gold"
];
var lastnames = [
    "fish",
    "shark",
    "leech",
    "shrimp",
    "whale",
    "catfish",
    "octopus",
    "seahorse",
    "eel",
    "jellyfish",
    "tarantula"
];
var luck = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "#"
];
function getRandoCreepName () {
    firstnames = _.shuffle (firstnames);
    lastnames = _.shuffle (lastnames);
    luck = _.shuffle (luck);
    var name = firstnames[0] + lastnames[0] + luck[0];
    return name;
}

/**
 * 
 * @param {Room} room 
 */
function manageSizeControl (room) {
    if (Game.time % 1500 == 0) {
        if (room.memory.size_control.fullticks >= 1500) {
            if (room.memory.size_control.streak < 0) {
                room.memory.size_control.streak = 0;
            }
            room.memory.size_control.streak += 1;
        }
        else if (room.memory.size_control.fullticks == 0) {
            if (room.memory.size_control.streak > 0) {
                room.memory.size_control.streak = 0;
            }
            room.memory.size_control.streak -= 1;
        }
        else room.memory.size_control.streak = 0;
        room.memory.size_control.fullticks = 0;

        if (room.memory.size_control.cooldown == 0) {
            if (room.memory.size_control.streak >= 3) {
                let new_level = room.memory.size_control.rsg + 1;
                if (new_level <= 10 && room.energyCapacityAvailable >= new_level * 250 && room.memory.size_control.cooldown == 0) {
                    room.memory.size_control.rsg += 1;
                    room.memory.size_control.cooldown = 5;
                    room.memory.size_control.streak = 0;
                }
            }
            else if (room.memory.size_control.streak <= -3) {
                let new_level = room.memory.size_control.rsg - 1;
                if (new_level > 0) {
                    room.memory.size_control.cooldown = 2;
                    room.memory.size_control.rsg -= 1;
                    room.memory.size_control.streak = 0;
                }
            }
        }
        else room.memory.size_control.cooldown -= 1;
        room.memory.size_control.cooldown = _.max ([room.memory.size_control.cooldown, 0]);
    }
    if (room.energyAvailable == room.energyCapacityAvailable) {
        room.memory.size_control.fullticks += 1;
    }
}

/**
 * 
 * @param {Room} room 
 */
function manageSpawns (room) {
    manageSizeControl (room);

    var spawns = room.find (FIND_MY_SPAWNS);
    for (var key in spawns) {
        var spawn = spawns[key];
        if (room.memory.spawn_queue.length == 0) break;
        var task = room.memory.spawn_queue[0];
        if (task.type == "base") {
            var role = task.data.role;
            var final = [];
            for (let i = 0;i < room.memory.size_control.rsg;i++) final = final.concat (base_setup[role]);
            var name = getRandoCreepName ();
            var result = spawn.spawnCreep (final, name, {memory: {type: "base", role: role, room: room.name, stage: "prepare"}})
            if (result == OK) {
                room.memory.spawn_queue.shift ();
                if (task.data.memory) {
                    for (var key in task.data.memory) {
                        Memory.creeps[name][key] = task.data.memory[key];
                    }
                }
                break;
            }
            // restart
        }
        else {
            room.memory.spawn_queue.shift ();
        }
    }
}

/**
 * 
 * @param {Room} room 
 */
function maintainBaseCreeps (room) {
    if (getBaseCreepCount (room, "upgrader") < 2) {
        registerBaseCreep (room, "upgrader");
    }
    if (getBaseCreepCount (room, "builder") < 2) {
        registerBaseCreep (room, "builder");
    }
    if (room.memory.split) {
        var sources = room.find (FIND_SOURCES);
        for (var source of sources) {
            if (!room.memory.mining.sources[source.id].claimed) {
                room.memory.mining.sources[source.id].claimed = true;
                registerBaseCreep (room, "miner", {source: source.id});
            }
        }
        if (getBaseCreepCount (room, "carrier") < 3) {
            registerBaseCreep (room, "carrier");
        }
        if (getBaseCreepCount (room, "hauler") < 2) {
            registerBaseCreep (room, "hauler");
        }
    }
    else {
        if (getBaseCreepCount (room, "harvester") < 2) {
            registerBaseCreep (room, "harvester");
        }
    }
}

export default {maintainBaseCreeps, initializeMemory, getBaseCreepCount, registerSpawn, manageSpawns, registerDeadCreep, registerBaseCreep};