/**
 * 
 * @param {Room} room 
 */
function initializeMemory (room) {
    if (!room.memory.init_status) {
        room.memory.init_status = [];
    }
    if (!room.memory.init_status.includes ("base.spawn")) {
        room.memory.init_status.push ("base.spawn");
        room.memory.spawn_queue = [];
        room.memory.base_count = {};
    }
}
function getBaseCreepCount (room, type) {
    if (!room.memory.base_count [type]) return 0;
    else return room.memory.base_count [type];
}
function registerDeadCreep (memory) {
    if (memory.type == "base") {
        Game.rooms[memory.room].memory.base_count [memory.role] -= 1;
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
function registerBaseCreep (room, role) {
    registerSpawn (room, "base", {role: role});
    room.memory.base_count [role] += 1;
}
const base_setup = {
    harvester: [WORK, CARRY, MOVE],
    upgrader: [WORK, CARRY, MOVE],
    builder: [WORK, CARRY, MOVE]
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
function manageSpawns (room) {
    initializeMemory (room);

    var spawns = room.find (FIND_MY_SPAWNS);
    for (var key in spawns) {
        var spawn = spawns[key];
        if (room.memory.spawn_queue.length == 0) break;
        var task = room.memory.spawn_queue[0];
        if (task.type == "base") {
            var role = task.data.role;
            var result = spawn.spawnCreep (base_setup[role], getRandoCreepName (), {memory: {type: "base", role: role, room: room.name, stage: "prepare"}})
            if (result == OK) {
                room.memory.spawn_queue.shift ();
                break;
            }
        }
        else {
            room.memory.spawn_queue.shift ();
        }
    }
}

export default {getBaseCreepCount, registerSpawn, manageSpawns, registerDeadCreep, registerBaseCreep};
