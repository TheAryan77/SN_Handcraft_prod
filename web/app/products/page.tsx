import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  let categories = [];
  let products = [];
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${apiUrl}/categories`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/products`, { next: { revalidate: 60 } })
    ]);
    
    const catsData = await catsRes.json();
    const prodsData = await prodsRes.json();
    
    if (catsData.success) categories = catsData.data;
    if (prodsData.success) products = prodsData.data;
  } catch (e) {
    console.error("Failed to load products/categories", e);
  }

  const safeProducts = products.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    categoryId: product.categoryId,
    category: product.category
      ? { id: product.category.id, name: product.category.name }
      : undefined,
    images: product.images?.map((image: any) => ({ id: image.id, url: image.url })) || [],
  }));

  return <ProductsClient categories={categories} products={safeProducts} />;
}
