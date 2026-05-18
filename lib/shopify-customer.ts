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

export interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED" | "FAILED";
  createdAt: string;
  nextBillingDate: string | null;
  planName: string;
  quantity: number;
  pricePerPeriod: string;
  currencyCode: string;
  billingInterval: string;
  billingIntervalCount: number;
  discount: {
    title: string;
    percentage?: number;
    fixedAmount?: string;
  } | null;
}

const SUBSCRIPTIONS_QUERY = `#graphql
  query GetSubscriptions {
    customer {
      subscriptionContracts(first: 10) {
        nodes {
          id
          status
          createdAt
          nextBillingDate
          billingPolicy {
            interval
            intervalCount {
              count
              precision
            }
          }
          lines(first: 10) {
            nodes {
              id
              name
              quantity
              currentPrice {
                amount
                currencyCode
              }
            }
          }
          discounts(first: 5) {
            nodes {
              title
              value {
                __typename
                ... on SubscriptionDiscountPercentageValue {
                  percentage
                }
                ... on SubscriptionDiscountFixedAmountValue {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CANCEL_SUBSCRIPTION_MUTATION = `#graphql
  mutation CancelSubscription($subscriptionContractId: ID!) {
    subscriptionContractCancel(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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

async function customerMutation<T>(
  accessToken: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  const res = await fetch(CUSTOMER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("Customer API mutation error:", res.status, text.substring(0, 500));
    return null;
  }

  try {
    const json = JSON.parse(text);
    if (json.errors) {
      console.error("Customer API mutation errors:", json.errors);
      return null;
    }
    return json.data;
  } catch {
    console.error("Customer API mutation returned non-JSON:", text.substring(0, 500));
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

export async function getCustomerSubscriptions(
  accessToken: string
): Promise<Subscription[]> {
  const data = await customerQuery<{
    customer: {
      subscriptionContracts: {
        nodes: {
          id: string;
          status: string;
          createdAt: string;
          nextBillingDate: string | null;
          billingPolicy: {
            interval: string;
            intervalCount: { count: number; precision: string };
          };
          lines: {
            nodes: {
              id: string;
              name: string;
              quantity: number;
              currentPrice: { amount: string; currencyCode: string };
            }[];
          };
          discounts: {
            nodes: {
              title: string;
              value:
                | { __typename: "SubscriptionDiscountPercentageValue"; percentage: number }
                | { __typename: "SubscriptionDiscountFixedAmountValue"; amount: { amount: string; currencyCode: string } };
            }[];
          };
        }[];
      };
    };
  }>(accessToken, SUBSCRIPTIONS_QUERY);

  if (!data?.customer?.subscriptionContracts) return [];

  return data.customer.subscriptionContracts.nodes.map((node) => {
    const line = node.lines.nodes[0];
    const discountNode = node.discounts.nodes[0] ?? null;

    let discount: Subscription["discount"] = null;
    if (discountNode) {
      discount = {
        title: discountNode.title,
        ...(discountNode.value.__typename === "SubscriptionDiscountPercentageValue"
          ? { percentage: discountNode.value.percentage }
          : { fixedAmount: discountNode.value.amount.amount }),
      };
    }

    return {
      id: node.id,
      status: node.status as Subscription["status"],
      createdAt: node.createdAt,
      nextBillingDate: node.nextBillingDate,
      planName: line?.name ?? "Subscription",
      quantity: line?.quantity ?? 0,
      pricePerPeriod: line?.currentPrice.amount ?? "0",
      currencyCode: line?.currentPrice.currencyCode ?? "EUR",
      billingInterval: node.billingPolicy.interval,
      billingIntervalCount: node.billingPolicy.intervalCount.count,
      discount,
    };
  });
}

export async function cancelSubscription(
  accessToken: string,
  subscriptionContractId: string
): Promise<{ success: boolean; error?: string }> {
  const data = await customerMutation<{
    subscriptionContractCancel: {
      contract: { id: string; status: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(accessToken, CANCEL_SUBSCRIPTION_MUTATION, { subscriptionContractId });

  if (!data) {
    return { success: false, error: "Failed to cancel subscription" };
  }

  const { userErrors } = data.subscriptionContractCancel;
  if (userErrors.length > 0) {
    return { success: false, error: userErrors[0].message };
  }

  return { success: true };
}
