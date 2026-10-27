import Dexie,{type Table} from 'dexie';
export type OutboxItem={id:string;payload:unknown;createdAt:number;attempts:number;lastError?:string};
export class LocalDatabase extends Dexie {outbox!:Table<OutboxItem,string>;constructor(){super("idea-use-food-first");this.version(1).stores({outbox:'id,createdAt,attempts'});}}
export const localDatabase=new LocalDatabase();
