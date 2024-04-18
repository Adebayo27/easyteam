import { IndexTable, Text } from "@shopify/polaris";
import React from "react";

export const Index = ({ product, key }) => {
  return (
    <IndexTable.Row key={key}>
      <IndexTable.Cell>{product.name}</IndexTable.Cell>
      <IndexTable.Cell>{product.price}</IndexTable.Cell>
      <IndexTable.Cell>{product.commission}</IndexTable.Cell>
      <IndexTable.Cell>
        {product.price * (product.commission / 100)}
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

export default Index;
