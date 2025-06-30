'use server';

/**
 * @fileOverview AI-powered Address Completion tool.
 *
 * - addressCompletion - A function that handles the address completion process.
 * - AddressCompletionInput - The input type for the addressCompletion function.
 * - AddressCompletionOutput - The return type for the addressCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddressCompletionInputSchema = z.object({
  address: z.string().describe('La dirección a validar y autocompletar.'),
});
export type AddressCompletionInput = z.infer<typeof AddressCompletionInputSchema>;

const AddressCompletionOutputSchema = z.object({
  validatedAddress: z.string().describe('La dirección validada y autocompletada.'),
  confidenceLevel: z.number().describe('Un nivel de confianza (0-1) que indica la precisión de la finalización.'),
  latitude: z.number().optional().describe('La latitud de la dirección validada.'),
  longitude: z.number().optional().describe('La longitud de la dirección validada.'),
});
export type AddressCompletionOutput = z.infer<typeof AddressCompletionOutputSchema>;

export async function addressCompletion(input: AddressCompletionInput): Promise<AddressCompletionOutput> {
  return addressCompletionFlow(input);
}

const getAddressDetails = ai.defineTool({
  name: 'getAddressDetails',
  description: 'Recupera información detallada sobre una dirección usando Google Maps.',
  inputSchema: z.object({
    address: z.string().describe('La dirección para la cual recuperar detalles.'),
  }),
  outputSchema: z.object({
    formattedAddress: z.string().describe('La dirección completamente formateada.'),
    latitude: z.number().describe('La latitud de la dirección.'),
    longitude: z.number().describe('La longitud de la dirección.'),
  }),
}, async (input) => {
  // Implementación de marcador de posición para recuperar detalles de la dirección de Google Maps.
  // En una aplicación real, esto llamaría a la API de Google Maps.
  // Esta implementación simulada simplemente devuelve la dirección de entrada con algunas coordenadas simuladas.
  return {
    formattedAddress: `Simulado: ${input.address}`,
    latitude: 34.052235, // Latitud simulada para Los Ángeles
    longitude: -118.243683, // Longitud simulada para Los Ángeles
  };
});

const addressCompletionPrompt = ai.definePrompt({
  name: 'addressCompletionPrompt',
  tools: [getAddressDetails],
  input: {schema: AddressCompletionInputSchema},
  output: {schema: AddressCompletionOutputSchema},
  prompt: `Eres un asistente de IA diseñado para validar y autocompletar direcciones.

  El usuario proporcionará una dirección y debes usar la herramienta getAddressDetails para recuperar información detallada sobre la dirección.

  Basado en la información recuperada, valida y autocompleta la dirección. Proporciona un nivel de confianza (0-1) que indique la precisión de la finalización.

  Incluye la latitud y longitud obtenidas de la herramienta getAddressDetails en la respuesta final.

  Dirección proporcionada por el usuario: {{{address}}}

  Si la dirección no es válida, devuelve un validatedAddress que esté vacío.
  `,
});

const addressCompletionFlow = ai.defineFlow(
  {
    name: 'addressCompletionFlow',
    inputSchema: AddressCompletionInputSchema,
    outputSchema: AddressCompletionOutputSchema,
  },
  async input => {
    const {output} = await addressCompletionPrompt(input);
    return output!;
  }
);
