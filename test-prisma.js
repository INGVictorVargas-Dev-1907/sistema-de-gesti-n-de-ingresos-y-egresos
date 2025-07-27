import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mostrar los valores del enum
  console.log("Enum Role desde Prisma:", Role)

  // Crear un usuario con rol ADMIN
  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      role: Role.ADMIN,
    },
  })

  console.log("Usuario creado:", user)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())