"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  city: string
  state: string
  zip: string
}

interface Host {
  id: string
  first_name: string
  last_name: string
  email: string
}

export function QuickTourCreator() {
  console.log("🚀 QuickTourCreator component is rendering!")
  const [isCreating, setIsCreating] = useState(false)
  const [holdUntilEnabled, setHoldUntilEnabled] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Load tenant config on mount
  useEffect(() => {
    loadTenantConfig()
  }, [])

  const loadTenantConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('enable_hold_until')
        .single()

      if (data) {
        setHoldUntilEnabled(data.enable_hold_until || false)
      }
    } catch (error) {
      console.log('No tenant config found, using defaults')
      setHoldUntilEnabled(false)
    }
  }

  // Helper function to get random SKUs
  const getRandomSkus = async (count: number): Promise<string[]> => {
    const { data: products } = await supabase
      .from("swag_items")
      .select("sku")
      .limit(50) // Get more than we need for randomization

    if (!products || products.length === 0) {
      throw new Error("No SKUs available in database")
    }

    // Shuffle and take the requested count
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, products.length)).map(p => p.sku)
  }

  // Helper function to get random quantity between min and max
  const getRandomQuantity = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Helper function to get default warehouse and host
  const getDefaultWarehouseAndHost = async (): Promise<{ warehouse: Warehouse, host: Host }> => {
    const [warehouseRes, hostRes] = await Promise.all([
      supabase.from("warehouses").select("*").limit(1).single(),
      supabase.from("team_members").select("*").limit(1).single()
    ])

    if (warehouseRes.error || !warehouseRes.data) {
      throw new Error("No warehouse found")
    }
    if (hostRes.error || !hostRes.data) {
      throw new Error("No host found")
    }

    return {
      warehouse: warehouseRes.data,
      host: hostRes.data
    }
  }

  // Create Purchase Order
  const createPurchaseOrder = async (warehouse: Warehouse, host: Host, skus: string[]) => {
    const lineItems = skus.map(sku => ({
      sku,
      quantity: getRandomQuantity(1, 25).toString()
    }))

    const orderNumber = `PO-${host.first_name}-${host.last_name}-${warehouse.code}-${Date.now()}`

    const orderData = {
      order_number: orderNumber,
      shop_name: "ShipHero Tour Demo",
      fulfillment_status: holdUntilEnabled ? "hold_until" : "pending",
      order_date: new Date().toISOString(),
      total_tax: "0.00",
      subtotal: "100.00",
      total_discounts: "0.00", 
      total_price: "100.00",
      warehouse_id: warehouse.code,
      required_ship_date: new Date().toISOString().split('T')[0],
      line_items: lineItems
    }

    const response = await fetch('/api/shiphero/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'purchase_order',
        data: orderData
      })
    })

    if (!response.ok) throw new Error('Failed to create purchase order')
    return await response.json()
  }

  // Create Sales Orders (for batch and bulk orders)
  const createSalesOrder = async (warehouse: Warehouse, host: Host, orderNumber: string, lineItems: any[]) => {
    const orderData = {
      order_number: orderNumber,
      shop_name: "ShipHero Tour Demo",
      fulfillment_status: holdUntilEnabled ? "hold_until" : "pending",
      order_date: new Date().toISOString(),
      total_tax: "0.00",
      subtotal: "10.00",
      total_discounts: "0.00",
      total_price: "10.00",
      warehouse_id: warehouse.code,
      required_ship_date: new Date().toISOString().split('T')[0],
      shipping_address: {
        first_name: host.first_name,
        last_name: host.last_name,
        company: "Tour Demo",
        address1: warehouse.address,
        city: warehouse.city,
        state: warehouse.state,
        zip: warehouse.zip,
        country: "US",
        email: host.email
      },
      billing_address: {
        first_name: host.first_name,
        last_name: host.last_name,
        company: "Tour Demo",
        address1: warehouse.address,
        city: warehouse.city,
        state: warehouse.state,
        zip: warehouse.zip,
        country: "US",
        email: host.email
      },
      line_items: lineItems
    }

    const response = await fetch('/api/shiphero/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sales_order',
        data: orderData
      })
    })

    if (!response.ok) throw new Error('Failed to create sales order')
    return await response.json()
  }

  const handleCreateTour = async () => {
    setIsCreating(true)
    try {
      // Get warehouse and host
      const { warehouse, host } = await getDefaultWarehouseAndHost()

      // Get all available SKUs for randomization
      const allSkus = await getRandomSkus(50) // Get plenty for variety
      
      if (allSkus.length < 5) {
        throw new Error("Need at least 5 SKUs in database")
      }

      const results = {
        purchaseOrders: 0,
        multiItemBatch: 0,
        singleItemBatch: 0,
        bulkShip: 0
      }

      // 1. Create 1 Purchase Order with 5 SKUs
      console.log("Creating purchase order...")
      const poSkus = allSkus.slice(0, 5)
      await createPurchaseOrder(warehouse, host, poSkus)
      results.purchaseOrders = 1

      // 2. Create 10 Multi-item Batch Orders (2-4 SKUs each, max 2 units per SKU)
      console.log("Creating multi-item batch orders...")
      for (let i = 0; i < 10; i++) {
        const numSkus = getRandomQuantity(2, 4) // 2-4 SKUs per order
        const orderSkus = allSkus.sort(() => 0.5 - Math.random()).slice(0, numSkus)
        
        const lineItems = orderSkus.map(sku => ({
          sku,
          quantity: getRandomQuantity(1, 2).toString() // Max 2 units per SKU
        }))

        const orderNumber = `MB-${host.first_name}-${host.last_name}-${warehouse.code}-${Date.now()}-${i}`
        await createSalesOrder(warehouse, host, orderNumber, lineItems)
      }
      results.multiItemBatch = 10

      // 3. Create 10 Single-item Batch Orders (1 SKU each, can have duplicates)
      console.log("Creating single-item batch orders...")
      for (let i = 0; i < 10; i++) {
        const randomSku = allSkus[Math.floor(Math.random() * allSkus.length)]
        
        const lineItems = [{
          sku: randomSku,
          quantity: "1"
        }]

        const orderNumber = `SB-${host.first_name}-${host.last_name}-${warehouse.code}-${Date.now()}-${i}`
        await createSalesOrder(warehouse, host, orderNumber, lineItems)
      }
      results.singleItemBatch = 10

      // 4. Create 25 Bulk Ship Orders (identical orders, 1 SKU)
      console.log("Creating bulk ship orders...")
      const bulkSku = allSkus[0] // Use first SKU for all bulk orders
      
      for (let i = 0; i < 25; i++) {
        const lineItems = [{
          sku: bulkSku,
          quantity: "1"
        }]

        const orderNumber = `BS-${host.first_name}-${host.last_name}-${warehouse.code}-${Date.now()}-${i}`
        await createSalesOrder(warehouse, host, orderNumber, lineItems)
      }
      results.bulkShip = 25

      toast({
        title: "Tour Created Successfully!",
        description: `Created ${results.purchaseOrders} PO, ${results.multiItemBatch} multi-item batch, ${results.singleItemBatch} single-item batch, and ${results.bulkShip} bulk ship orders`,
      })

    } catch (error) {
      console.error("Error creating tour:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tour",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">🚀 Quick Tour Setup</h2>
        <p className="text-muted-foreground">
          Create a complete tour with all order types in one click
        </p>
      </div>
      
      <Button 
        onClick={handleCreateTour} 
        disabled={isCreating}
        size="lg"
        className="px-8 py-3 text-lg"
      >
        {isCreating ? "Creating Tour..." : "Create Tour"}
      </Button>

      <div className="text-sm text-muted-foreground text-center space-y-1">
        <p><strong>This will create:</strong></p>
        <ul className="space-y-1">
          <li>• 1 Purchase Order (5 SKUs, 1-25 units each)</li>
          <li>• 10 Multi-item Batch Orders (2-4 SKUs, max 2 units per SKU)</li>
          <li>• 10 Single-item Batch Orders (1 SKU each)</li>
          <li>• 25 Bulk Ship Orders (identical, 1 SKU)</li>
        </ul>
        <div className="pt-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${holdUntilEnabled ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {holdUntilEnabled ? 'Hold Until: Enabled' : 'Hold Until: Disabled'}
          </span>
        </div>
      </div>
    </div>
  )
}
