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
function manageSizeControl (room) {
    if (Game.time % 500 == 0) {
        if (room.memory.size_control.fullticks >= 250) {
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

        if (room.memory.size_control.streak >= 3) {
            let new_level = room.memory.size_control.rsg + 1;
            if (new_level <= 10 && room.energyCapacityAvailable >= new_level * 200 && room.memory.size_control.cooldown == 0) {
                room.memory.size_control.rsg += 1;
                room.memory.size_control.cooldown = 5;
                room.memory_size_control.streak = 0;
            }
        }
        else if (room.memory.size_control.streak <= -3 && room.memory.size_control.cooldown == 0) {
            let new_level = room.memory.size_control.rsg - 1;
            if (new_level > 0) {
                room.memory.size_control.cooldown = 2;
                room.memory.size_control.rsg -= 1;
                room.memory_size_control.streak = 0;
            }
        }
        else room.memory.size_control.cooldown -= 1;
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
    initializeMemory (room);
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
            var result = spawn.spawnCreep (final, getRandoCreepName (), {memory: {type: "base", role: role, room: room.name, stage: "prepare"}})
            if (result == OK) {
                room.memory.spawn_queue.shift ();
                break;
            }
            // restart
        }
        else {
            room.memory.spawn_queue.shift ();
        }
    }
}

export default {getBaseCreepCount, registerSpawn, manageSpawns, registerDeadCreep, registerBaseCreep};