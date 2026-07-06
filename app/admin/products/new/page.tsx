import ProductForm from '../product-form'

export const metadata = { title: 'New Product — Admin' }

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Product</h1>
      <ProductForm />
    </div>
  )
}
