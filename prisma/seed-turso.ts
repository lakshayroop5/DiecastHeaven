import { createClient } from '@libsql/client/http'

const DATABASE_URL = process.env.DATABASE_URL
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN

if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
  console.error('DATABASE_URL and DATABASE_AUTH_TOKEN must be set')
  process.exit(1)
}

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
})

async function createTables() {
  console.log('Dropping old tables and recreating in Turso...')

  await client.executeMultiple(`
    DROP TABLE IF EXISTS "product_images";
    DROP TABLE IF EXISTS "product_categories";
    DROP TABLE IF EXISTS "products";
    DROP TABLE IF EXISTS "categories";
    DROP TABLE IF EXISTS "brands";
    DROP TABLE IF EXISTS "site_settings";
  `)

  await client.executeMultiple(`
    CREATE TABLE "brands" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "categories" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "products" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "short_desc" TEXT,
      "scale" TEXT,
      "price" REAL,
      "offer_price" REAL,
      "price_text" TEXT,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "featured" INTEGER NOT NULL DEFAULT 0,
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "stock" INTEGER NOT NULL DEFAULT 0,
      "brand_id" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE "product_categories" (
      "product_id" TEXT NOT NULL,
      "category_id" TEXT NOT NULL,
      PRIMARY KEY ("product_id", "category_id"),
      CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE "product_images" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "product_id" TEXT NOT NULL,
      "image_url" TEXT NOT NULL,
      "alt_text" TEXT,
      "data" TEXT DEFAULT '',
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE "site_settings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "business_name" TEXT NOT NULL,
      "whatsapp_number" TEXT NOT NULL,
      "whatsapp_default_message" TEXT NOT NULL,
      "hero_title" TEXT,
      "hero_subtitle" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  console.log('Tables created.')
}

async function seedData() {
  console.log('Seeding data...')

  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  function cuid(): string {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  }

  const brandData = [
    'Hotwheels', 'Hotwheels Premium', 'Hotwheels Silver Series',
    'Matchbox', 'Majorette', 'Bburago', 'CCA', 'Pop Race', 'Tarmac', 'BMC', 'Tomica',
  ]
  const brands: Record<string, string> = {}
  for (const name of brandData) {
    brands[name] = cuid()
  }

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
    categories[cat.name] = cuid()
  }

  const products = [
    { title: 'Japan Racers 5 Pack', brand: 'Majorette', categoryNames: ['5 Pack', 'Gift Sets'], scale: '1:64', price: 1699.0, offerPrice: 1550.0, shortDesc: 'Japan-themed 5 car racer pack from Majorette', description: 'A curated 5-car pack featuring Japanese racing legends from Majorette.', image: '/products/japan-racers-5-pack.jpeg', featured: true },
    { title: 'Castheads 5 Pack', brand: 'Majorette', categoryNames: ['5 Pack', 'Gift Sets'], scale: '1:64', price: 1699.0, offerPrice: 1550.0, shortDesc: 'Castheads 5 car collection pack', description: 'Majorette Castheads 5 pack featuring a diverse selection of detailed diecast models.', image: '/products/castheads-5-pack.jpeg', featured: true },
    { title: 'JDM Legends 5 Pack', brand: 'Majorette', categoryNames: ['5 Pack', 'Gift Sets'], scale: '1:64', price: 1699.0, offerPrice: 1550.0, shortDesc: 'Japanese Domestic Market legends collection', description: 'Iconic JDM legends in a 5-pack from Majorette.', image: '/products/jdm-legends-5-pack.jpeg', featured: true },
    { title: 'Mercedes 5 Pack', brand: 'Majorette', categoryNames: ['5 Pack', 'Gift Sets'], scale: '1:64', price: 1699.0, offerPrice: 1550.0, shortDesc: 'Mercedes-Benz 5 car luxury pack', description: 'Premium Mercedes-Benz collection in a 5-car gift set from Majorette.', image: '/products/mercedes-5-pack.jpeg', featured: true },
    { title: 'Modern Classic Set of 5 (Imported)', brand: 'Hotwheels Premium', categoryNames: ['Sets'], scale: '1:64', price: 5999.0, offerPrice: 4899.0, shortDesc: 'Imported premium set of 5 modern classics', description: 'Hotwheels Premium imported modern classic set.', image: '/products/modern-classic-set-of-5.jpeg', featured: true },
    { title: 'Jaguar XJS', brand: 'Hotwheels Premium', categoryNames: ['Vintage', 'Sports'], scale: '1:64', price: 999.09, offerPrice: 750.0, shortDesc: 'Classic Jaguar XJS in Hotwheels Premium', description: 'The iconic Jaguar XJS in Hotwheels Premium quality.', image: '/products/jaguar-xjs.jpeg', featured: false },
    { title: '96 Greenwood Corvette', brand: 'Hotwheels Premium', categoryNames: ['Vintage', 'Sports'], scale: '1:64', price: 999.0, offerPrice: 650.0, shortDesc: '96 Greenwood Corvette Hotwheels Premium', description: 'The legendary 96 Greenwood Corvette.', image: '/products/96-greenwood-corvette.jpeg', featured: false },
    { title: 'Lancia Stratos', brand: 'Hotwheels Premium', categoryNames: ['Rally Racers', 'Vintage', 'Sports'], scale: '1:64', price: 999.0, offerPrice: 650.0, shortDesc: 'Rally legend Lancia Stratos', description: 'The legendary rally champion Lancia Stratos.', image: '/products/lancia-stratos.jpeg', featured: false },
  ]

  const stmts: string[] = []

  // Clean
  stmts.push('DELETE FROM product_images')
  stmts.push('DELETE FROM product_categories')
  stmts.push('DELETE FROM products')
  stmts.push('DELETE FROM categories')
  stmts.push('DELETE FROM brands')
  stmts.push('DELETE FROM site_settings')

  // Brands
  for (const [name, id] of Object.entries(brands)) {
    stmts.push(`INSERT INTO brands (id, name, slug) VALUES ('${id}', '${name.replace(/'/g, "''")}', '${slugify(name)}')`)
  }

  // Categories
  for (const cat of categoryData) {
    stmts.push(`INSERT INTO categories (id, name, slug, description) VALUES ('${categories[cat.name]}', '${cat.name}', '${slugify(cat.name)}', '${cat.description}')`)
  }

  // Products
  for (const p of products) {
    const pid = cuid()
    stmts.push(`INSERT INTO products (id, title, slug, short_desc, description, scale, price, offer_price, status, featured, brand_id) VALUES ('${pid}', '${p.title.replace(/'/g, "''")}', '${slugify(p.title)}', '${p.shortDesc.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', '${p.scale}', ${p.price}, ${p.offerPrice}, 'PUBLISHED', ${p.featured ? 1 : 0}, '${brands[p.brand]}')`)
    for (const catName of p.categoryNames) {
      stmts.push(`INSERT INTO product_categories (product_id, category_id) VALUES ('${pid}', '${categories[catName]}')`)
    }
    stmts.push(`INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order) VALUES ('${cuid()}', '${pid}', '${p.image}', '${p.title.replace(/'/g, "''")}', 0)`)
  }

  // Site settings
  stmts.push(`INSERT INTO site_settings (id, business_name, whatsapp_number, whatsapp_default_message, hero_title, hero_subtitle) VALUES ('${cuid()}', 'Diecast Heaven', '919079674984', 'Hi, I am interested in {product}. Please share more details.', 'India''s Premium Diecast Destination', 'Hot Wheels \u00b7 Majorette \u00b7 Matchbox \u00b7 Bburago \u00b7 Tomica \u00b7 Tarmac Works \u00b7 Pop Race')`)

  await client.executeMultiple(stmts.join(';\n') + ';')
  console.log('Turso seed complete!')
}

async function main() {
  await createTables()
  await seedData()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
