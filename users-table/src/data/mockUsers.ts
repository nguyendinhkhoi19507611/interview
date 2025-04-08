import { TUser } from "../types/TUser";

function randomName() {
  const firstNames = [
    "John",
    "Jane",
    "Alice",
    "Bob",
    "Emma",
    "David",
    "Mia",
    "Noah",
    "Olivia",
    "Liam",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
  ];
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
}

function randomBalance() {
  return Math.floor(Math.random() * 99900) + 100;
}

function randomEmail(name: string) {
  return name.toLowerCase().replace(/\s/g, ".") + "@example.com";
}

function randomDate() {
  const start = new Date(2021, 0, 1).getTime();
  const end = new Date(2025, 11, 31).getTime();
  const randomTime = new Date(
    Math.floor(Math.random() * (end - start) + start)
  );
  return randomTime;
}

const mockUsers: TUser[] = [];

for (let i = 1; i <= 100; i++) {
  const name = randomName();
  const user: TUser = {
    id: i.toString(),
    name,
    balance: randomBalance(),
    email: randomEmail(name),
    registerAt: randomDate(),
    active: Math.random() > 0.5,
  };
  mockUsers.push(user);
}

export default mockUsers;
