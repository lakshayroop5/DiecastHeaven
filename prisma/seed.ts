import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  await prisma.productImage.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.siteSetting.deleteMany()

  // Create brands
  const brandData = [
    'Hotwheels',
    'Hotwheels Premium',
    'Hotwheels Silver Series',
    'Matchbox',
    'Majorette',
    'Bburago',
    'CCA',
    'Pop Race',
    'Tarmac',
    'BMC',
    'Tomica',
  ]

  const brands: Record<string, string> = {}
  for (const name of brandData) {
    const brand = await prisma.brand.create({
      data: { name, slug: slugify(name) },
    })
    brands[name] = brand.id
  }

  // Create categories
  const categoryData = [
    { name: '5 Pack', description: 'Multi-car packs' },
    { name: 'Gift Sets', description: 'Perfect gift collections' },
    { name: 'Sets', description: 'Curated sets' },
    { name: 'Sports', description: 'Sports cars and supercars' },
    { name: 'Vintage', description: 'Classic vintage models' },
    { name: 'Rally Racers', description: 'Rally and off-road racing' },
    { name: 'Sedan', description: 'Sedan models' },
    { name: 'Suv', description: 'SUV models' },
    { name: 'Jeep', description: 'Jeep models' },
    { name: 'Van', description: 'Van models' },
    { name: 'Exotic', description: 'Exotic supercars' },
    { name: 'Rare', description: 'Rare collector items' },
    { name: 'Construction', description: 'Construction vehicles' },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoryData) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: slugify(cat.name), description: cat.description },
    })
    categories[cat.name] = category.id
  }

  // Create products
  const products = [
    {
      title: 'Japan Racers 5 Pack',
      brand: 'Majorette',
      categoryNames: ['5 Pack', 'Gift Sets'],
      scale: '1:64',
      price: 1699.0,
      offerPrice: 1550.0,
      shortDesc: 'Japan-themed 5 car racer pack from Majorette',
      description: 'A curated 5-car pack featuring Japanese racing legends from Majorette.',
      image: '/products/japan-racers-5-pack.jpeg',
      featured: true,
    },
    {
      title: 'Castheads 5 Pack',
      brand: 'Majorette',
      categoryNames: ['5 Pack', 'Gift Sets'],
      scale: '1:64',
      price: 1699.0,
      offerPrice: 1550.0,
      shortDesc: 'Castheads 5 car collection pack',
      description: 'Majorette Castheads 5 pack featuring a diverse selection of detailed diecast models.',
      image: '/products/castheads-5-pack.jpeg',
      featured: true,
    },
    {
      title: 'JDM Legends 5 Pack',
      brand: 'Majorette',
      categoryNames: ['5 Pack', 'Gift Sets'],
      scale: '1:64',
      price: 1699.0,
      offerPrice: 1550.0,
      shortDesc: 'Japanese Domestic Market legends collection',
      description: 'Iconic JDM legends in a 5-pack from Majorette. Features the best of Japanese automotive history.',
      image: '/products/jdm-legends-5-pack.jpeg',
      featured: true,
    },
    {
      title: 'Mercedes 5 Pack',
      brand: 'Majorette',
      categoryNames: ['5 Pack', 'Gift Sets'],
      scale: '1:64',
      price: 1699.0,
      offerPrice: 1550.0,
      shortDesc: 'Mercedes-Benz 5 car luxury pack',
      description: 'Premium Mercedes-Benz collection in a 5-car gift set from Majorette.',
      image: '/products/mercedes-5-pack.jpeg',
      featured: true,
    },
    {
      title: 'Modern Classic Set of 5 (Imported)',
      brand: 'Hotwheels Premium',
      categoryNames: ['Sets'],
      scale: '1:64',
      price: 5999.0,
      priceText: '₹5,999',
      offerPrice: 4899.0,
      shortDesc: 'Imported premium set of 5 modern classics',
      description: 'Hotwheels Premium imported modern classic set. Five meticulously crafted models for serious collectors.',
      image: '/products/modern-classic-set-of-5.jpeg',
      featured: true,
    },
    {
      title: 'Jaguar XJS',
      brand: 'Hotwheels Premium',
      categoryNames: ['Vintage', 'Sports'],
      scale: '1:64',
      price: 999.09,
      offerPrice: 750.0,
      shortDesc: 'Classic Jaguar XJS in Hotwheels Premium',
      description: 'The iconic Jaguar XJS in Hotwheels Premium quality. A must-have for vintage sports car collectors.',
      image: '/products/jaguar-xjs.jpeg',
      featured: false,
    },
    {
      title: '96 Greenwood Corvette',
      brand: 'Hotwheels Premium',
      categoryNames: ['Vintage', 'Sports'],
      scale: '1:64',
      price: 999.0,
      offerPrice: 650.0,
      shortDesc: '96 Greenwood Corvette Hotwheels Premium',
      description: 'The legendary 96 Greenwood Corvette, faithfully recreated in Hotwheels Premium diecast.',
      image: '/products/96-greenwood-corvette.jpeg',
      featured: false,
    },
    {
      title: 'Lancia Stratos',
      brand: 'Hotwheels Premium',
      categoryNames: ['Rally Racers', 'Vintage', 'Sports'],
      scale: '1:64',
      price: 999.0,
      offerPrice: 650.0,
      shortDesc: 'Rally legend Lancia Stratos',
      description: 'The legendary rally champion Lancia Stratos in Hotwheels Premium. A timeless rally icon.',
      image: '/products/lancia-stratos.jpeg',
      featured: false,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        title: product.title,
        slug: slugify(product.title),
        shortDesc: product.shortDesc,
        description: product.description,
        scale: product.scale,
        price: product.price,
        offerPrice: product.offerPrice,
        priceText: product.priceText,
        status: 'PUBLISHED',
        featured: product.featured,
        brandId: brands[product.brand],
        categories: {
          create: product.categoryNames.map((name) => ({
            categoryId: categories[name],
          })),
        },
        images: {
          create: [
            { imageUrl: product.image, altText: product.title, sortOrder: 0 },
          ],
        },
      },
    })
  }

  // Site settings
  await prisma.siteSetting.create({
    data: {
      businessName: 'Diecast Heaven',
      whatsappNumber: '919876543210',
      whatsappDefaultMessage:
        'Hi, I am interested in {product}. Please share more details.',
      heroTitle: "India's Premium Diecast Destination",
      heroSubtitle:
        'Hot Wheels \u00b7 Majorette \u00b7 Matchbox \u00b7 Bburago \u00b7 Tomica \u00b7 Tarmac Works \u00b7 Pop Race',
    },
  })

  console.log('Seed complete: brands, categories, products, images, settings')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
