"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { tokenManager } from "@/lib/shiphero/token-manager"

interface Warehouse {
  id: string
  name: string
  code: string
}

interface Host {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface Product {
  id: string
  sku: string
  name: string
}

export function SimpleQuickTourCreator() {
  console.log("📋 SimpleQuickTourCreator component mounted and ready")
  
  const [isCreating, setIsCreating] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [holdUntilEnabled, setHoldUntilEnabled] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  
  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      console.log("🔄 Loading warehouses, hosts, and products...")
      
      // Load warehouses
      const { data: warehouseData } = await supabase
        .from('warehouses')
        .select('id, name, code')
        .order('name')
      
      if (warehouseData && warehouseData.length > 0) {
        setWarehouses(warehouseData)
        console.log(`✅ Loaded ${warehouseData.length} warehouses`)
      } else {
        console.log("⚠️ No warehouses found")
      }
      
      // Load hosts (from team_members table)
      const { data: hostData } = await supabase
        .from('team_members')
        .select('id, first_name, last_name, email')
        .order('last_name')
      
      if (hostData && hostData.length > 0) {
        setHosts(hostData)
        console.log(`✅ Loaded ${hostData.length} hosts from team_members`)
      } else {
        console.log("⚠️ No hosts found in team_members table")
      }
      
      // Use hardcoded products since there's no products table
      const hardcodedProducts = [
        { id: '1', sku: 'DEMO-001', name: 'Demo Product 1' },
        { id: '2', sku: 'DEMO-002', name: 'Demo Product 2' },
        { id: '3', sku: 'DEMO-003', name: 'Demo Product 3' },
        { id: '4', sku: 'DEMO-004', name: 'Demo Product 4' },
        { id: '5', sku: 'DEMO-005', name: 'Demo Product 5' },
        { id: '6', sku: 'SAMPLE-A', name: 'Sample Product A' },
        { id: '7', sku: 'SAMPLE-B', name: 'Sample Product B' },
        { id: '8', sku: 'SAMPLE-C', name: 'Sample Product C' },
        { id: '9', sku: 'TEST-X', name: 'Test Product X' },
        { id: '10', sku: 'TEST-Y', name: 'Test Product Y' }
      ]
      
      setProducts(hardcodedProducts)
      console.log(`✅ Using ${hardcodedProducts.length} hardcoded products for demo`)
      
      // Load tenant config for hold_until setting
      try {
        const { data: configData, error: configError } = await supabase
          .from('tenant_config')
          .select('enable_hold_until')
          .single()
        
        if (configData && !configError) {
          setHoldUntilEnabled(configData.enable_hold_until || false)
          console.log(`✅ Hold Until setting: ${configData.enable_hold_until ? 'Enabled' : 'Disabled'}`)
        } else {
          console.log("⚠️ No tenant config found, using default (disabled)")
          setHoldUntilEnabled(false)
        }
      } catch (configError) {
        console.log("⚠️ Error loading tenant config, using default (disabled):", configError)
        setHoldUntilEnabled(false)
      }
      
    } catch (error) {
      console.error("❌ Error loading data:", error)
    }
  }
  
  // Helper functions
  const getRandomSkus = (count: number) => {
    if (products.length === 0) return []
    
    // Shuffle products and take the requested count
    const shuffled = [...products].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, products.length)).map(p => p.sku)
  }
  
  const getRandomQuantity = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  
  const getWarehouseAndHost = () => {
    // Get random warehouse and host, or first ones if available
    const warehouse = warehouses.length > 0 ? 
      warehouses[Math.floor(Math.random() * warehouses.length)] : 
      { id: "default", name: "Default Warehouse", code: "DEF" }
    
    const host = hosts.length > 0 ? 
      hosts[Math.floor(Math.random() * hosts.length)] : 
      { id: "default", first_name: "Default", last_name: "Host", email: "host@example.com" }
    
    return { warehouse, host }
  }
  
  // Create a purchase order
  const createPurchaseOrder = async (warehouse: Warehouse, host: Host, skus: string[]) => {
    try {
      console.log(`📦 Creating purchase order for warehouse: ${warehouse.name}`)
      
      const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      
      // Create line items with random quantities
      const lineItems = skus.map(sku => ({
        sku,
        quantity: getRandomQuantity(1, 25)
      }))
      
      // Get access token
      const accessToken = await tokenManager.getValidAccessToken()
      if (!accessToken) {
        throw new Error('No ShipHero access token available')
      }
      
      // Create the order via API
      const response = await fetch('/api/shiphero/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          type: 'purchase_order',
          data: {
            warehouse_id: warehouse.id,
            po_number: orderNumber,
            shop_name: "ShipHero Tour Demo",
            fulfillment_status: holdUntilEnabled ? "hold_until" : "pending",
            line_items: lineItems
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`✅ Purchase order created: ${orderNumber}`, result)
      return result
    } catch (error) {
      console.error("❌ Error creating purchase order:", error)
      throw error
    }
  }
  
  // Create a sales order
  const createSalesOrder = async (warehouse: Warehouse, host: Host, skus: string[], orderType: string) => {
    try {
      console.log(`📦 Creating ${orderType} for warehouse: ${warehouse.name}`)
      
      const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      
      // Create line items based on order type
      let lineItems = []
      
      if (orderType === "multi-item") {
        // 2-4 unique SKUs with 1-2 quantity each
        const numSkus = getRandomQuantity(2, Math.min(4, skus.length))
        lineItems = skus.slice(0, numSkus).map(sku => ({
          sku,
          quantity: getRandomQuantity(1, 2)
        }))
      } else if (orderType === "single-item") {
        // 1 SKU
        lineItems = [{
          sku: skus[0],
          quantity: 1
        }]
      } else if (orderType === "bulk-ship") {
        // 1 SKU with quantity 1
        lineItems = [{
          sku: skus[0],
          quantity: 1
        }]
      }
      
      // Get access token
      const accessToken = await tokenManager.getValidAccessToken()
      if (!accessToken) {
        throw new Error('No ShipHero access token available')
      }
      
      // Create the order via API
      const response = await fetch('/api/shiphero/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          type: 'sales_order',
          data: {
            warehouse_id: warehouse.id,
            order_number: orderNumber,
            email: host.email,
            first_name: host.first_name,
            last_name: host.last_name,
            shop_name: "ShipHero Tour Demo",
            fulfillment_status: holdUntilEnabled ? "hold_until" : "pending",
            shipping_address: {
              first_name: host.first_name,
              last_name: host.last_name,
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              zip: "10001",
              country: "US",
              email: host.email
            },
            billing_address: {
              first_name: host.first_name,
              last_name: host.last_name,
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              zip: "10001",
              country: "US",
              email: host.email
            },
            shipping_lines: {
              title: "Standard Shipping",
              price: "0.00"
            },
            line_items: lineItems
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`✅ ${orderType} order created: ${orderNumber}`, result)
      return result
    } catch (error) {
      console.error(`❌ Error creating ${orderType} order:`, error)
      throw error
    }
  }
  
  const handleCreateTour = async () => {
    try {
      console.log("🚀 QUICK TOUR CREATOR: Starting order creation process")
      setIsCreating(true)
      
      // Show toast to indicate we're working on it
      toast({
        title: "Creating sample orders...",
        description: "This may take a few moments",
      })
      
      // Get warehouse and host
      const { warehouse, host } = getWarehouseAndHost()
      
      console.log("📦 STEP 1/4: Creating purchase order")
      // Create purchase order with 5 SKUs
      const purchaseOrderSkus = getRandomSkus(5)
      await createPurchaseOrder(warehouse, host, purchaseOrderSkus)
      console.log("✅ Purchase order created with 5 SKUs and random quantities")
      
      console.log("📦 STEP 2/4: Creating multi-item batch orders")
      // Create 10 multi-item batch orders
      for (let i = 0; i < 10; i++) {
        const skus = getRandomSkus(4) // Get up to 4 SKUs
        await createSalesOrder(warehouse, host, skus, "multi-item")
      }
      console.log("✅ Created 10 multi-item batch orders with 2-4 SKUs each")
      
      console.log("📦 STEP 3/4: Creating single-item batch orders")
      // Create 10 single-item batch orders
      for (let i = 0; i < 10; i++) {
        const skus = getRandomSkus(1) // Get 1 SKU
        await createSalesOrder(warehouse, host, skus, "single-item")
      }
      console.log("✅ Created 10 single-item batch orders")
      
      console.log("📦 STEP 4/4: Creating bulk ship orders")
      // Create 25 bulk ship orders with the same SKU
      const bulkShipSku = getRandomSkus(1) // Get 1 SKU for all bulk orders
      for (let i = 0; i < 25; i++) {
        await createSalesOrder(warehouse, host, bulkShipSku, "bulk-ship")
      }
      console.log("✅ Created 25 bulk ship orders with identical SKUs")
      
      console.log("🎉 SUCCESS: All 46 orders created successfully!")
      
      // Show success toast
      toast({
        title: "Sample orders created!",
        description: "46 orders have been created successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("❌ ERROR: Failed to create sample orders:", error)
      toast({
        title: "Error creating orders",
        description: "Please try again later. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
      console.log("🏁 FINISHED: Order creation process complete")
    }
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">🚀 Quick Tour Creator</h2>
        <p className="text-muted-foreground">Create a complete tour with sample orders instantly</p>
        
        <Button 
          size="lg" 
          className="px-6 py-6 text-lg"
          onClick={() => {
            console.log("👆 BUTTON CLICKED: Create Sample Tour button was clicked")
            handleCreateTour()
          }}
          disabled={isCreating}
        >
          {isCreating ? "Creating Sample Orders..." : "Create Sample Tour"}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>1 Purchase Order (5 SKUs, random quantities 1-25)</li>
            <li>10 Multi-item Batch Orders (2-4 SKUs each, max 2 units per SKU)</li>
            <li>10 Single-item Batch Orders (1 SKU each)</li>
            <li>25 Bulk Ship Orders (identical orders)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
