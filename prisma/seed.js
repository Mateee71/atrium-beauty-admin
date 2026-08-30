import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const hairCategory = await prisma.category.create({ data: { name: "Fodrászat" } });
  const beautyCategory = await prisma.category.create({ data: { name: "Kozmetika" } });
  const nailsCategory = await prisma.category.create({ data: { name: "Manikűr" } });

  const haircut = await prisma.service.create({
    data: { name: "Hajvágás", description: "Professzionális hajvágás", price: 5000, categoryId: hairCategory.id },
  });
  const coloring = await prisma.service.create({
    data: { name: "Hajfestés", description: "Teljes hajfestés vagy melír", price: 12000, categoryId: hairCategory.id },
  });
  const facial = await prisma.service.create({
    data: { name: "Arckezelés", description: "Hidratáló arckezelés", price: 8000, categoryId: beautyCategory.id },
  });
  const manicure = await prisma.service.create({
    data: { name: "Géllakkozás", description: "Tartós géllakkozás", price: 7000, categoryId: nailsCategory.id },
  });

  const firstNames = ["Anna", "Béla", "Csilla", "Dániel", "Erika", "Ferenc", "Gábor", "Hanna", "István", "Júlia", "Katalin", "László", "Mária", "Norbert", "Orsolya"];
  const lastNames = ["Kiss", "Nagy", "Szabó", "Kovács", "Varga", "Tóth", "Balogh", "Molnár", "Farkas", "Papp", "Takács", "Juhász", "Horváth", "Fekete", "Simon"];

  const customers = [];
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${lastName} ${firstName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const phone = `+3620${Math.floor(1000000 + Math.random() * 8999999)}`;

    const customer = await prisma.customer.create({
      data: { name, email, phone },
    });
    customers.push(customer);
  }

  const services = [haircut, coloring, facial, manicure];
  const statuses = ["PENDING", "DONE"];

  for (const customer of customers) {
    await prisma.appointment.create({
      data: {
        date: new Date(2025, 7, Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 8) + 9, 0),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        customerId: customer.id,
        serviceId: services[Math.floor(Math.random() * services.length)].id,
      },
    });
  }

  console.log("✅ 30 ügyfél és tesztadat feltöltve!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
