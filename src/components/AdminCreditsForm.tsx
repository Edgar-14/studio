// src/components/AdminCreditsForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { db, functions } from '@/lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  businessId: z.string().min(1, "Debes seleccionar un negocio."),
  amount: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1."),
});

export default function AdminCreditsForm() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      const fetchBusinesses = async () => {
        const querySnapshot = await getDocs(collection(db, "businesses"));
        setBusinesses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchBusinesses();
    }
  }, [authLoading, isAdmin]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const addCredits = httpsCallable(functions, 'addCredits');
      await addCredits({ businessId: values.businessId, amount: values.amount, reason: "Asignación manual por admin" });
      toast.success('Éxito', { description: `Se agregaron ${values.amount} créditos.` });
      form.reset();
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return <div className="p-4 text-center text-destructive">No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg glass-card">
      <h2 className="text-xl font-bold mb-4">Asignar Créditos</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="businessId" render={({ field }) => (
            <FormItem>
              <FormLabel>Negocio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Elige un negocio..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {businesses.map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.businessName} ({business.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl><Input type="number" placeholder="Ej: 100" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full btn-gradient" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </span>
            ) : 'Asignar Créditos'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
