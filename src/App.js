import React, { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { ethers } from "ethers";
import {
  Table,
  Input,
  Layout,
  Row,
  ConfigProvider,
  Button,
  Empty,
  PageHeader,
  Col,
} from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { timeDifferenceForDate } from "readable-timestamp-js";

const { Header, Footer, Content } = Layout;

const fetcher = async (...args) => {
  const res = await fetch(...args);
  if (res.ok) {
    const response = await res.json();
    if (response.status === "1") {
      return response;
    }
  }
  throw new Error(true);
};

function useData(contractAddress) {
  const { data, error } = useSWR(
    contractAddress ? `api/getAbi?address=${contractAddress}` : null,
    fetcher
  );

  return {
    contractEvents: data,
    isLoading: !error && !data,
    isError: error,
  };
}

function App() {
  const [events, setEvents] = useState([]);
  const [contractAddress, setContractAddress] = useState();
  const [abiError, setAbiError] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const inputRef = useRef(null);

  const updatedEventsTime = events.map((event, index) => ({
    ...event,
    timestamp: timestamps[index],
  }));

  const { contractEvents, isLoading, isError } = GetData(contractAddress);

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
          <li key={index}>
            <b>{JSON.stringify(name[0]).replace(/"/g, "")}:</b>{" "}
            {name[1].toString()}
          </li>
        ));
        return <>{rows}</>;
      },
    },
    {
      title: "BlockNumber",
      dataIndex: "blockNumber",
      key: "blockNumber",
      sorter: (a, b) => a.blockNumber - b.blockNumber,
      sortOrder: "descend",
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => {
        if (!timestamp) {
          return <p>Loading...</p>;
        }
        return timestamp;
      },
    },
  ];

  const eventNames = events.map((item) => item.event);
  const uniqueEventNames = [...new Set(eventNames)];
  const filter = uniqueEventNames.map((event) => ({
    text: event,
    value: event,
  }));

  const customizeRenderEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={isError ? "Error" : "No Events"}
    ></Empty>
  );

  useEffect(() => {
    const getEvents = async () => {
      if (!contractAddress || !contractEvents) {
        setEvents([]);
        return;
      }
      const provider = new ethers.providers.AlchemyProvider();

      const { abi } = contractEvents;
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters);
      setEvents(queryResult);

      const eventBlocks = queryResult.map((item) => item.blockNumber);

      const timestampArr = [];

      async function getTimestamp() {
        for (const block of eventBlocks) {
          const time = await provider.getBlock(block);
          const timestamp = time.timestamp;
          const date = new Date(timestamp * 1000);
          const newDate = timeDifferenceForDate(date);
          timestampArr.push(newDate);
        }
        setTimestamps(timestampArr);
      }

      getTimestamp();
    };
    getEvents();
  }, [contractAddress, contractEvents, isError]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#f6ffed" }}>
        <Row justify="space-between">
          <Col>
            <img
              style={{
                float: "left",
                height: 31,
                // width: 200,
                margin: "16px 0px 16px 0",
              }}
              src="https://tse3.mm.bing.net/th?id=OIP.XYaeDXspGLV6vl4xFh7CDgHaHa"
              alt="abg logo"
            />
            <b> Always Be Growing</b>
          </Col>
          <Col>
            {" "}
            <Button
              onClick={() => {
                window.open("https://github.com/alwaysbegrowing/events");
              }}
              type="text"
            >
              <GithubOutlined />
            </Button>
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: "0 24px", marginTop: 16 }}>
        <PageHeader
          style={{ backgroundColor: "#fff" }}
          title="Blockchain Event Explorer"
        >
          Enter a smart contract address below to see all historic events
          emitted from that contract.{" "}
        </PageHeader>

        <div style={{ background: "#fff", padding: 24 }}>
          <div>
            <Input
              placeholder="Contract Address"
              value={contractAddress}
              onChange={(event) => {
                setContractAddress(event.target.value);
              }}
              ref={inputRef}
            />
          </div>

          {/* Added math.random() because the keys were not unique which was messing with the blockNumber sorting */}
          {contractAddress && (
            <ConfigProvider renderEmpty={customizeRenderEmpty}>
              <Table
                style={{ marginTop: 24 }}
                pagination={false}
                rowKey={(record, index) =>
                  record.logIndex + Math.random() * index
                }
                columns={createColumns(filter)}
                dataSource={updatedEventsTime}
                loading={isLoading}
                scroll={{ x: 400 }}
              />
            </ConfigProvider>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Created by <a href="https://abg.garden">Always Be Growing</a>
      </Footer>
    </Layout>
  );
}

export default App;
