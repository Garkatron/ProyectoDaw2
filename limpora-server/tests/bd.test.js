import { beforeAll, describe, expect, it } from 'vitest';
import { connectWithRetry, pingDB } from '../src/databases/mysql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


describe('DB Connection', () => {
    it('should connect to the database successfully', async () => {
        await expect(pingDB()).resolves.not.toThrow();
    });
});


describe('DB Tables Query', () => {
    it('Should show the databases and limporta tables', async () => {

        const conn = await connectWithRetry();
        const [results, fields] = await conn.query("SHOW DATABASES;");

        
        console.log("DATABASES:");
        console.log("results: ", results);
        console.log("fields: ", fields);
        console.log("----------------------------");
        const [results1, fields1] = await conn.query("SHOW TABLES FROM limpora;");
        console.log("LIMPORA:");
        console.log('Tables:', results1.map(r => Object.values(r)[0]));

        console.log("----------------------------");

        

        expect(conn).toBeDefined();
        conn.release();

    });
});



