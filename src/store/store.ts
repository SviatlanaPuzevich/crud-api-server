import {User} from "../types";

export interface Store {
    users: User[];

    publish() : void;
}

export interface USERS_CHANGED {
    type: 'USERS_CHANGED';
    users: User[];
}

export function isUsersChangedMessage(msg: any): msg is USERS_CHANGED {
    return msg && msg.type === 'USERS_CHANGED' && Array.isArray(msg.users);
}

export const store: Store = {
    users: [],
    publish: () => {
        if (!global.process.send) {
            throw new Error(`Update must be called in a worker`);
        }
        const message: USERS_CHANGED = {
            type: 'USERS_CHANGED',
            users: store.users
        }
        console.log(`[${global.process.pid}]: publishing users changes`, store.users);
        global.process.send(message)
    }
};


