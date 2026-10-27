import {Pool} from 'pg';
const g=globalThis as typeof globalThis & {__dbPool?:Pool};
export const pool=g.__dbPool??new Pool({connectionString:process.env.DATABASE_URL,max:5,idleTimeoutMillis:10000});
if(process.env.NODE_ENV!=='production')g.__dbPool=pool;
