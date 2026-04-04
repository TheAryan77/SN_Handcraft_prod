"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";


export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  if (!name) return { error: "Name is required" };

  try {
    const session = await getServerSession();
    const token = (session as any)?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

    const res = await fetch(`${apiUrl}/categories`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ name, slug })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    revalidatePath("/admin");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const categoryId = formData.get("categoryId") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (!name || !description || isNaN(price) || isNaN(stock) || !categoryId) {
    return { error: "All fields are required" };
  }

  try {
    const session = await getServerSession();
    const token = (session as any)?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

    const res = await fetch(`${apiUrl}/products`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        slug,
        description,
        price,
        stock,
        categoryId,
        images: ["/image.png"]
      })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    revalidatePath("/admin");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
