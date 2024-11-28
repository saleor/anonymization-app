import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { v4 as uuidv4 } from "uuid";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import gql from "graphql-tag";
import { useState } from "react";
import { CountryCode, useOrderUpdateMutation, useUserByEmailQuery, useCustomerDeleteMutation } from "../generated/graphql";
import { Box, Input, Button, Text } from "@saleor/macaw-ui";

/**
 * Query to fetch all orders by email.
 */
gql`
  query UserByEmail($email: String!) {
    user(email: $email) {
      id
      firstName
      lastName
      email
      orders(first: 100) {
        edges {
          node {
            id
            number
            shippingAddress {
              firstName
              lastName
              phone
              country {
                country
                code
              }
              countryArea
              city
              postalCode
              streetAddress1
            }
            billingAddress {
              firstName
              lastName
              phone
              city
              postalCode
              streetAddress1
              country {
                country
                code
              }
              countryArea
            }
          }
        }
      }
    }
  }
`;

/**
 * Mutation to update order details (name and address).
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

/**
 * Mutation to delete a customer by ID or external reference.
 */
gql`
  mutation CustomerDelete($id: ID, $externalReference: String) {
    customerDelete(id: $id, externalReference: $externalReference) {
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
      }
    }
  }
`;

export const scrambleDetails = ({ firstName, lastName, phone }: { firstName: string; lastName: string; phone?: string | null | undefined }) => {
  const scrambledFirstName = "";
  const scrambledLastName = "";
  const scrambledPhone =  "5551234567";
  
  return { scrambledFirstName, scrambledLastName, scrambledPhone };
};

/**
 * Function to scramble user details including email
 */
export function scrambleUserDetails(originalEmail: string): { firstName: string; lastName: string; email: string } {
  const domain = process.env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN || "example.com";
  const sharedUuid = uuidv4(); // Generate a shared UUID for the order
  const scrambledEmail = `${sharedUuid}@${domain}`; // Construct anonymized email

  return {
    firstName:"",
    lastName: "",
    email: scrambledEmail,
  };
}

export const ScrambleAllOrdersByEmail = () => {
  const { appBridge } = useAppBridge();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [scrambling, setScrambling] = useState(false);

  const [{ data, fetching, error }, refetchOrders] = useUserByEmailQuery({
    pause: true,
    variables: { email: email },
  });

  const [{ fetching: updating }, updateOrder] = useOrderUpdateMutation();

  const [{ fetching: deleting }, deleteCustomer] = useCustomerDeleteMutation();

  const handleFetchOrders = async () => {
    setMessage("");
    refetchOrders();
  };

  const handleScrambleAndUpdate = async () => {
    const user = data?.user;

    if (!user) {
      throw Error("No user");
    }

    const userOrders = user.orders?.edges ?? [];
    if (!userOrders.length) {
      setMessage("This user has no orders.");
      return;
    }

    

    setScrambling(true);
    const errors = [];

    const scrambledUser = scrambleUserDetails(user.email);

    for (const { node: order } of userOrders) {
      if (!order) {
        continue;
      }

      const billingCountryCode = order.billingAddress?.country.code as CountryCode | undefined;
      const shippingCountryCode = order.shippingAddress?.country.code as CountryCode | undefined;

      const scrambledBillingAddress = order.billingAddress
        ? {
            firstName: scrambleDetails({
              firstName: order.billingAddress.firstName,
              lastName: order.billingAddress.lastName,
              phone: order.billingAddress.phone,
            }).scrambledFirstName,
            lastName: scrambleDetails({
              firstName: order.billingAddress.firstName,
              lastName: order.billingAddress.lastName,
              phone: order.billingAddress.phone,
            }).scrambledLastName,
            phone: scrambleDetails({
              firstName: order.billingAddress.firstName,
              lastName: order.billingAddress.lastName,
              phone: order.billingAddress.phone,
            }).scrambledPhone,
            city: order.billingAddress.city,
            postalCode: order.billingAddress.postalCode,
            streetAddress1: order.billingAddress.streetAddress1,
            country: billingCountryCode,
            countryArea: order.billingAddress?.countryArea,
          }
        : null;

      const scrambledShippingAddress = order.shippingAddress
        ? {
            firstName: scrambleDetails({
              firstName: order.shippingAddress.firstName,
              lastName: order.shippingAddress.lastName,
              phone: order.shippingAddress.phone,
            }).scrambledFirstName,
            lastName: scrambleDetails({
              firstName: order.shippingAddress.firstName,
              lastName: order.shippingAddress.lastName,
              phone: order.shippingAddress.phone,
            }).scrambledLastName,
            phone: scrambleDetails({
              firstName: order.shippingAddress.firstName,
              lastName: order.shippingAddress.lastName,
              phone: order.shippingAddress.phone,
            }).scrambledPhone,
            city: order.shippingAddress.city,
            postalCode: order.shippingAddress.postalCode,
            streetAddress1: order.shippingAddress.streetAddress1,
            country: shippingCountryCode,
            countryArea: order.shippingAddress.countryArea,
            }
        : null;

      const { data: updateData, error: updateError } = await updateOrder({
        id: order.id,
        input: {
          userEmail: scrambledUser.email,
          billingAddress: scrambledBillingAddress,
          shippingAddress: scrambledShippingAddress,
        },
      });

      if (updateError || updateData?.orderUpdate?.errors?.length) {
        console.log(scrambledUser.email);
        console.log(updateError, updateData?.orderUpdate?.errors);
        errors.push(`Failed to update order #${order.number}`);
      }
    }

    if (!errors.length) {
      try {
        const { data: deleteData, error: deleteError } = await deleteCustomer({
          id: user.id,
        });
  
        if (deleteError || deleteData?.customerDelete?.errors?.length) {
          errors.push("Failed to delete the user.");
        }
      } catch (err) {
        errors.push("Unexpected error during user deletion.");
      }
    }

    setScrambling(false);

    if (errors.length) {
      setMessage(errors.join("\n"));
    } else {
      setMessage("All orders were successfully anonymized and user deleted.");
    }
  };

  const orders = data?.user?.orders?.edges;

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Text as="h2" size={8}>
        Scramble All Orders by Email
      </Text>

      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter customer email"
        disabled={fetching || scrambling}
      />
      <Button onClick={handleFetchOrders} disabled={!email || fetching || scrambling}>
        Fetch User and Orders
      </Button>

      {fetching && <Text>Loading user and orders...</Text>}
      {error && <Text>Failed to fetch user. Please check the email and try again.</Text>}

      {orders?.length ? (
        <Box>
          <Text>{`Found ${orders.length} orders for email: ${email}`}</Text>
          <ul>
            {orders.map(({ node }) => (
              <li key={node.id}>
                <Text>{`Order #${node.number}`}</Text>
              </li>
            ))}
          </ul>
          <Button onClick={handleScrambleAndUpdate} disabled={scrambling || updating}>
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