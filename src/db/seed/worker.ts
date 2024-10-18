import * as path from "node:path";
import { faker } from "@faker-js/faker";
import { createObjectCsvWriter } from "csv-writer";
import type { PersonRecord } from "../../main";

function generateFakePerson(id: number) {
  return {
    id: id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    dateOfBirth: faker.date
      .birthdate({ min: 18, max: 80, mode: "age" })
      .toISOString()
      .split("T")[0],
  };
}

process.on(
  "message",
  async (message: { workerId: number; records: number }) => {
    const { workerId, records } = message;

    const csvWriter = createObjectCsvWriter({
      path: path.resolve(`people_part_${workerId}.csv`),
      header: [
        { id: "id", title: "ID" },
        { id: "firstName", title: "First Name" },
        { id: "lastName", title: "Last Name" },
        { id: "email", title: "Email" },
        { id: "phoneNumber", title: "Phone Number" },
        { id: "address", title: "Address" },
        { id: "city", title: "City" },
        { id: "state", title: "State" },
        { id: "zipCode", title: "Zip Code" },
        { id: "dateOfBirth", title: "Date of Birth" },
      ],
    });

    const recordBatch: PersonRecord[] = [];
    for (let i = 1; i <= records; i++) {
      recordBatch.push(generateFakePerson(i + (workerId - 1) * records));

      if (i % 10000 === 0) {
        await csvWriter.writeRecords(recordBatch);
        recordBatch.length = 0;
      }
    }

    if (recordBatch.length > 0) {
      await csvWriter.writeRecords(recordBatch);
    }

    process.send?.("done");
  },
);
