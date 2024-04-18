"use client";

import {
  IndexTable,
  Card as LegacyCard,
  useIndexResourceState,
  Text,
  TextField,
  BlockStack,
  Collapsible,
  Button,
  Form,
  FormLayout,
  DatePicker,
  AppProvider,
  IndexFilters,
  useBreakpoints,
  RangeSlider,
  ChoiceList,
  useSetIndexFiltersMode,
  Badge,
  Select,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { baseUrl } from "../../../utils/baseUrl";
import Filter from "../../components/filter/Index";
import Modal from "../../components/modal/Index";
import Order from "../../components/order/Index";
import Table from "../../components/table/Index";

import "../../css/modify.css";

export const Index = () => {
  const [products, setProducts] = useState([]);
  const [commission, setCommission] = useState(0);
  const [staffMember, setStaffMember] = useState("");
  const [date, setDate] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [applyCommissionAll, setApplyCommissionAll] = useState(0);
  const [filterProducts, setFilterProducts] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [active, setActive] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("today");

  const handleSelectChange = useCallback(
    (value) => setSelectedStaff(value),
    []
  );

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();
      setProducts(data?.product);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${baseUrl}/orders`);
      const data = await response.json();
      setOrders(data?.orders);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };
  const fetchStaffs = async () => {
    try {
      const response = await fetch(`${baseUrl}/staffs`);
      const data = await response.json();
      const users = data?.users;
      const options = [];
      users.map((e) => {
        let option = {
          label: `${e?.firstName}  ${e?.lastName}`,
          value: `${e?.id}`,
        };
        options.push(option);
      });
      console.log(options);
      setStaffs(options);
    } catch (error) {
      console.error("Error fetching staffs", error);
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchStaffs();
  }, []);

  //function to filter products
  const filterProductsData = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(filterProducts.toLowerCase());
      const categoryMatch = product.category
        .toLowerCase()
        .includes(filterProducts.toLowerCase());
      return filterProducts ? nameMatch || categoryMatch : true;
    });
  }, [filterProducts, products]);

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  let { selectedResources, handleSelectionChange, clearSelection } =
    useIndexResourceState(products, {
      resourceName: resourceName.plural,
    });

  const handleBulkActionCommission = async () => {
    try {
      const selectedProductIds = selectedResources;
      const data = {
        commission: commission || applyCommissionAll,
        productIds: selectedProductIds,
      };

      fetch(`${baseUrl}/commission/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          setApplyCommissionAll("");
          handleSelectionChange([]);
          clearSelection();
          fetchProducts();
          setTimeout(() => {
            alert("Commission updated successfully");
          }, 1000);
        })
        .catch((error) => {});
    } catch (error) {}
  };

  const handleBulkActionDelete = async () => {
    try {
      const selectedProductIds = selectedResources;
      const data = {
        productIds: selectedProductIds,
      };

      fetch(`${baseUrl}/product/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          fetchProducts();
        })
        .catch((error) => {});
    } catch (error) {}
  };

  const filterOrderByCommissionHandler = async () => {
    try {
      setLoading(true);
      if (date === "") {
        setLoading(false);
        alert("Please select a date");
      }
      const data = {
        userId: Number(selectedStaff),
        startDate: new Date(date.start).toISOString(),
        endDate: new Date(date.end).toISOString(),
      };
      fetch(`${baseUrl}/commission/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          setResult(data);
          setLoading(false);
          handleSelectionChange([]);
          // fetchProducts();
        })
        .catch((error) => {
          setLoading(false);
          setError(error.message);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const staffOrderHandler = async () => {
    try {
      const selectedProductIds = selectedResources;
      const data = {
        staffMember: staffMember,
        products: selectedProductIds,
      };

      fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          setActive(false);
          setStaffMember("");
          setApplyCommissionAll("");
          clearSelection();

          setTimeout(() => {
            alert("Order created successfully");
          }, 1000);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleCommissionChange = (productId, value) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          setCommission(value);
          return { ...product, commission: value };
        }
        return product;
      });
    });
  };

  const addProductHandler = async () => {
    try {
      const data = {
        name: name,
        category: category,
        price: price,
        commissionPercentage: commissionPercentage,
      };

      fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          setActive(false);
          setName("");
          setCategory("");
          setPrice("");
          setCommissionPercentage("");
          setProductModal(false);
          fetchProducts();
          setTimeout(() => {
            alert(data.message);
          }, 1000);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const updateProduct = async ({ id, name, category, price, commission }) => {
    try {
      const data = {
        name: name,
        category: category,
        price: price,
        commission: commission,
      };

      fetch(`${baseUrl}/product/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const handleSubmit = () => {};

  const [itemStrings, setItemStrings] = useState([
    `Included ${selectedResources.length} `,
    `Not Included`,
  ]);

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
  }));
  const [selected, setSelected] = useState(0);
  const onCreateNewView = async (value) => {
    setStaffMember(value);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const sortOptions = [
    { label: "Newest update", value: "order asc" },
    { label: "Oldest update", value: "order desc" },
  ];
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const [accountStatus, setAccountStatus] = useState(undefined);
  const [moneySpent, setMoneySpent] = useState(undefined);
  const [taggedWith, setTaggedWith] = useState("");

  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    []
  );
  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    []
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    []
  );
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    []
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    []
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  const filters = [
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Not invited", value: "not invited" },
            { label: "Invited", value: "invited" },
            { label: "Declined", value: "declined" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  const rowMarkup = filterProductsData.map(
    ({ id, name, price, category, commission }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text as="span">{name}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span">{category}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span">$ {price}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="flex flex-end">
            <span className="w-5 mr-10">
              <TextField className="width-50" placeholder="%" disabled />
            </span>
            <span className="w-10">
              <TextField
                type="number"
                value={commission || 0}
                onChange={(value) => handleCommissionChange(id, value)}
                autoComplete="off"
                onBlur={(e) => {
                  updateProduct({
                    id,
                    name,
                    category,
                    price,
                    commission: e.target.value,
                  });
                }}
              />
            </span>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <AppProvider i18n={enTranslations}>
      <Modal
        title="Add Staff Order"
        content="Save"
        active={active}
        setActive={setActive}
        actionHandler={staffOrderHandler}
        staffMember={staffMember}
        setStaffMember={setStaffMember}
      >
        <TextField
          label="Staff name"
          value={staffMember}
          onChange={(value) => setStaffMember(value)}
          autoComplete="off"
        />
      </Modal>
      <Modal
        title="Add Product"
        content="Save Product"
        active={productModal}
        setActive={setProductModal}
        actionHandler={addProductHandler}
      >
        <div>
          <div className="mb-10">
            <TextField
              label="Product name"
              value={name}
              onChange={(value) => setName(value)}
              autoComplete="off"
            />
          </div>
          <div className="mb-10">
            <TextField
              label="category"
              value={category}
              onChange={(value) => setCategory(value)}
              autoComplete="off"
            />
          </div>
          <div className="mb-10">
            <TextField
              label="price"
              value={price}
              onChange={(value) => setPrice(value)}
              autoComplete="off"
            />
          </div>
        </div>
      </Modal>
      <BlockStack vertical="true">
        <div className="flex">
          <div className="mr-10">
            <Button
              onClick={handleToggle}
              ariaExpanded={open}
              ariaControls="basic-collapsible"
            >
              Filter by date and staff member
            </Button>
          </div>
          <Text as={"span"}>Order Total : {orders.length}</Text>
        </div>

        <Collapsible
          open={open}
          id="basic-collapsible"
          transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
          expandOnPrint
        >
          {result && (
            <BlockStack>
              {" "}
              <Text>
                Total commission Base on Orders: {result.totalCommission}
              </Text>{" "}
            </BlockStack>
          )}
          {result && result?.orders?.length > 0 && (
            <span>
              Orders for {`${result.user?.firstName} ${result.user?.lastName}`}{" "}
              | Total: {result.orders.length}
              <IndexTable
                itemCount={result.orders.length}
                headings={[
                  { title: "Name" },
                  { title: "Price" },
                  { title: "Commission" },
                  { title: "Total" },
                ]}
              >
                {result.orders.map((order, index) => {
                  return order?.Product && <Order key={index} product={order.Product} />;
                })}
              </IndexTable>
              <div style={{ height: "20px" }}></div>
              <IndexTable
                itemCount={Object.keys(result.earningsByDate).length}
                headings={[
                  { title: "Day" },
                  { title: "Earnings" },
                  { title: "SalesCount" },
                ]}
              >
                {Object.keys(result.earningsByDate).map((day, index) => {
                  const data = result.earningsByDate[day];
                  return (
                    <IndexTable.Row key={index}>
                      <IndexTable.Cell>{day}</IndexTable.Cell>
                      <IndexTable.Cell>{data.earnings}</IndexTable.Cell>
                      <IndexTable.Cell>{data.salesCount}</IndexTable.Cell>
                    </IndexTable.Row>
                  );
                })}
              </IndexTable>
            </span>
          )}
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <Select
                label="Staffs"
                options={staffs}
                onChange={handleSelectChange}
                value={selectedStaff}
              />

              <DatePicker
                month={new Date().getMonth()}
                year={new Date().getFullYear()}
                onChange={(value) => setDate(value)}
                selected={date}
                onMonthChange={handleMonthChange}
                allowRange
              />

              <Button onClick={filterOrderByCommissionHandler}>
                {loading ? "Loading..." : "Simulate"}
              </Button>
            </FormLayout>
          </Form>
        </Collapsible>
      </BlockStack>
      <LegacyCard>
        {products.length > 0 ? (
          <div>
            <div className="flex-end mt-10 mb-10">
              <span className="w-5 mr-10 ">
                <TextField className="width-50" placeholder="%" disabled />
              </span>
              <span className="width-20 mr-10">
                <TextField
                  placeholder="set commission for products"
                  type="number"
                  value={applyCommissionAll}
                  onChange={(value) => setApplyCommissionAll(value)}
                />
              </span>
              <span className="mr-10">
                <Button
                  variant="secondary"
                  onClick={handleBulkActionCommission}
                >
                  Apply to selected products
                </Button>
              </span>
              {selectedResources.length > 0 && (
                <span>
                  <Button
                    variant="secondary"
                    tone="critical"
                    onClick={handleBulkActionDelete}
                  >
                    Delete product
                  </Button>
                </span>
              )}
            </div>
            <div>
              <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                queryValue={filterProducts}
                queryPlaceholder="filter products by name or category"
                onQueryChange={setFilterProducts}
                onQueryClear={() => setQueryValue("")}
                onSort={setSortSelected}
                cancelAction={{
                  onAction: onHandleCancel,
                  disabled: false,
                  loading: false,
                }}
                tabs={tabs}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView
                onCreateNewView={onCreateNewView}
                filters={filters}
                onClearAll={handleFiltersClearAll}
                mode={mode}
                setMode={setMode}
              />
              <Table
                selectedRows={selectedResources}
                onSelectionChange={handleSelectionChange}
                headings={["Product", "Category", "Price", "Commission %"]}
                products={filterProductsData}
                selectedResources={selectedResources}
                resourceName={resourceName}
                itemCount={filterProductsData.length}
                filterProductsData={filterProductsData}
                rowMarkup={rowMarkup}
              />
            </div>
          </div>
        ) : (
          <p className="flex-center mt-10 mb-10">Loading products...</p>
        )}
      </LegacyCard>
    </AppProvider>
  );
};

export default Index;
