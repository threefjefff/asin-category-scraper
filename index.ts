import axios from "axios";
import { parse } from "node-html-parser";
import {createCategoryCSV, createHtmlCache, readCsv} from "./filesystem";

interface AsinCategory {
    asin: string,
    name: string,
    productCategory: string[]
}

const client = axios.create();
let failedVisits: string[] = [];

const scrape = async () : Promise<void> => {
    const csv = process.argv[2];
    if(csv === '' || !csv.endsWith(".csv")){
        console.log(`Expecting a CSV file, got ${csv}`)
        console.log("Run as `ts-node . your_csv_file.csv")
    }
    console.log(`Reading ${csv}`)
    const inputAsins = await readCsv(csv);
    const foundCategories = [];
    for(let i = 0; i < inputAsins.length; i++){
        const {asin, productName} = inputAsins[i];

        //Validate Input
        if(!asin){
            console.log(`Could not find ASIN at index ${i}`);
        }

        //Scrape
        const category = await scrapeAsin(asin);
        if(!category){
            continue;
        }

        //Validate Output
        if(category.name != productName){
            console.log(`Given name was ${productName}, but we found ${category.name}, using that instead`)
        }
        //We expect a category and 4 "sub categories" at time of writing. If not, slap some blank spaces in there.
        if(category.productCategory.length < 5){
            const toAdd = (5 - category.productCategory.length);
            for(let j = 0; j < toAdd; j++){
                category.productCategory.push("");
            }
        }

        foundCategories.push({
            asin: category.asin,
            name: category.name || productName,
            category: category.productCategory[0],
            subCat1: category.productCategory[1],
            subCat2: category.productCategory[2],
            subCat3: category.productCategory[3],
            subCat4: category.productCategory[4],
        })
    }
    console.log(foundCategories);
    //Write the output
    await createCategoryCSV(foundCategories);
    console.log("You should find a file of all asins marked up with categories in categories.csv")
    console.log("Failed to find the following items:")
    console.log(failedVisits);
}

const scrapeAsin = async (asin: string): Promise<AsinCategory | null> => {
    const productUri = `https://www.amazon.com/dp/${asin}`
    console.log(`Fetching ${productUri}`);
    let result;

    try {
        result = await client.get(productUri);
    } catch (e) {
        failedVisits.push(productUri);
        console.log(`Failed to pull page for ${productUri}\n\t${e}`);
        return null;
    }

    const pageData = parse(result.data);
    createHtmlCache(result.data, asin);

    const categories = parseCategory(pageData);
    if(!categories){
        failedVisits.push(productUri);
        console.log("Found the page but could not find category data");
        return null;
    }

    //Unlike categories, our best guess at the title is enough. Should be there for sense checking
    const title = parseTitle(pageData)

    return {
        asin,
        name: title,
        productCategory: categories
    }
}

const parseTitle = (pageData): string => {
    const title = pageData.querySelector("#productTitle");
    return title?.textContent.trim() || '';
}

const parseCategory = (pageData): string[] => {
    //Grab the category bit from the page
    return pageData.querySelectorAll("#wayfinding-breadcrumbs_feature_div > ul > li > span > a")
        .map((a: HTMLElement) => a.textContent.replace("\n", "").trim())
}

(async () => await scrape())();