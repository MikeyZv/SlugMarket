'use server'

import { revalidatePath } from 'next/cache'

// This server action triggers a revalidation of the homepage path. 
// It can be called after actions that modify product listings to ensure that the homepage displays the most up-to-date information.
export async function revalidateListings() {
  revalidatePath('/')
}
