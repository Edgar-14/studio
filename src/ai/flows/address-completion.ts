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
  address: z.string().describe('The address to validate and auto-complete.'),
});
export type AddressCompletionInput = z.infer<typeof AddressCompletionInputSchema>;

const AddressCompletionOutputSchema = z.object({
  validatedAddress: z.string().describe('The validated and auto-completed address.'),
  confidenceLevel: z.number().describe('A confidence level (0-1) indicating the accuracy of the completion.'),
});
export type AddressCompletionOutput = z.infer<typeof AddressCompletionOutputSchema>;

export async function addressCompletion(input: AddressCompletionInput): Promise<AddressCompletionOutput> {
  return addressCompletionFlow(input);
}

const getAddressDetails = ai.defineTool({
  name: 'getAddressDetails',
  description: 'Retrieves detailed information about an address using Google Maps.',
  inputSchema: z.object({
    address: z.string().describe('The address to retrieve details for.'),
  }),
  outputSchema: z.object({
    formattedAddress: z.string().describe('The fully formatted address.'),
    latitude: z.number().describe('The latitude of the address.'),
    longitude: z.number().describe('The longitude of the address.'),
  }),
}, async (input) => {
  // Placeholder implementation for retrieving address details from Google Maps.
  // In a real application, this would call the Google Maps API.
  // This mock implementation simply returns the input address with some mock coordinates.
  return {
    formattedAddress: `Mock: ${input.address}`,
    latitude: 34.052235, // Mock latitude for Los Angeles
    longitude: -118.243683, // Mock longitude for Los Angeles
  };
});

const addressCompletionPrompt = ai.definePrompt({
  name: 'addressCompletionPrompt',
  tools: [getAddressDetails],
  input: {schema: AddressCompletionInputSchema},
  output: {schema: AddressCompletionOutputSchema},
  prompt: `You are an AI assistant designed to validate and auto-complete addresses.

  The user will provide an address, and you should use the getAddressDetails tool to retrieve detailed information about the address.

  Based on the information retrieved, validate and auto-complete the address, providing a confidence level (0-1) indicating the accuracy of the completion.

  Address provided by user: {{{address}}}

  If the address is not valid, return a validatedAddress that is empty.
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
