import {parseStream, writeToStream} from "fast-csv";
import * as fs from "fs";

export const createHtmlCache = (data, url) => {
    if(!fs.existsSync(`./rawCache/`)){
        fs.mkdirSync(`./rawCache`);
    }

    fs.writeFileSync(`./rawCache/${url}.html`, data);
}

export const readCsv = (inPath: string) => new Promise<any>(resolve => {
    const rows = []
    const rs = fs.createReadStream(inPath);
    parseStream(rs, { headers: true })
        .on("data", row =>
        {
            rows.push(row);
        })
        .on("end", () => resolve(rows));
});

export const createCategoryCSV = (data) => {
    return new Promise<void>((resolve, reject) => {
        const outPath = `./categories.csv`;
        const ws = fs.createWriteStream(outPath);
        ws.on('error', reject);
        ws.on('finish', () => {
            resolve();
        });
        writeToStream(ws, data, {headers: ['asin', 'name', 'category', 'subCat1', 'subCat2', 'subCat3', 'subCat4', 'subCat5'], delimiter: '\t'})
            .on('error', err => reject(err))
            .on('finish', () => ws.end());
    });
}
