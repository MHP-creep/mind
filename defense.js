/**
 * 
 * @param {Room} room
 */
function operateTowers (room) {
    var hostiles = room.find (FIND_HOSTILE_CREEPS);
    if (hostiles.length) {
        var towers = room.find (FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        for (var tower of towers) {
            tower.attack (hostiles[0]);
        }
    }
}

export default {operateTowers};