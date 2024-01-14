import { runCreep } from "./creepapi";

export function loop () {
    for (let k in Game.creeps) {
        runCreep (Game.creeps[k]);
    } 
}