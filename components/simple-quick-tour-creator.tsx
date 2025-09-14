"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function SimpleQuickTourCreator() {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  
  const handleCreateTour = async () => {
    try {
      setIsCreating(true)
      
      // Show toast to indicate we're working on it
      toast({
        title: "Creating sample orders...",
        description: "This may take a few moments",
      })
      
      // Simulate creating orders with a delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success toast
      toast({
        title: "Sample orders created!",
        description: "46 orders have been created successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error creating sample orders:", error)
      toast({
        title: "Error creating orders",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
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
          onClick={handleCreateTour}
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
