const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-04";
const CUSTOMER_API_URL = `https://${SHOP_DOMAIN}/account/customer/api/${API_VERSION}/graphql`;

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
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error("Customer API error:", res.status, await res.text());
    return null;
  }

  const json = await res.json();
  if (json.errors) {
    console.error("Customer API GraphQL errors:", json.errors);
    return null;
  }

  return json.data;
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
