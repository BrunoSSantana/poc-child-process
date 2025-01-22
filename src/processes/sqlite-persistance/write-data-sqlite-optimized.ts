import * as fs from "node:fs";
import * as path from "node:path";
import { DatabaseSync } from "node:sqlite";
import csv from "csv-parser";
import { type PersonRecord, ROOT_DIRNAME } from "../../main.ts";
import { logger } from "../../packages/logs/index.ts";

type PersonRecordFromCSV = {
  ID: string;
  "First Name": string;
  "Last Name": string;
  Email: string;
  "Phone Number": string;
  Address: string;
  City: string;
  State: string;
  "Zip Code": string;
  "Date of Birth": string;
};

const database = new DatabaseSync("people_optimized.db");

function setupDatabase() {
  database.exec("DROP TABLE IF EXISTS people");
  database.exec(`
    CREATE TABLE people(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone_number TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      date_of_birth TEXT
    ) STRICT
  `);
}

function insertPersonRecordsBatch(people: PersonRecord[]) {
  const insert = database.prepare(`
    INSERT INTO people (first_name, last_name, email, phone_number, address, city, state, zip_code, date_of_birth)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec("BEGIN TRANSACTION");
  for (const person of people) {
    insert.run(
      person.firstName,
      person.lastName,
      person.email,
      person.phoneNumber,
      person.address,
      person.city,
      person.state,
      person.zipCode,
      person.dateOfBirth,
    );
  }

  database.exec("COMMIT");
}

function mapRowToPersonRecord(row: PersonRecordFromCSV): PersonRecord {
  return {
    id: Number(row.ID),
    firstName: row["First Name"],
    lastName: row["Last Name"],
    email: row.Email,
    phoneNumber: row["Phone Number"],
    address: row.Address,
    city: row.City,
    state: row.State,
    zipCode: row["Zip Code"],
    dateOfBirth: row["Date of Birth"],
  };
}

async function importCSVToSQLiteSync() {
  const csvFilePath = path.resolve(ROOT_DIRNAME, "../people.csv");
  const people: PersonRecord[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row: PersonRecordFromCSV) => {
        const person = mapRowToPersonRecord(row);
        people.push(person);

        /* if (people.length === 1000) {
          insertPersonRecordsBatch(people);
          people.length = 0;
        } */
      })
      .on("end", () => {
        if (people.length) {
          insertPersonRecordsBatch(people);
        }
        logger.log("CSV importado com sucesso!");
        resolve();
      })
      .on("error", (err) => {
        console.error("Erro ao importar o CSV:", err);
        reject(err);
      });
  });
}

function countAllRecords() {
  const query = database.prepare("SELECT COUNT(*) AS total FROM people");
  const result = query.get();
  logger.log(result);
}

async function main() {
  console.time("SQLite");
  setupDatabase();
  await importCSVToSQLiteSync();
  countAllRecords();
  console.timeEnd("SQLite");
}

main().catch(console.error);
