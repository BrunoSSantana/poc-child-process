import * as path from "node:path";

export const ROOT_DIRNAME = path.dirname(new URL(import.meta.url).pathname)

export interface PersonRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
}
