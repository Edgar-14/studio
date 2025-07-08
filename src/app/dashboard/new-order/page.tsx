// src/app/dashboard/new-order/page.tsx
'use client'

import { AddressAssistantForm } from "./AddressAssistantForm"
import { MapComponent } from "./Map";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

type LatLng = { lat: number; lng: number };

export default function NewOrderPage() {
  const { user, loading: authLoading, businessData } = useAuth();
  const router = useRouter();

  const [mapCenter, setMapCenter] = useState<LatLng>(businessData?.defaultPickupAddress || { lat: 19.2433, lng: -103.7250 });
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!businessData || !businessData.defaultPickupAddress) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="max-w-lg text-center p-8 border rounded-lg shadow-md glass-card">
          <h2 className="text-xl font-bold text-destructive mb-4">Configuración Incompleta</h2>
          <p className="text-foreground mb-4">Para crear pedidos, tu negocio debe tener una dirección de recogida.</p>
          <Button onClick={() => router.push('/dashboard/settings')} className="btn-gradient mt-4">Ir a Configuración</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-4 md:p-8">
      <div className="space-y-6">
        <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Crear Nuevo Pedido</h1>
            <p className="text-muted-foreground">
              Tu punto de recogida: <span className="font-semibold">{businessData.defaultPickupAddress.description}</span>
            </p>
        </div>
        <AddressAssistantForm
          setMapCenter={setMapCenter}
          setMarkerPosition={setMarkerPosition}
          deliveryCoordinates={markerPosition}
        />
      </div>
      <div className="mt-8 md:mt-0 md:sticky top-24">
        <div className="w-full h-[60vh] md:h-[80vh] max-h-[700px] rounded-lg overflow-hidden shadow-2xl glass-card">
          <MapComponent center={mapCenter} markerPosition={markerPosition} />
        </div>
      </div>
    </div>
  )
}
