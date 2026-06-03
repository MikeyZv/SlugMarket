import { supabase } from "./supabase"

export async function uploadLocals(files: File[], userId: string): Promise<string[]> {
    if (files.length === 0) return []
    return Promise.all(
        files.map(async (file) => {
            const ext = file.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
            const { error } = await supabase.storage.from("listing-images").upload(fileName, file)
            if (error) throw new Error(error.message)
            const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(fileName)
            return publicUrl
        })
    )
}
