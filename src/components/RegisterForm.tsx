// src/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { functions } from '@/lib/firebase';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressAutocompleteInput } from '@/components/AddressAutocompleteInput';
import { MapComponent } from '@/app/dashboard/new-order/Map';
import { Loader2, User, Mail, Lock, Building, Phone, MapPin } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { useRouter } from 'next/navigation';

type LatLng = { lat: number; lng: number };
const INITIAL_MAP_CENTER: LatLng = { lat: 19.2433, lng: -103.7250 };

const formSchema = z.object({
  ownerName: z.string().min(2, "Nombre de propietario requerido."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  businessName: z.string().min(2, "Nombre de negocio requerido."),
  businessPhone: z.string().regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos."),
  businessAddress: z.string().min(10, "Dirección de negocio requerida."),
  acceptTerms: z.boolean().refine(val => val, "Debes aceptar los términos y condiciones."),
  acceptPolicy: z.boolean().refine(val => val, "Debes aceptar la política de privacidad."),
});

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(INITIAL_MAP_CENTER);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: "", email: "", password: "", businessName: "",
      businessPhone: "", businessAddress: "", acceptTerms: false, acceptPolicy: false,
    },
  });

  const handleAddressSelect = (address: { description: string, coordinates: LatLng | null }) => {
    form.setValue('businessAddress', address.description, { shouldValidate: true });
    setCoordinates(address.coordinates);
    if (address.coordinates) {
      setMapCenter(address.coordinates);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!coordinates) {
      toast.error("Dirección incompleta", { description: "Por favor, selecciona una dirección válida del mapa." });
      return;
    }
    setLoading(true);

    const registerBusinessUser = httpsCallable(functions, 'registerBusinessUser');

    try {
      const payload = {
        email: values.email,
        password: values.password,
        ownerName: values.ownerName,
        businessName: values.businessName,
        contactPhone: values.businessPhone,
        defaultPickupAddress: {
          description: values.businessAddress,
          lat: coordinates.lat,
          lng: coordinates.lng,
        }
      };

      await registerBusinessUser(payload);

      toast.success('¡Bienvenido!', { description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.' });
      router.push('/login');
    } catch (error: any) {
      toast.error('Error de Registro', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 items-start">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-lg font-bold">Datos del Propietario</h2>
          <FormField control={form.control} name="ownerName" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><User size={16}/>Nombre Completo</FormLabel><FormControl><Input {...field} placeholder="Tu nombre" disabled={loading}/></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Mail size={16}/>Email</FormLabel><FormControl><Input type="email" {...field} placeholder="tu@email.com" disabled={loading}/></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Lock size={16}/>Contraseña</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" disabled={loading}/></FormControl><FormMessage /></FormItem> )} />

          <h2 className="text-lg font-bold pt-4">Datos del Negocio</h2>
          <FormField control={form.control} name="businessName" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Building size={16}/>Nombre del Negocio</FormLabel><FormControl><Input {...field} placeholder="El nombre de tu negocio" disabled={loading}/></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="businessPhone" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Phone size={16}/>Teléfono</FormLabel><FormControl><Input {...field} placeholder="Teléfono a 10 dígitos" disabled={loading}/></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="businessAddress" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><MapPin size={16}/>Dirección de Recogida</FormLabel><FormControl><AddressAutocompleteInput onAddressSelect={handleAddressSelect} defaultValue={field.value} /></FormControl><FormMessage /></FormItem> )} />

          <FormField control={form.control} name="acceptTerms" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading}/></FormControl><div className="space-y-1 leading-none"><FormLabel>Acepto los <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link></FormLabel></div></FormItem> )} />
          <FormField control={form.control} name="acceptPolicy" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading}/></FormControl><div className="space-y-1 leading-none"><FormLabel>He leído y acepto la <Link href="/privacy" className="text-primary hover:underline">política de privacidad</Link></FormLabel></div></FormItem> )} />

          <Button type="submit" className="w-full btn-gradient mt-6" disabled={loading}>
            {loading ? (<span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</span>) : 'Crear Cuenta'}
          </Button>
        </form>
      </FormProvider>
      <div className="md:sticky md:top-10 mt-8 md:mt-0">
        <div className="w-full h-[50vh] md:h-[calc(100vh-80px)] rounded-lg overflow-hidden shadow-2xl glass-card">
          <MapComponent center={mapCenter} markerPosition={coordinates} />
        </div>
      </div>
    </div>
  );
}
