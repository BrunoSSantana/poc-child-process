import { faker, th } from "@faker-js/faker";
import { createObjectCsvWriter } from "csv-writer";
import type { PersonRecord } from "../main";

const csvWriter = createObjectCsvWriter({
  path: "people.csv",
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

async function generateCSV() {
  const records: PersonRecord[] = [];
  const totalRecords = 1_000_000;

  for (let i = 1; i <= totalRecords; i++) {
    records.push(generateFakePerson(i));

    if (i % 10000 === 0) {
      await csvWriter.writeRecords(records);
      console.log(`Written ${i} records`);
      records.length = 0;
    }
  }

  if (records.length > 0) {
    await csvWriter.writeRecords(records);
  }

  console.log("CSV file generation complete!");
}

generateCSV().catch((err) => console.error("Error generating CSV:", err));
