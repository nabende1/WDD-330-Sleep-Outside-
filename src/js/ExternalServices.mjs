// src/js/ExternalServices.mjs
const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

const CATEGORIES = ["tents", "backpacks", "sleepingbags", "hammocks"];

export default class ExternalServices {
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

  // POST an order payload to the server
  async checkout(orderPayload) {
    const url = `${baseURL}checkout`; // final endpoint
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    };
    const res = await fetch(url, options);
    return convertToJson(res);
  }
}
