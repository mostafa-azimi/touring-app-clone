"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Calendar, MapPin, Users, Gift, Upload, Download, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { WorkflowOption } from "@/lib/shiphero/tour-finalization-service"
import { SimpleQuickTourCreator } from "./simple-quick-tour-creator"
// Products are managed through ShipHero inventory API

// Generic component for product selection with quantities (used by all workflows)
function WorkflowProductSelection({ allSkus, workflowConfig, onSkuQuantityChange, selectedWarehouse, workflowName, workflowId }: {
  allSkus: any[]
  workflowConfig: any
  onSkuQuantityChange: (sku: string, quantity: number) => void
  selectedWarehouse: any
  workflowName: string
  workflowId?: string
}) {
  if (allSkus.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Select a warehouse to load products</p>
      </div>
    )
  }

  // Check if this is Single Item Batch workflow (limit to 1 SKU)
  const isSingleItemBatch = workflowId === 'single_item_batch'
  const selectedSkuCount = Object.keys(workflowConfig?.skuQuantities || {}).filter(sku => 
    (workflowConfig?.skuQuantities?.[sku] || 0) > 0
  ).length

  // Filter products by selected warehouse - use same logic as Adhoc Sales Order (memoized to prevent infinite re-renders)
  const filteredProducts = useMemo(() => {
    return allSkus.filter(product => {
      // Check if product has inventory for this specific warehouse
      return product.inventory?.warehouse_id === selectedWarehouse?.shiphero_warehouse_id
    })
  }, [allSkus, selectedWarehouse?.shiphero_warehouse_id])

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No products found for warehouse: {selectedWarehouse?.name}</p>
        <p className="text-xs mt-2">Warehouse code: {selectedWarehouse?.code}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium">📦 Select products and quantities for {workflowName} at {selectedWarehouse?.name}:</Label>
        {isSingleItemBatch && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            <strong>Single Item Batch:</strong> You can only select 1 SKU for this workflow. {selectedSkuCount > 0 && `Currently selected: ${selectedSkuCount}/1`}
          </p>
        )}
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredProducts.map(product => {
          const currentQuantity = workflowConfig?.skuQuantities?.[product.sku] || 0
          const availableQty = product.inventory?.available || product.available || 0
          
          // For Single Item Batch, disable products if one is already selected and this isn't it
          const isDisabled = isSingleItemBatch && selectedSkuCount >= 1 && currentQuantity === 0
          
          return (
            <div 
              key={product.sku} 
              className={`relative flex flex-col space-y-3 p-4 rounded-lg border transition-all duration-200 ${
                isDisabled 
                  ? 'border-slate-100 bg-slate-50 opacity-50' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm hover:bg-blue-25'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {product.sku}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {product.name}
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    availableQty > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {availableQty} available
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`qty-${product.sku}`} className="text-xs">Qty:</Label>
                <Input
                  id={`qty-${product.sku}`}
                  type="number"
                  min="0"
                  value={currentQuantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 0
                    // For Single Item Batch, clear other SKUs when selecting a new one
                    if (isSingleItemBatch && newQuantity > 0) {
                      // Clear all other SKUs first
                      Object.keys(workflowConfig?.skuQuantities || {}).forEach(sku => {
                        if (sku !== product.sku) {
                          onSkuQuantityChange(sku, 0)
                        }
                      })
                    }
                    onSkuQuantityChange(product.sku, newQuantity)
                  }}
                  disabled={isDisabled}
                  className="w-20 h-8 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Enter quantities for products you want to include in the purchase order. Set to 0 to exclude.
      </p>
    </div>
  )
}

interface Warehouse {
  id: string
  name: string
  code?: string
  address: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

interface Participant {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
  title: string
}


// Generate a 6-digit numeric tour ID
function generateTourNumericId(): number {
  return Math.floor(100000 + Math.random() * 900000)
}

// Workflow options for tour finalization
const workflowOptions = [
  {
    id: "standard_receiving" as WorkflowOption,
    name: "Standard Receiving",
    description: "Creates one purchase order using your selected SKUs and quantities for receiving training",
    category: "Inbound",
    badge: "Standard"
  },
  {
    id: "receive_to_light" as WorkflowOption,
    name: "Receive to Light",
    description: "Creates one purchase order using your selected SKUs and quantities for light-guided receiving training",
    category: "Inbound",
    badge: "Attainable Automation"
  },
  {
    id: "bulk_shipping" as WorkflowOption,
    name: "Bulk Shipping",
    description: "Creates identical orders with same SKUs shipping to different customer addresses (demonstrates bulk processing efficiency)",
    category: "Fulfillment",
    badge: "Standard"
  },
  {
    id: "single_item_batch" as WorkflowOption,
    name: "Single-Item Batch",
    description: "Creates single line-item orders with different SKUs shipping to different customer addresses (demonstrates single-item batch efficiency)",
    category: "Fulfillment",
    badge: "Standard"
  },
  {
    id: "multi_item_batch" as WorkflowOption,
    name: "Multi-Item Batch",
    description: "Creates participant orders + additional training orders with multiple SKUs for complex batch picking training",
    category: "Fulfillment",
    badge: "Standard"
  },
  {
    id: "pack_to_light" as WorkflowOption,
    name: "Pack to Light",
    description: "Creates participant orders using selected SKUs for light-guided packing demonstrations",
    category: "Fulfillment",
    badge: "Attainable Automation"
  }
]

const categories = [
  "Inbound",
  "Fulfillment"
]

// Global render counter for debugging
let renderCount = 0

export function ScheduleTourPage() {
  renderCount++
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [hosts, setHosts] = useState<any[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    warehouse_id: "",
    host_id: "",
    date: "2025-11-15", // Default to mid-November for easier testing
    time: "09:00", // Default to 9:00 AM
  })
  const [newParticipant, setNewParticipant] = useState({ first_name: "", last_name: "", email: "", company: "", title: "" })
  const [isUploadingCSV, setIsUploadingCSV] = useState(false)
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([])
  const [workflowConfigs, setWorkflowConfigs] = useState<{[key: string]: {orderCount: number, skuQuantities: {[sku: string]: number}}}>({})
  const [expandedWorkflows, setExpandedWorkflows] = useState<string[]>([])
  const [allSkus, setAllSkus] = useState<any[]>([]) // Store all SKUs for filtering
  
  
  // Add debugging to track what's changing
  const [isLoadingSkus, setIsLoadingSkus] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleWorkflowChange = useCallback((optionId: string, checked: boolean) => {
    
    if (checked) {
      setSelectedWorkflows(prev => {
        return [...prev, optionId]
      })
      // Initialize workflow config with defaults
      setWorkflowConfigs(prev => {
        return {
          ...prev,
          [optionId]: {
            orderCount: 5, // Default to 5 orders
            selectedSkus: [],
            skuQuantities: {} // For Standard Receiving quantities
          }
        }
      })
      // Auto-expand the workflow section
      setExpandedWorkflows(prev => {
        return [...prev, optionId]
      })
    } else {
      setSelectedWorkflows(prev => {
        return prev.filter(id => id !== optionId)
      })
      // Remove workflow config
      setWorkflowConfigs(prev => {
        const newConfigs = { ...prev }
        delete newConfigs[optionId]
        return newConfigs
      })
      // Collapse the workflow section
      setExpandedWorkflows(prev => {
        return prev.filter(id => id !== optionId)
      })
    }
  }, [])

  const toggleWorkflowExpansion = (workflowId: string) => {
    setExpandedWorkflows(prev => 
      prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    )
  }

  const updateWorkflowOrderCount = (workflowId: string, count: number) => {
    setWorkflowConfigs(prev => ({
      ...prev,
      [workflowId]: {
        ...prev[workflowId],
        orderCount: count
      }
    }))
  }

  const handleWorkflowSkuChange = useCallback((workflowId: string, sku: string, checked: boolean) => {
    setWorkflowConfigs(prev => ({
      ...prev,
      [workflowId]: {
        orderCount: prev[workflowId]?.orderCount || 5,
        selectedSkus: checked 
          ? [...(prev[workflowId]?.selectedSkus || []), sku]
          : (prev[workflowId]?.selectedSkus || []).filter(s => s !== sku)
      }
    }))
  }, [])

  const loadAllSkus = async () => {
    setIsLoadingSkus(true)
    try {
      // Use centralized data service for better caching and performance
      const { shipHeroDataService } = await import('@/lib/shiphero/data-service')
      const activeProducts = await shipHeroDataService.getActiveProducts()
      
      // Sort alphabetically by SKU
      const sortedProducts = activeProducts.sort((a, b) => a.sku.localeCompare(b.sku))
      
      // Store all SKUs for workflow filtering
      setAllSkus(sortedProducts)
    } catch (error: any) {
      console.error('Failed to load SKUs:', error)
      toast({
        title: "Failed to Load SKUs",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingSkus(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
    fetchHosts()
    // Auto-load SKUs when component mounts for better UX
    loadAllSkus()
  }, [])

  const fetchWarehouses = async () => {
    try {
      
      // First, load existing warehouses from remote database
      const { data: existingWarehouses, error: dbError } = await supabase
        .from('warehouses')
        .select('id, name, code, address, address2, city, state, zip, country, shiphero_warehouse_id')
        .order('name')
      
      if (dbError) {
        console.error('❌ Error fetching warehouses from remote database:', dbError)
        throw new Error('Failed to fetch warehouses from remote database')
      }
      
      
      // If we have existing warehouses, use them but also check for updates from ShipHero
      if (existingWarehouses && existingWarehouses.length > 0) {
        setWarehouses(existingWarehouses)
        
        // Continue to check ShipHero for any new warehouses (don't return early)
      }
      
      // Sync from ShipHero (either for first time or to check for updates)
      const hasExistingWarehouses = existingWarehouses && existingWarehouses.length > 0
      
      const { tokenManager } = await import('@/lib/shiphero/token-manager')
      const accessToken = await tokenManager.getValidAccessToken()
      
      if (!accessToken) {
        console.error('❌ No ShipHero access token available')
        if (!hasExistingWarehouses) {
          toast({
            title: "Error",
            description: "No ShipHero access token found. Please generate one in Settings.",
            variant: "destructive",
          })
          setWarehouses([])
        }
        return
      }
      
      const response = await fetch('/api/shiphero/warehouses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('❌ Failed to fetch warehouses from ShipHero')
        throw new Error('Failed to fetch warehouses from ShipHero')
      }

      const result = await response.json()
      const shipHeroWarehouses = result.data?.account?.data?.warehouses || []
      
      if (shipHeroWarehouses.length === 0) {
        if (!hasExistingWarehouses) {
          setWarehouses([])
        }
        return
      }
      
      
      // Check which warehouses are new (not in local database)
      const existingShipHeroIds = new Set(existingWarehouses?.map(w => w.shiphero_warehouse_id) || [])
      const newWarehouses = shipHeroWarehouses.filter(warehouse => !existingShipHeroIds.has(warehouse.id))
      
      if (newWarehouses.length > 0) {
        
        const warehousesToCreate = newWarehouses.map(warehouse => ({
          name: warehouse.address?.name || warehouse.identifier,
          code: warehouse.identifier || '',
          address: warehouse.address?.address1 || '',
          address2: warehouse.address?.address2 || '',
          city: warehouse.address?.city || '',
          state: warehouse.address?.state || '',
          zip: warehouse.address?.zip || '',
          country: warehouse.address?.country || 'US',
          shiphero_warehouse_id: warehouse.id
        }))
        
        const { data: createdWarehouses, error: createError } = await supabase
          .from('warehouses')
          .insert(warehousesToCreate)
          .select('id, name, code, address, address2, city, state, zip, country, shiphero_warehouse_id')
        
        if (createError) {
          console.error('❌ Error creating new warehouses in remote database:', createError)
          // Don't throw error, just log it - we still have existing warehouses
        } else {
          
          // Merge existing and new warehouses
          const allWarehouses = [...(existingWarehouses || []), ...(createdWarehouses || [])]
          setWarehouses(allWarehouses)
          
          toast({
            title: "Warehouses Updated",
            description: `Added ${createdWarehouses?.length || 0} new warehouses from ShipHero`,
            variant: "default",
          })
        }
      } else {
        if (hasExistingWarehouses) {
          // Warehouses already set above, no need to update
        } else {
          setWarehouses(existingWarehouses || [])
        }
      }
      
    } catch (error) {
      console.error("❌ Error in fetchWarehouses:", error)
      toast({
        title: "Error",
        description: `Failed to load warehouses: ${error.message}`,
        variant: "destructive",
      })
      setWarehouses([])
    }
  }

  const fetchHosts = async () => {
    try {
      const { data, error } = await supabase.from("team_members").select("id, first_name, last_name, email").order("first_name")

      if (error) throw error
      setHosts(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch hosts",
        variant: "destructive",
      })
    }
  }

  const addParticipant = () => {
    if (!newParticipant.first_name.trim() || !newParticipant.last_name.trim() || !newParticipant.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter first name, last name, and email for the participant",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate emails
    if (participants.some((p) => p.email.toLowerCase() === newParticipant.email.toLowerCase())) {
      toast({
        title: "Error",
        description: "A participant with this email already exists",
        variant: "destructive",
      })
      return
    }

    const participant: Participant = {
      id: crypto.randomUUID(),
      first_name: newParticipant.first_name.trim(),
      last_name: newParticipant.last_name.trim(),
      email: newParticipant.email.trim().toLowerCase(),
      company: newParticipant.company.trim(),
      title: newParticipant.title.trim(),
    }

    setParticipants([...participants, participant])
    setNewParticipant({ first_name: "", last_name: "", email: "", company: "", title: "" })
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.warehouse_id || !formData.host_id || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Allow tours without participants for testing
    if (participants.length === 0) {
    }

    setIsLoading(true)

    try {
      // Debug: Log the data being sent
      // Aggregate all SKUs from all workflows for backward compatibility
      const allSelectedSkus = Array.from(new Set(
        Object.values(workflowConfigs).flatMap(config => config.selectedSkus)
      ))

      const tourInsertData = {
            warehouse_id: formData.warehouse_id,
            host_id: formData.host_id,
            date: formData.date,
            time: formData.time,
            status: 'scheduled',
            tour_numeric_id: generateTourNumericId(),
        selected_workflows: selectedWorkflows,
        selected_skus: allSelectedSkus, // Aggregated SKUs from all workflows
        workflow_configs: workflowConfigs, // New detailed configuration
      }
      
      
      // DETAILED DEBUGGING - Show exactly what's being sent

      // Validate data before sending
      if (!formData.warehouse_id) {
        throw new Error('Warehouse ID is required')
      }
      if (!formData.host_id) {
        throw new Error('Host ID is required')
      }
      if (!formData.date) {
        throw new Error('Date is required')
      }
      if (!formData.time) {
        throw new Error('Time is required')
      }

      // Check if warehouse_id looks like a UUID (should be if from our database)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(formData.warehouse_id)) {
        console.error('❌ Invalid warehouse ID format:', formData.warehouse_id)
        throw new Error(`Invalid warehouse ID format: ${formData.warehouse_id}. Expected UUID format.`)
      }
      if (!uuidRegex.test(formData.host_id)) {
        console.error('❌ Invalid host ID format:', formData.host_id)
        throw new Error(`Invalid host ID format: ${formData.host_id}. Expected UUID format.`)
      }


      // Optimized: Create tour and get related data in one query with joins
      const { data: tourData, error: tourError } = await supabase
        .from("tours")
        .insert([tourInsertData])
        .select(`
          *,
          warehouse:warehouses(id, name, address, city, state, zip, country),
          host:team_members(id, first_name, last_name, email)
        `)
        .single()

      if (tourError) {
        console.error('🚨 Supabase tour creation error:', tourError)
        console.error('🚨 Error details:', JSON.stringify(tourError, null, 2))
        throw tourError
      }

      // Add participants in batch for better performance
      let insertedParticipants = null
      if (participants.length > 0) {
      const participantInserts = participants.map((participant) => ({
        tour_id: tourData.id,
        name: `${participant.first_name} ${participant.last_name}`, // Keep name field for backward compatibility
        first_name: participant.first_name,
        last_name: participant.last_name,
        email: participant.email,
        company: participant.company,
        title: participant.title,
      }))

        const { data: participantData, error: participantError } = await supabase
        .from("tour_participants")
        .insert(participantInserts)
          .select("id, first_name, last_name, email, company, title")

      if (participantError) throw participantError
        insertedParticipants = participantData
      }

      // Show success toast after a brief delay to ensure it's visible
      console.log('🎉 TOUR CREATION SUCCESS - About to show toast')
      setTimeout(() => {
        console.log('🎉 SHOWING TOUR CREATION TOAST NOW')
        toast({
          title: "🎉 Tour Created Successfully!",
          description: `Tour scheduled for ${new Date(formData.date).toLocaleDateString()} at ${(() => {
            const [hour24, minute] = formData.time.split(':')
            const hour12 = parseInt(hour24) % 12 || 12
            const period = parseInt(hour24) >= 12 ? 'PM' : 'AM'
            return `${hour12}:${minute} ${period}`
          })()} with ${participants.length} participant${participants.length > 1 ? "s" : ""}!`,
          duration: 6000, // Show for 6 seconds
        })
        console.log('🎉 TOUR CREATION TOAST CALLED')
      }, 100)

            // Reset form
      setFormData({ warehouse_id: "", host_id: "", date: "2025-11-15", time: "09:00" })
      setParticipants([])
      setSelectedWorkflows([])
      setWorkflowConfigs({})
    } catch (error: any) {
      console.error('Tour creation error:', error)
      toast({
        title: "Error",
        description: `Failed to schedule tour: ${error.message || error.toString()}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedWarehouse = useMemo(() => {
    const result = warehouses.find((w) => w.id === formData.warehouse_id)
    return result
  }, [warehouses, formData.warehouse_id])

  // Memoize category options to prevent re-renders
  const getCategoryOptions = useMemo(() => {
    const categoryMap = new Map()
    categories.forEach(category => {
      const result = workflowOptions.filter(option => option.category === category)
      categoryMap.set(category, result)
    })
    return categoryMap
  }, []) // workflowOptions and categories are static constants

  // Stable callback for workflow SKU changes to prevent infinite re-renders
  const handleWorkflowSkuChangeCallback = useCallback((workflowId: string, sku: string, checked: boolean) => {
    handleWorkflowSkuChange(workflowId, sku, checked)
  }, [handleWorkflowSkuChange])

  // Memoize workflow SKUs to prevent infinite re-renders
  const workflowSkusMap = useMemo(() => {
    const skuMap = new Map()
    selectedWorkflows.forEach(workflowId => {
      const workflowSelectedSkus = workflowConfigs[workflowId]?.selectedSkus || []
      skuMap.set(workflowId, allSkus.map((product, index) => {
        const isSelected = workflowSelectedSkus.includes(product.sku)
        return (
          <div
            key={product.sku}
            className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/50'
            }`}
            onClick={() => handleWorkflowSkuChangeCallback(workflowId, product.sku, !isSelected)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-tight truncate">
                  {product.name}
                </h4>
                <Checkbox
                  checked={isSelected}
                  onChange={() => {}} // Handled by parent click
                  className="pointer-events-none"
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {product.sku}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Qty: {product.quantity_available || 0}
                </span>
              </div>
            </div>
          </div>
        )
      }))
    })
    return skuMap
  }, [allSkus, selectedWorkflows, workflowConfigs, handleWorkflowSkuChangeCallback])

  // CSV Upload functionality
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setIsUploadingCSV(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Validate headers for participant data
      const requiredHeaders = ['first_name', 'last_name', 'email']
      const optionalHeaders = ['company', 'title']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(', ')}. Required: ${requiredHeaders.join(', ')}. Optional: ${optionalHeaders.join(', ')}`,
          variant: "destructive",
        })
        return
      }

      // Parse participant data from CSV
      const participantsToAdd: Participant[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        if (values.length < 3) continue // Need at least first_name, last_name, email

        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email)) {
          console.warn(`Invalid email format: ${row.email}`)
          continue
        }

        // Check for duplicate email in current participants
        const isDuplicate = participants.some(p => p.email.toLowerCase() === row.email.toLowerCase()) ||
                           participantsToAdd.some(p => p.email.toLowerCase() === row.email.toLowerCase())

        if (isDuplicate) {
          console.warn(`Duplicate email skipped: ${row.email}`)
          continue
        }

        participantsToAdd.push({
          id: '', // Will be generated
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          company: row.company || '',
          title: row.title || ''
        })
      }

      if (participantsToAdd.length === 0) {
        toast({
          title: "No Valid Participants",
          description: "No valid participants found in CSV file. Check for duplicates or invalid email formats.",
          variant: "destructive",
        })
        return
      }

      // Add participants to current list
      setParticipants(prev => [...prev, ...participantsToAdd])

      toast({
        title: "Participants Added",
        description: `Successfully added ${participantsToAdd.length} participants from CSV file`,
      })

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      })
    } finally {
      setIsUploadingCSV(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Download CSV template
  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/tour-upload-template.csv'
    link.download = 'participant-upload-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ShipHero-style page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
            Schedule a New Tour
        </h1>
        <p className="text-slate-600">Create a new warehouse tour and configure training workflows and products for realistic demonstrations.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg font-semibold text-slate-800">Tour Configuration</CardTitle>
          <CardDescription className="text-slate-600">
            Fill out the tour details, select training workflows, and choose products for demonstrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tour Details Section - 2x2 Grid Layout */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select
                  value={formData.warehouse_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, warehouse_id: value })
                  }}
                >
                  <SelectTrigger id="warehouse" className="cursor-pointer">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id} className="cursor-pointer">
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedWarehouse && (
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedWarehouse.city && selectedWarehouse.state 
                        ? `${selectedWarehouse.address}, ${selectedWarehouse.city}, ${selectedWarehouse.state} ${selectedWarehouse.zip || ''}`.trim()
                        : selectedWarehouse.address
                      }
                    </p>
                    {selectedWarehouse.code && (
                      <p className="text-xs">Code: {selectedWarehouse.code}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="host">Host *</Label>
                <Select
                  value={formData.host_id}
                  onValueChange={(value) => setFormData({ ...formData, host_id: value })}
                >
                  <SelectTrigger id="host" className="cursor-pointer">
                    <SelectValue placeholder="Select tour host" />
                  </SelectTrigger>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem key={host.id} value={host.id} className="cursor-pointer">
                        {host.first_name} {host.last_name} ({host.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="cursor-pointer h-9 w-fit max-w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="cursor-pointer h-9 w-fit max-w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
                  style={{ colorScheme: 'light' }}
                />
                {formData.time && (
                  <p className="text-sm text-muted-foreground">
                    Selected time: {(() => {
                      const [hour24, minute] = formData.time.split(':')
                      const hour12 = parseInt(hour24) % 12 || 12
                      const period = parseInt(hour24) >= 12 ? 'PM' : 'AM'
                      return `${hour12}:${minute} ${period}`
                    })()}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Participants Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Participants</h3>
                <span className="text-sm text-muted-foreground">({participants.length} added)</span>
              </div>

              {/* Add Participant Form */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="participant-first-name">First Name</Label>
                        <Input
                          id="participant-first-name"
                          value={newParticipant.first_name}
                          onChange={(e) => setNewParticipant({ ...newParticipant, first_name: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="participant-last-name">Last Name</Label>
                        <Input
                          id="participant-last-name"
                          value={newParticipant.last_name}
                          onChange={(e) => setNewParticipant({ ...newParticipant, last_name: e.target.value })}
                          placeholder="Smith"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="participant-email">Email</Label>
                        <Input
                          id="participant-email"
                          type="email"
                          value={newParticipant.email}
                          onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                          placeholder="john.smith@company.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="participant-company">Company</Label>
                        <Input
                          id="participant-company"
                          value={newParticipant.company}
                          onChange={(e) => setNewParticipant({ ...newParticipant, company: e.target.value })}
                          placeholder="ACME Corp"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="participant-title">Title</Label>
                        <Input
                          id="participant-title"
                          value={newParticipant.title}
                          onChange={(e) => setNewParticipant({ ...newParticipant, title: e.target.value })}
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={addParticipant} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Participant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants List */}
              {participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tour Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{participant.first_name} {participant.last_name}</p>
                              {participant.title && (
                                <span className="text-sm text-muted-foreground">- {participant.title}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{participant.email}</p>
                            {participant.company && (
                              <p className="text-sm text-muted-foreground">{participant.company}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParticipant(participant.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {participants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No participants added yet</p>
                  <p className="text-sm">Add participants using the form above</p>
                </div>
              )}
            </div>



            <Separator />

            {/* Workflow Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Training Workflows</h3>
                <span className="text-sm text-muted-foreground">({selectedWorkflows.length} selected)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Select the training workflows to create when finalizing this tour. These will generate specific orders in ShipHero for different training scenarios.
              </p>

              <div className="space-y-6">
                {categories.map(category => {
                  const categoryOptions = getCategoryOptions.get(category) || []
                  
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <Separator className="flex-1" />
                      </div>
                      
                      <div className="space-y-3">
                        {categoryOptions.map(option => (
                          <div key={option.id} className="space-y-3">
                            {/* Workflow Selection Row */}
                            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                              <Checkbox
                                id={option.id}
                                checked={selectedWorkflows.includes(option.id)}
                                onCheckedChange={(checked) => handleWorkflowChange(option.id, checked as boolean)}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                    {option.name}
                                  </Label>
                                  <Badge variant={option.badge === "Original" ? "default" : "secondary"} className="text-xs">
                                    {option.badge}
                                  </Badge>
                                  {selectedWorkflows.includes(option.id) && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleWorkflowExpansion(option.id)}
                                      className="ml-auto h-6 px-2"
                                    >
                                      {expandedWorkflows.includes(option.id) ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            {/* Expandable Configuration Section */}
                            {selectedWorkflows.includes(option.id) && expandedWorkflows.includes(option.id) && (
                              <div className="ml-6 p-4 bg-muted/30 rounded-lg border space-y-4">
                                {/* Order Count Input - Only for fulfillment workflows */}
                                {!['standard_receiving', 'receive_to_light'].includes(option.id) && (
                                  <div className="flex items-center gap-4">
                                    <Label htmlFor={`${option.id}-count`} className="text-sm font-medium">
                                      📦 Orders to Create:
                                    </Label>
                                    <Input
                                      id={`${option.id}-count`}
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={workflowConfigs[option.id]?.orderCount || 5}
                                      onChange={(e) => updateWorkflowOrderCount(option.id, parseInt(e.target.value) || 5)}
                                      className="w-20"
                                    />
                                  </div>
                                )}

                                {/* Simplified Product Selection for All Workflows */}
                                <WorkflowProductSelection 
                                  allSkus={allSkus}
                                  workflowConfig={workflowConfigs[option.id]}
                                  selectedWarehouse={selectedWarehouse}
                                  workflowName={option.name}
                                  workflowId={option.id}
                                  onSkuQuantityChange={(sku, quantity) => {
                                    setWorkflowConfigs(prev => ({
                                      ...prev,
                                      [option.id]: {
                                        orderCount: prev[option.id]?.orderCount || 5,
                                        skuQuantities: {
                                          ...prev[option.id]?.skuQuantities,
                                          [sku]: quantity
                                        }
                                      }
                                    }))
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="lg"
                className={isLoading ? "cursor-wait" : ""}
              >
                {isLoading ? "Scheduling..." : "Schedule Tour"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CSV Participant Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Add Participants
          </CardTitle>
          <CardDescription>Add multiple participants to this tour using CSV format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  disabled={isUploadingCSV}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isUploadingCSV}
                  className={isUploadingCSV ? "cursor-wait" : ""}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isUploadingCSV ? "Adding Participants..." : "Upload Participants CSV"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to add multiple participants to this tour. Download the template to see the required format: first_name, last_name, email, company (optional), title (optional).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tour Creator - After Tour Configuration */}
      <div className="mt-8 mb-8">
        <SimpleQuickTourCreator />
      </div>
    </div>
  )
}
