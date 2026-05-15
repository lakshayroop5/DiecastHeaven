import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.siteSetting.deleteMany()

  const sportsCars = await prisma.category.create({
    data: { name: 'Sports Cars', slug: 'sports-cars', description: 'Speed demons' },
  })
  const muscleCars = await prisma.category.create({
    data: { name: 'Muscle Cars', slug: 'muscle-cars', description: 'American power' },
  })
  const vintageClassics = await prisma.category.create({
    data: { name: 'Vintage Classics', slug: 'vintage-classics', description: 'Timeless' },
  })
  const offRoad = await prisma.category.create({
    data: { name: 'Off-Road', slug: 'off-road', description: 'Adventure' },
  })
  const raceCars = await prisma.category.create({
    data: { name: 'Race Cars', slug: 'race-cars', description: 'Track ready' },
  })

  await prisma.product.create({
    data: {
      title: 'Twin Mill',
      slug: 'twin-mill',
      description: 'The legendary Twin Mill',
      shortDesc: 'Dual engine muscle car',
      priceText: '1200',
      status: 'PUBLISHED',
      featured: true,
      category: { connect: { id: muscleCars.id } },
      images: { create: [{ imageUrl: 'https://picsum.photos/400', altText: 'Twin Mill', sortOrder: 0 }] },
    },
  })

  await prisma.product.create({
    data: {
      title: 'Deora II',
      slug: 'deora-ii',
      description: 'Custom pickup truck',
      shortDesc: 'Surf-ready pickup',
      priceText: '950',
      status: 'PUBLISHED',
      featured: true,
      category: { connect: { id: muscleCars.id } },
      images: { create: [{ imageUrl: 'https://picsum.photos/401', altText: 'Deora', sortOrder: 0 }] },
    },
  })

  await prisma.siteSetting.create({
    data: {
      businessName: 'Hot Wheels Collector',
      whatsappNumber: '919876543210',
      whatsappDefaultMessage: 'Hi, I am interested in {product}. Please share more details.',
    },
  })

  console.log('Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())