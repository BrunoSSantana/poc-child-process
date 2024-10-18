import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { DIRNAME } from "../../main";

const totalRecords = 1_000_000;
const workers = 4; // Número de processos filhos
const recordsPerWorker = totalRecords / workers;

async function mergeFiles() {
  const outputFile = path.resolve("people.csv");
  const writeStream = fs.createWriteStream(outputFile);

  for (let i = 1; i <= workers; i++) {
    const workerFile = path.resolve(`people_part_${i}.csv`);
    const data = fs.readFileSync(workerFile);
    writeStream.write(data);
    fs.unlinkSync(workerFile); // Remove os arquivos temporários
  }

  writeStream.end();
  console.log("CSV file merging complete!");
}

function startWorkers() {
  const processes: Promise<void>[] = [];

  for (let i = 1; i <= workers; i++) {
    const worker = fork(path.resolve(DIRNAME, "worker.js"));

    worker.send({ workerId: i, records: recordsPerWorker });
    processes.push(
      new Promise<void>((resolve, reject) => {
        worker.on("message", (msg) => {
          if (msg === "done") {
            resolve();
          }
        });

        worker.on("error", (err) => {
          reject(err);
        });
      }),
    );
  }

  return Promise.all(processes);
}

console.time("CSV file generation");
startWorkers()
  .then(() => mergeFiles())
  .catch((err) => console.error("Error:", err))
  .then(() => console.timeEnd("CSV file generation"))
  .then(() => process.exit(0));
