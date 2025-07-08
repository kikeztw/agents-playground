import 'dotenv/config'
import * as z from "zod/v3";
import { tool } from '@openai/agents';

const productsDB = [
  { name: "Camiseta Azul", price: 25.99, in_stock: "available", retailer_id: "SKU12345" },
  { name: "Pantalón Negro", price: 49.99, in_stock: "not available", retailer_id: "SKU67890" },
  { name: "Zapatos Deportivos", price: 89.99, in_stock: "available", retailer_id: "SKU11223" },
  { name: "Chaqueta Roja", price: 120.00, in_stock: "available", retailer_id: "SKU33445" },
  { name: "Gorra Blanca", price: 15.50, in_stock: "not available", retailer_id: "SKU55667" },
  { name: "Calcetines", price: 5.99, in_stock: "available", retailer_id: "SKU77889" },
  { name: "Bufanda Gris", price: 19.99, in_stock: "available", retailer_id: "SKU99001" },
  { name: "Cinturón de Cuero", price: 35.00, in_stock: "not available", retailer_id: "SKU22334" },
  { name: "Vestido Verde", price: 75.00, in_stock: "available", retailer_id: "SKU44556" },
  { name: "Camisa Blanca", price: 40.00, in_stock: "available", retailer_id: "SKU66778" },
];

export const search_products = tool({
  name: 'search_products',
  description: `
     tool retrieves a list of products based on specific filters such as name, stock availability, SKU, or price. This tool is designed to provide precise product information before any action, such as adding a product to the cart.

      Purpose:

      - Search for product information based on various criteria.
      - Verify product availability (stock status) before adding it to the cart.
      - Retrieve product details such as price, name, or SKU.
      - Filter products by price and comparison type (greater than, less than, or equal to a threshold).

      Key Use Cases:

      1. Check Availability:
        - Confirm if a product is in stock before proceeding with further actions.
      2. Search by SKU:
        - Identify products using their unique SKU (especially when the product name is a number, hexadecimal code, or hash-like text).
      3. Price Filtering:
        - Find products based on price conditions (e.g., above or below a specific value).
      4. Retrieve Product Details:
        - Get the name, price, and stock status of a product.

      Behavioral Instructions:

      1. If the user provides a product name that consists only of numbers, hexadecimal codes, or hash-like text, treat it as an SKU instead of a name. For example:
        - Input: "Do you have product 2249?"
          - Treat "2249" as the SKU.
        - Input: "Do you have product isk7r5odzj?"
          - Treat "isk7r5odzj" as the SKU.

      2. Always ensure you retrieve accurate product information before proceeding with actions like adding to the cart.

      Example Scenarios:
    
      1. Search by SKU:
        - Input: "Do you have product 12345?"
        - Action: Treat "12345" as the SKU and search for the product.

      2. Filter by Price:
        - Input: "Show me products cheaper than $50."
        - Action: Use "price: 50" and "comparison_type: less_than" to filter the results.

      3. Check Stock Status:
        - Input: "Is the product ABC123 in stock?"
        - Action: Use "sku: ABC123" and "in_stock: available" to confirm availability.

      4. Search by Name:
        - Input: "Do you have the product 'Blue T-Shirt'?"
        - Action: Use "name: Blue T-Shirt" to find the product.

      Output Expectations:
      - A list of products matching the given filters, including their name, stock status, price, and retailer_id ( SKU = retailer_id ).
      - If no products match the filters, return an empty list or a message indicating no results were found.
  `,
  parameters: z.object({ 
    name: z.string().describe('Name of the product to search for.'),
    price: z.number().nullable().describe('The price value used as the threshold for comparison.'),
    in_stock: z.string().nullable().describe("Stock availability. Accepted values: 'available' or 'not available'."),
    comparison_type: z.enum(['greater_than', 'less_than', 'equal_to']),
    sku: z.string().nullable().describe('SKU of the product to search for. This is a unique identifier for the product.'),
  }),
  execute: async (input): Promise<Record<string, unknown>> => {
    let results = productsDB;

    // Filtrar por SKU si está presente
    if (input.sku) {
      results = results.filter(p => p.retailer_id.toLowerCase() === input.sku!.toLowerCase());
    } else if (input.name) {
      // Filtrar por nombre (case-insensitive, incluye coincidencias parciales)
      results = results.filter(p => p.name.toLowerCase().includes(input.name.toLowerCase()));
    }

    // Filtrar por disponibilidad en stock si está presente
    if (input.in_stock) {
      results = results.filter(p => p.in_stock === input.in_stock);
    }

    // Filtrar por precio si está presente
    if (input.price !== null && input.price !== undefined) {
      if (input.comparison_type === 'greater_than') {
        results = results.filter(p => p.price > input.price!);
      } else if (input.comparison_type === 'less_than') {
        results = results.filter(p => p.price < input.price!);
      } else if (input.comparison_type === 'equal_to') {
        results = results.filter(p => p.price === input.price!);
      }
    }

    return {
      products: results
    };
  },
});