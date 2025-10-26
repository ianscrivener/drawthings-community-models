import fs                   from 'fs';
import { DuckDBInstance }   from '@duckdb/node-api';
import _                    from 'lodash';
import { parse_json }       from './parse_fn.js';


// ####################################
// 1. create an in memory DuckDB database
// 2. recurse ['models', 'loras', 'controlnets', 'uncurated_models'], read data and add into DuckDB
// 3. create a parquet file with all data
// ####################################

let counter = 0;

async function main() {
    try {
        // console.log('Creating DuckDB instance...');
        // // 1. create an in memory DuckDB database
        // const instance = await DuckDBInstance.create(':memory:');
        const instance = await DuckDBInstance.create('ckpt.duckdb');
        const connection = await instance.connect();

        // create db
        await connection.run(`
            DROP SEQUENCE IF EXISTS user_id_seq;
            DROP TABLE IF EXISTS ckpt;
            CREATE SEQUENCE user_id_seq;
            CREATE TABLE ckpt(
                id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'),
                model_type VARCHAR NOT NULL, 
                model_family VARCHAR NOT NULL, 
                model_name VARCHAR NOT NULL, 
                ckpt_file VARCHAR NOT NULL, 
                url VARCHAR,
                autoencoder VARCHAR, 
                clip_encoder VARCHAR, 
                image_encoder VARCHAR, 
                t5_encoder VARCHAR, 
                full_json JSON
            );
        `);   




        // 2. recurse ['models', 'loras', 'controlnets', 'uncurated_models'], read data and add into DuckDB
        const categories = ['models', 'loras', 'controlnets', 'uncurated_models'];
        for (const category of categories) {
            const dirPath = `../${category}`;
            const sub_dirs = fs.readdirSync(dirPath);
            for (const dir of sub_dirs) {

                // skip .DS_Store or any non-directory files
                const fullDirPath = `${dirPath}/${dir}`;
                if (!fs.lstatSync(fullDirPath).isDirectory()) {
                    continue;
                }

                // increment counter
                counter += 1;

                // create filepath string
                const filePath = `${dirPath}/${dir}/metadata.json`;

                // read metadata.json
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // console.log(data);

                // console.log(`Inserting data for ${data.name} into DuckDB...`);

                // use helper function to parse json
                const parsed_data = parse_json(category, data);

                // create DuckDB insert sql string    
                let sqlstring = `INSERT INTO ckpt(id, model_type, model_family, model_name, ckpt_file, url, autoencoder, clip_encoder, image_encoder, t5_encoder, full_json)
                            VALUES(nextval('user_id_seq'), '${parsed_data.model_type}', '${parsed_data.model_family}', '${parsed_data.model_name}', '${parsed_data.ckpt_file}', '${parsed_data.url}', '${parsed_data.autoencoder}', '${parsed_data.clip_encoder}', '${parsed_data.image_encoder}', '${parsed_data.t5_encoder}', '${parsed_data.full_json}');`        

                // run sql string
                await connection.run(sqlstring);
            }
        }
        console.log("Total files processed:", counter);
        
        // 6. create a parquet file with all data
        console.log('Creating parquet file ckpt.duckdb.parquet ...');
        await connection.run(`
            COPY ckpt TO 'ckpt.duckdb.parquet' (FORMAT PARQUET);
        `);

        // close connection
        await connection.closeSync();
        console.log('Close DuckDB Connection.');

        // get file size of DuckDB file
        let stats = fs.statSync('ckpt.duckdb');
        let fileSizeInBytes = stats.size;
        let fileSizeInMB = (fileSizeInBytes / (1024*1024)).toFixed(2);
        console.log(`DuckDB file size: ${fileSizeInMB} megabytes`);

        // get file size of parquet file
        stats = fs.statSync('ckpt.duckdb.parquet');
        fileSizeInBytes = stats.size;
        fileSizeInMB = (fileSizeInBytes / (1024)).toFixed(2);
        console.log(`Parquet file size: ${fileSizeInMB} kilobytes`);

     
    }
    
    catch (error) { 
        console.error('Error:', error);
    }


    

}
main();