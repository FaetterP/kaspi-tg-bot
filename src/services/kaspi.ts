import axios from "axios";
import { Logger } from "../utils";
import { categoriesRaw } from "./chatGpt";

const instance = axios.create({
  baseURL: "https://kaspi.kz/shop/api",
  headers: { "X-Auth-Token": process.env.KASPI_TOKEN },
});

export interface ProductAttribute {
  code: string;
  type: "boolean" | "enum" | "string" | "number" | string;
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

type GetAttributeValuesResponse = {
  code: string;
  name: string;
}[];

// https://guide.kaspi.kz/partner/ru/shop/api/goods/q3217
export async function getProductAttributes(
  categoryCode: string
): Promise<ProductAttributeResponse> {
  try {
    const response = await instance.get<ProductAttributeResponse>(
      "/products/classification/attributes",
      {
        params: {
          c: categoriesRaw.find((c) => c.title === categoryCode)!.code,
        },
      }
    );

    Logger.debug(response.data, "Get attributes");
    return response.data;
  } catch (error) {
    Logger.error(error, "Error fetching product attributes");
    throw error;
  }
}

// https://guide.kaspi.kz/partner/ru/shop/api/goods/q3219
export async function importProducts(
  products: Product[]
): Promise<ImportProductResponse> {
  Logger.debug({ products }, "Upload to kaspi");
  // return { code: "testcode", status: "teststatus" };
  try {
    const response = await instance.post<ImportProductResponse>(
      "/products/import",
      products,
      { headers: { "Content-Type": "text/plain" } }
    );

    Logger.debug(response.data, "Upload response");
    return response.data;
  } catch (error) {
    Logger.error(error, "Error importing products");
    throw error;
  }
}

// https://guide.kaspi.kz/partner/ru/shop/api/goods/q3218
export async function getAttributeValues(
  category: string,
  attribute: string
): Promise<GetAttributeValuesResponse> {
  Logger.debug({ category, attribute }, "Get values for attribute");
  try {
    const response = await instance.get<GetAttributeValuesResponse>(
      "/products/classification/attribute/values",
      { params: { c: category, a: attribute } }
    );

    Logger.debug(response.data, "Get values response");
    return response.data;
  } catch (error) {
    Logger.error(error, "Error get values");
    throw error;
  }
}
