import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const productsFile = path.join(process.cwd(), 'data', 'products.json')

export async function GET() {
  try {
    const data = fs.readFileSync(productsFile, 'utf-8')
    const products = JSON.parse(data)

    const response = NextResponse.json(products)
    response.headers.set('X-Total-Count', products.length.toString())
    response.headers.set('Access-Control-Expose-Headers', 'X-Total-Count')

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = fs.readFileSync(productsFile, 'utf-8')
    const products = JSON.parse(data)

    const newProduct = {
      ...body,
      id: products.length > 0 ? Math.max(...products.map((p: any) => p.id)) + 1 : 1
    }

    products.push(newProduct)
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2))

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
