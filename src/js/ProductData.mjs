const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

// REAL API category slugs
const CATEGORIES = ["tents", "backpacks", "sleepingbags", "hammocks"];

export default class ProductData {
  async getData(category) {
    const res = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(res);
    return Array.isArray(data.Result) ? data.Result : [];
  }

  async findProductById(id) {
    const res = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(res);
    return data.Result || null;
  }

  // 🔍 SEARCH ALL PRODUCTS
  async searchProducts(query) {
    const searchTerm = query.trim().toLowerCase();
    let allProducts = [];

    for (const cat of CATEGORIES) {
      const items = await this.getData(cat);
      allProducts = [...allProducts, ...items];
    }

    return allProducts.filter((item) => {
      const name = item.Name?.toLowerCase() || "";
      const desc = item.DescriptionHtmlSimple?.toLowerCase() || "";
      return name.includes(searchTerm) || desc.includes(searchTerm);
    });
  }
}
