import {Pool} from 'pg';
const g=globalThis as typeof globalThis & {__dbPool?:Pool};
export const pool=g.__dbPool??new Pool({connectionString:process.env.DATABASE_URL,host:process.env.PGHOST??'localhost',port:Number(process.env.PGPORT??5432),database:process.env.PGDATABASE??process.env.POSTGRES_DB,user:process.env.PGUSER??process.env.POSTGRES_USER,password:process.env.PGPASSWORD??process.env.POSTGRES_PASSWORD,max:5,idleTimeoutMillis:10000});
if(process.env.NODE_ENV!=='production')g.__dbPool=pool;
