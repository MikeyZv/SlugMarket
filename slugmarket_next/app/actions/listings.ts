'use server'

import { revalidatePath } from 'next/cache'

// This server action triggers a revalidation of the homepage path.
// It can be called after actions that modify product listings to ensure that the homepage displays the most up-to-date information.
// Using the 'layout' type purges the client-side Router Cache, so a client-side
// navigation back to '/' (e.g. router.push after a delete) refetches fresh data
// instead of serving the previously prefetched listings.
export async function revalidateListings() {
  revalidatePath('/', 'layout')
}

export async function revalidateProduct(listingId: string) {
  revalidatePath(`/products/${listingId}`)
}
