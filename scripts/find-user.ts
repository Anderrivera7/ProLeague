import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true, nickname: true },
  });
  console.log("users:", JSON.stringify(users, null, 2));

  const u = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "riveraanderson756@gmail.com" },
        { email: { contains: "riveraanderson", mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, nickname: true },
  });
  console.log("target:", JSON.stringify(u, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
