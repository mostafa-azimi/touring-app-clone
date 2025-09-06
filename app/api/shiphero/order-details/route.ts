import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json({ error: 'order_id parameter required' }, { status: 400 })
    }

    console.log(`🔍 Fetching order details for: ${orderId}`)

    // Query to get order details including line item IDs
    const query = `
      query {
        order(id: "${orderId}") {
          id
          order_number
          fulfillment_status
          line_items(first: 20) {
            edges {
              node {
                id
                sku
                quantity
                quantity_pending_fulfillment
                fulfillment_status
                product_name
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.errors && result.errors.length > 0) {
      console.error('❌ GraphQL errors:', result.errors)
      return NextResponse.json({
        success: false,
        errors: result.errors,
        message: result.errors[0].message
      }, { status: 400 })
    }

    console.log('✅ Successfully fetched order details')
    
    return NextResponse.json({
      success: true,
      order: result.data.order
    })

  } catch (error: any) {
    console.error('❌ Order details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
