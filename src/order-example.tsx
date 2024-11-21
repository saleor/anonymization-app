import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text, Button, Input } from "@saleor/macaw-ui";
import gql from "graphql-tag";
import { useState } from "react";
import { useOrdersByEmailQuery, useOrderUpdateMutation } from "../generated/graphql";

/**
 * Query to fetch all orders by email.
 */
gql`
  query OrdersByEmail($filter: OrderFilterInput!) {
    orders(filter: $filter, first: 100) {
      edges {
        node {
          id
          number
          user {
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

/**
 * Mutation to update order details (name and email).
 */
gql`
  mutation OrderUpdate($id: ID!, $input: OrderUpdateInput!) {
    orderUpdate(id: $id, input: $input) {
      order {
        id
        user {
          email
          firstName
          lastName
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export const ScrambleAllOrdersByEmail = () => {
  const { appBridge } = useAppBridge();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [scrambling, setScrambling] = useState(false);

  const [{ data, fetching, error }, refetchOrders] = useOrdersByEmailQuery({
    pause: true,
    variables: { filter: { userEmail: email } },
  });

  const [{ fetching: updating }, updateOrder] = useOrderUpdateMutation();

  const scrambleDetails = (email: string, firstName: string, lastName: string) => {
    const scrambledEmail = `anonymous${Math.floor(Math.random() * 10000)}@example.com`;
    const scrambledFirstName = `Anon`;
    const scrambledLastName = `${Math.random().toString(36).substring(2, 8)}`;
    return { scrambledEmail, scrambledFirstName, scrambledLastName };
  };

  const handleFetchOrders = async () => {
    setMessage("");
    refetchOrders();
  };

  const handleScrambleAndUpdate = async () => {
    if (!data?.orders?.edges?.length) {
      setMessage("No orders found for this email.");
      return;
    }

    setScrambling(true);
    const errors = [];

    for (const { node: order } of data.orders.edges) {
      const { scrambledEmail, scrambledFirstName, scrambledLastName } = scrambleDetails(
        order.user.email,
        order.user.firstName,
        order.user.lastName
      );

      const { data: updateData, error: updateError } = await updateOrder({
        id: order.id,
        input: {
          user: {
            email: scrambledEmail,
            firstName: scrambledFirstName,
            lastName: scrambledLastName,
          },
        },
      });

      if (updateError || updateData?.orderUpdate?.errors?.length) {
        errors.push(`Failed to update order #${order.number}`);
      }
    }

    setScrambling(false);

    if (errors.length) {
      setMessage(errors.join("\n"));
    } else {
      setMessage("All orders were successfully anonymized.");
    }
  };

  const orders = data?.orders?.edges;

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Text as="h2" size={8}>
        Scramble All Orders by Email
      </Text>

      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter customer email"
      />
      <Button onClick={handleFetchOrders} disabled={!email || fetching}>
        Fetch Orders
      </Button>

      {fetching && <Text>Loading orders...</Text>}
      {error && <Text color="error">Failed to fetch orders.</Text>}

      {orders?.length ? (
        <Box>
          <Text>{`Found ${orders.length} orders for email: ${email}`}</Text>
          <ul>
            {orders.map(({ node }) => (
              <li key={node.id}>
                <Text>{`Order #${node.number} (${node.user.firstName} ${node.user.lastName})`}</Text>
              </li>
            ))}
          </ul>
          <Button onClick={handleScrambleAndUpdate} disabled={scrambling}>
            Scramble and Update All Orders
          </Button>
        </Box>
      ) : (
        !fetching && <Text>No orders found for this email.</Text>
      )}

      {message && <Text>{message}</Text>}
    </Box>
  );
};