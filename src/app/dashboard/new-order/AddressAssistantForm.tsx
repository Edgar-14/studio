// src/app/dashboard/new-order/AddressAssistantForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, User, Phone, MapPin, Notebook, DollarSign } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/AddressAutocompleteInput';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

type LatLng = { lat: number; lng: number };

const newOrderSchema = z.object({
  customerName: z.string().min(3, "Nombre de cliente requerido."),
  customerPhone: z.string().regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos."),
  deliveryAddress: z.string().min(10, "La dirección de entrega es requerida."),
  amountToCollect: z.coerce.number().optional().default(0),
  notes: z.string().optional(),
});

interface AddressAssistantFormProps {
  setMapCenter: (position: LatLng) => void;
  setMarkerPosition: (position: LatLng | null) => void;
  deliveryCoordinates: LatLng | null;
}

export function AddressAssistantForm({ setMapCenter, setMarkerPosition, deliveryCoordinates }: AddressAssistantFormProps) {
  const [loading, setLoading] = useState(false);
  const { user, businessData } = useAuth();

  const form = useForm<z.infer<typeof newOrderSchema>>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: { customerName: '', customerPhone: '', deliveryAddress: '', notes: '', amountToCollect: 0 },
  });

  const handleAddressSelect = (address: { description: string, coordinates: LatLng | null }) => {
    form.setValue('deliveryAddress', address.description, { shouldValidate: true });
    setMarkerPosition(address.coordinates);
    if (address.coordinates) {
      setMapCenter(address.coordinates);
    }
  };

  const onSubmit = async (values: z.infer<typeof newOrderSchema>) => {
    if (!user || !businessData) {
      toast.error('Error', { description: 'No se pudieron cargar los datos de tu negocio.' });
      return;
    }
    if (!deliveryCoordinates) {
      toast.error('Error', { description: 'Selecciona una dirección de entrega en el mapa.' });
      return;
    }

    setLoading(true);

    const createOrder = httpsCallable(functions, 'createOrder');

    try {
      const orderPayload = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        deliveryAddress: {
          description: values.deliveryAddress,
          lat: deliveryCoordinates.lat,
          lng: deliveryCoordinates.lng,
        },
        amountToCollect: values.amountToCollect,
        notes: values.notes,
      };

      const result = await createOrder({ orderPayload });

      toast.success('Pedido Creado', { description: `El pedido ha sido enviado. ID: ${(result.data as any).orderId}` });
      form.reset();
      setMarkerPosition(null);
    } catch (error: any) {
      toast.error('Error al crear pedido', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">Detalles del Pedido</h2>
        <FormField control={form.control} name="customerName" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><User size={16}/>Nombre del Cliente</FormLabel><FormControl><Input placeholder="Nombre completo" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="customerPhone" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Phone size={16}/>Teléfono del Cliente</FormLabel><FormControl><Input placeholder="Teléfono a 10 dígitos" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="deliveryAddress" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><MapPin size={16}/>Dirección de Entrega</FormLabel><FormControl><AddressAutocompleteInput defaultValue={field.value} onAddressSelect={handleAddressSelect} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="amountToCollect" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><DollarSign size={16}/>Monto a Cobrar (MXN)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Notebook size={16}/>Notas Adicionales</FormLabel><FormControl><Textarea placeholder="Ej: tocar el timbre, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
        <Button type="submit" disabled={loading} className="w-full btn-gradient">
          {loading ? (<span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</span>) : 'Crear Pedido'}
        </Button>
      </form>
    </Form>
  );
}
