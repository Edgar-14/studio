"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  addressCompletion,
  type AddressCompletionOutput,
} from "@/ai/flows/address-completion"
import { Loader2, CheckCircle, Wand2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  customerPhone: z.string().min(10, "Phone number seems too short."),
  customerAddress: z.string().min(10, "Address seems too short."),
  orderId: z.string().optional(),
  notes: z.string().optional(),
})

export function AddressAssistantForm() {
  const { toast } = useToast()
  const [addressInput, setAddressInput] = useState("")
  const [completion, setCompletion] = useState<AddressCompletionOutput | null>(
    null
  )
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      orderId: "",
      notes: "",
    },
  })

  const watchedAddress = form.watch("customerAddress")

  useEffect(() => {
    const handler = setTimeout(() => {
      setAddressInput(watchedAddress)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [watchedAddress])

  useEffect(() => {
    if (addressInput && addressInput.length > 10) {
      startTransition(async () => {
        const result = await addressCompletion({ address: addressInput })
        if (result && result.validatedAddress) {
          setCompletion(result)
        } else {
          setCompletion(null)
        }
      })
    } else {
      setCompletion(null)
    }
  }, [addressInput])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Order Created!",
      description: "The new delivery order has been successfully created.",
    })
    form.reset()
    setCompletion(null)
  }

  function applySuggestion() {
    if (completion?.validatedAddress) {
      form.setValue("customerAddress", completion.validatedAddress)
      setCompletion(null)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customerAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Start typing an address to see AI suggestions..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is validating address...</span>
          </div>
        )}

        {completion && (
          <Card className="bg-accent/20 border-accent/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Wand2 className="h-5 w-5" />
                    <span>AI Suggestion</span>
                  </div>
                  <p className="mt-2 text-sm">{completion.validatedAddress}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence:{" "}
                    <span className="font-medium text-foreground">
                      {Math.round(completion.confidenceLevel * 100)}%
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applySuggestion}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., #12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., leave at front door" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" size="lg">
          Create Order
        </Button>
      </form>
    </Form>
  )
}
