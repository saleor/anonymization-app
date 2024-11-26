import { Box } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { ScrambleAllOrdersByEmail } from "../scramble-orders-by-email";

const IndexPage: NextPage = () => {
  return (
    <Box padding={8}>
      <ScrambleAllOrdersByEmail />
    </Box>
  );
};

export default IndexPage;
