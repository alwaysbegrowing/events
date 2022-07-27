import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Table, Input, Card, Layout, Typography } from "antd";

const { Header } = Layout;
const { Title } = Typography;

const columns = [
  {
    title: "Event Name",
    dataIndex: "event",
    key: "event",
    filters: [
      {
        text: "Transfer",
        value: "transfer",
      },
      {
        text: "Approval",
        value: "approval",
      },
      {
        text: "Minting",
        value: "minting",
      },
      {
        text: "ContractAdminRoleUpdate",
        value: "contractAdminRoleUpdate",
      },
    ],
    // onFilter: (value, record) => record.name.indexOf(value) === 0,
  },
  {
    title: "Arguments",
    key: "args",
    render: (temp) => {
      const data = Object.entries({ ...temp.args });
      const noNumbers = data.filter((row) => isNaN(row[0]));
      const rows = noNumbers.map((name, index) => (
        <li key={index}>{JSON.stringify(name)}</li>
      ));
      return <>{rows}</>;
    },
  },
  {
    title: "BlockNumber",
    dataIndex: "blockNumber",
    key: "blockNumber",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.blockNumber - b.blockNumber,
  },
];

function App() {
  const [events, setEvents] = useState([]);
  const [contractAddress, setContractAddress] = useState("");
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const getEvents = async () => {
      if (!contractAddress) {
        return;
      }
      const provider = new ethers.providers.AlchemyProvider();
      const result = await fetch(`api/getAbi?address=${contractAddress}`);
      const data = await result.json();
      const { abi } = data;
      console.log({ abi });
      const events = JSON.parse(abi)
        .filter(({ type }) => type === "event")
        .map(({ name }) => name);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters);
      setEvents(queryResult);
    };
    getEvents();
  }, [contractAddress, eventName]);

  return (
    <Layout>
      <div style={{ background: "#ececec", height: "100vh", padding: 24 }}>
        <Header>
          <Title
            level={1}
            style={{
              color: "white",
              textAlign: "center",
              paddingTop: "12px",
              paddingBottom: "12px",
            }}
          >
            Events
          </Title>
        </Header>
        <Card>
          <p>
            Search for the contract addresses to populate the table. Use{" "}
            <a href="https://etherscan.io/" target="_blank" rel="noreferrer">
              etherscan.io
            </a>{" "}
            to find the contract addresses.
          </p>
        </Card>
        {/* <Input disabled placeholder="Event Name" value={eventName} onChange={(event) => { setEventName(event.target.value) }} /> */}
        <Card
          extra={
            <Input
              placeholder="Contract"
              value={contractAddress}
              onChange={(event) => {
                setContractAddress(event.target.value);
              }}
            />
          }
        >
          <Table
            pagination={false}
            rowKey={(record, index) => record.logIndex + index}
            columns={columns}
            dataSource={events}
          />
        </Card>
      </div>
    </Layout>
  );
}

export default App;
