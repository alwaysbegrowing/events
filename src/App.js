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

// 1. turn columns into a function that takes the filters
// 2. pass the filters into columns
// 3. get the filters from the events object
// 4. use https://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array to get only unique filters

const columns = [
  {
    title: "Event Name",
    dataIndex: "event",
    key: "event",
    // filters: () => ()
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
    sorter: (a, b) => a.blockNumber - b.blockNumber,
  },
];

function App() {
  const [events, setEvents] = useState([]);
  const [contractAddress, setContractAddress] = useState();
  const [eventName, setEventName] = useState("");
  const inputRef = useRef(null);

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
                placeholder="Contract"
                value={contractAddress}
                onChange={(event) => {
                  setContractAddress(event.target.value);
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
              columns={columns}
              dataSource={events}
            />
          </ConfigProvider>
        </Card>
      </div>
    </Layout>
  );
}

export default App;
