import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { ROOT_DIRNAME } from "../../main";

const totalRecords = 1_000_000;
const workers = 10;
const recordsPerWorker = totalRecords / workers;

async function mergeFiles() {
  const outputFile = path.resolve("people.csv");
  const writeStream = fs.createWriteStream(outputFile);

  for (let i = 1; i <= workers; i++) {
    const workerFile = path.resolve(`people_part_${i}.csv`);
    let data = fs.readFileSync(workerFile, "utf-8");

    if (i !== 1) {
      const dataLines = data.split("\n");
      dataLines.shift();
      data = dataLines.join("\n");
    }

    writeStream.write(data);
    fs.unlinkSync(workerFile);
  }

  writeStream.end();
  console.log("CSV file merging complete!");
}

function startWorkers() {
  const processes: Promise<void>[] = [];

  for (let i = 1; i <= workers; i++) {
    const child = fork(path.resolve(ROOT_DIRNAME, "csv-persistance/csv-persistance-worker/worker.js"));

    child.send({ workerId: i, records: recordsPerWorker });
    processes.push(
      new Promise<void>((resolve, reject) => {
        child.on("message", (msg) => {
          if (msg === "done") {
            resolve();
          }
        });

        child.on("error", (err) => {
          reject(err);
        });
      }),
    );
  }

  return Promise.all(processes);
}

console.time("CSV file generation");

startWorkers()
  .catch((err) => console.error("Error:", err))
  .then(() => mergeFiles())
  .then(() => console.timeEnd("CSV file generation"));
