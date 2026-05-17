const SHOP_ID = process.env.SHOPIFY_SHOP_ID!;
const CUSTOMER_API_URL = `https://shopify.com/${SHOP_ID}/account/customer/api/2025-04/graphql`;

const CUSTOMER_QUERY = `#graphql
  query GetCustomer {
    customer {
      id
      displayName
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

const ORDERS_QUERY = `#graphql
  query GetOrders {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            fulfillments(first: 1) {
              edges {
                node {
                  status
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface CustomerProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: { amount: string; currencyCode: string };
  fulfillmentStatus: string | null;
}

async function customerQuery<T>(
  accessToken: string,
  query: string
): Promise<T | null> {
  const res = await fetch(CUSTOMER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("Customer API error:", res.status, text.substring(0, 500));
    return null;
  }

  try {
    const json = JSON.parse(text);
    if (json.errors) {
      console.error("Customer API GraphQL errors:", json.errors);
      return null;
    }
    return json.data;
  } catch {
    console.error("Customer API returned non-JSON:", text.substring(0, 500));
    return null;
  }
}

export async function getCustomerProfile(
  accessToken: string
): Promise<CustomerProfile | null> {
  const data = await customerQuery<{
    customer: {
      id: string;
      displayName: string;
      firstName: string;
      lastName: string;
      emailAddress: { emailAddress: string };
    };
  }>(accessToken, CUSTOMER_QUERY);

  if (!data?.customer) return null;

  const c = data.customer;
  return {
    id: c.id,
    displayName: c.displayName,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.emailAddress.emailAddress,
  };
}

export async function getCustomerOrders(
  accessToken: string
): Promise<CustomerOrder[]> {
  const data = await customerQuery<{
    customer: {
      orders: {
        edges: {
          node: {
            id: string;
            name: string;
            processedAt: string;
            totalPrice: { amount: string; currencyCode: string };
            fulfillments: {
              edges: { node: { status: string } }[];
            };
          };
        }[];
      };
    };
  }>(accessToken, ORDERS_QUERY);

  if (!data?.customer?.orders) return [];

  return data.customer.orders.edges.map((edge) => ({
    id: edge.node.id,
    name: edge.node.name,
    processedAt: edge.node.processedAt,
    totalPrice: edge.node.totalPrice,
    fulfillmentStatus:
      edge.node.fulfillments.edges[0]?.node.status ?? null,
  }));
}
