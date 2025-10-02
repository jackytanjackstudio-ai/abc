import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const productsFile = path.join(process.cwd(), 'data', 'products.json')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = fs.readFileSync(productsFile, 'utf-8')
    const products = JSON.parse(data)
    const product = products.find((p: any) => p.id === parseInt(params.id))

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = fs.readFileSync(productsFile, 'utf-8')
    const products = JSON.parse(data)

    const index = products.findIndex((p: any) => p.id === parseInt(params.id))
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    products[index] = { ...products[index], ...body, id: parseInt(params.id) }
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2))

    return NextResponse.json(products[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = fs.readFileSync(productsFile, 'utf-8')
    const products = JSON.parse(data)

    const filteredProducts = products.filter((p: any) => p.id !== parseInt(params.id))

    if (products.length === filteredProducts.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    fs.writeFileSync(productsFile, JSON.stringify(filteredProducts, null, 2))

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
