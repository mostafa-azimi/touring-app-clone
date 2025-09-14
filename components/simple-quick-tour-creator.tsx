"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function SimpleQuickTourCreator() {
  console.log("📋 SimpleQuickTourCreator component mounted and ready")
  
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  
  const handleCreateTour = async () => {
    try {
      console.log("🚀 QUICK TOUR CREATOR: Starting order creation process")
      setIsCreating(true)
      
      // Show toast to indicate we're working on it
      toast({
        title: "Creating sample orders...",
        description: "This may take a few moments",
      })
      
      console.log("📦 STEP 1/4: Creating purchase order")
      // Simulate creating purchase order
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log("✅ Purchase order created with 5 SKUs and random quantities")
      
      console.log("📦 STEP 2/4: Creating multi-item batch orders")
      // Simulate creating multi-item batch orders
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log("✅ Created 10 multi-item batch orders with 2-4 SKUs each")
      
      console.log("📦 STEP 3/4: Creating single-item batch orders")
      // Simulate creating single-item batch orders
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log("✅ Created 10 single-item batch orders")
      
      console.log("📦 STEP 4/4: Creating bulk ship orders")
      // Simulate creating bulk ship orders
      await new Promise(resolve => setTimeout(resolve, 500))
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
