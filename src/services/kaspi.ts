import axios from "axios";
import { Logger } from "../utils";

const instance = axios.create({
  baseURL: "https://kaspi.kz/shop/api",
  headers: { "X-Auth-Token": process.env.KASPI_TOKEN },
});

interface ProductAttribute {
  code: string;
  type: "boolean" | "enum" | "string" | "number";
  multiValued: boolean;
  mandatory: boolean;
}

interface ProductAttributeResponse extends Array<ProductAttribute> {}

export interface Product {
  sku: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  attributes: {
    code: string;
    value: string;
  }[];
  images: {
    url: string;
  }[];
}

interface ImportProductResponse {
  code: string;
  status: string;
}

// https://guide.kaspi.kz/partner/ru/shop/api/goods/q3217
export async function getProductAttributes(
  categoryCode: string
): Promise<ProductAttributeResponse> {
  try {
    const response = await instance.get<ProductAttributeResponse>(
      "/products/classification/attributes",
      {
        params: {
          c: categoryCode,
        },
      }
    );
    return response.data;
  } catch (error) {
    Logger.error(error, "Error fetching product attributes");
    throw error;
  }
}

// https://guide.kaspi.kz/partner/ru/shop/api/goods/q3219
export async function importProducts(
  products: Product[],
): Promise<ImportProductResponse> {
  try {
    const response = await instance.post<ImportProductResponse>(
      "/products/import",
      products,
      { headers: { "Content-Type": "text/plain" } }
    );
    return response.data;
  } catch (error) {
    Logger.error(error, "Error importing products");
    throw error;
  }
}
