import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import {
  Table,
  Input,
  Card,
  Layout,
  Typography,
  Row,
  ConfigProvider,
  Button,
} from "antd";
import { ContainerTwoTone } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

function App() {
  const [events, setEvents] = useState([]);
  const [contractAddress, setContractAddress] = useState();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const createColumns = (filter) => [
    {
      title: "Event Name",
      dataIndex: "event",
      key: "event",
      filters: filter,
      onFilter: (value, record) => record.event.indexOf(value) === 0,
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
      sorter: (a, b) => a.blockNumber - b.blockNumber,
    },
  ];

  const eventNames = events.map((item) => item.event);
  const uniqueEventNames = [...new Set(eventNames)];
  const filter = uniqueEventNames.map((event) => ({
    text: event,
    value: event,
  }));

  const customizeRenderEmpty = () => (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <ContainerTwoTone
        style={{
          fontSize: 30,
        }}
      />
      <p></p>
      <Button onClick={() => inputRef.current.focus()}>
        Enter a contract address
      </Button>
    </div>
  );

  useEffect(() => {
    const getEvents = async () => {
      if (!contractAddress) {
        return;
      }
      const provider = new ethers.providers.AlchemyProvider();
      const result = await fetch(`api/getAbi?address=${contractAddress}`);
      const data = await result.json();
      const { abi } = data;
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters);
      setEvents(queryResult);
      setLoading(false);
    };
    getEvents();
  }, [contractAddress]);

  return (
    <Layout>
      <div style={{ background: "#ececec", height: "100vh", padding: 24 }}>
        <Header></Header>
        <Row span={24} style={{ justifyContent: "center" }}>
          <Title
            level={1}
            style={{
              paddingTop: "12px",
              paddingBottom: "16px",
            }}
          >
            Ethereum Smart Contract Events
          </Title>
        </Row>
        {/* <Input disabled placeholder="Event Name" value={eventName} onChange={(event) => { setEventName(event.target.value) }} /> */}
        <Card
          extra={
            <div style={{ paddingRight: "25vw" }}>
              <Title level={5}>
                Search for the contract addresses to populate the table. Use{" "}
                <a
                  href="https://etherscan.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  etherscan.io
                </a>{" "}
                to find the contract addresses.
              </Title>
              <Input
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(event) => {
                  setContractAddress(event.target.value);
                  setLoading(true);
                }}
                ref={inputRef}
              />
            </div>
          }
        >
          {/* Added math.random() because the keys were not unique which was messing with the blockNumber sorting */}
          <ConfigProvider renderEmpty={customizeRenderEmpty}>
            <Table
              pagination={false}
              rowKey={(record, index) =>
                record.logIndex + Math.random() * index
              }
              columns={createColumns(filter)}
              dataSource={events}
              loading={loading}
            />
          </ConfigProvider>
        </Card>
      </div>
    </Layout>
  );
}

export default App;
