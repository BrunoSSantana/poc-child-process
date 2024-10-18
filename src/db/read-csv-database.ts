import * as fs from "node:fs";
import * as path from "node:path";
import csv from "csv-parser";
import { DIRNAME, type PersonRecord } from "../main";

export async function* getAllPagedData(itemsPerPage: number, page = 0) {
  const csvFilePath = path.resolve(DIRNAME, "people.csv");
  const results: PersonRecord[] = [];
  let currentPage = 0;
  let currentBatch: PersonRecord[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        currentBatch.push(row);

        if (currentBatch.length === itemsPerPage) {
          if (currentPage === page) {
            results.push(...currentBatch);
          }
          currentPage++;
          currentBatch = [];
        }
      })
      .on("end", () => {
        if (currentBatch.length && currentPage === page) {
          results.push(...currentBatch);
        }
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
