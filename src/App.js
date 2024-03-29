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
  Dropdown,
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

function useData(contractAddress, network) {
  const { data, error } = useSWR(
    contractAddress
      ? `api/getAbi?address=${contractAddress}&network=${network}`
      : null,
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
  const [network, setNetwork] = useState("homestead");
  const [timestamps, setTimestamps] = useState([]);
  const inputRef = useRef(null);

  const updatedEventsTime = events.map((event, index) => ({
    ...event,
    timestamp: timestamps[index],
  }));

  console.log({ updatedEventsTime });

  const { contractEvents, isLoading, isError } = useData(
    contractAddress,
    network
  );

  const onClick = ({ key }) => {
    if (key === "1") {
      setNetwork("homestead");
    } else if (key === "2") {
      setNetwork("goerli");
    } else if (key === "3") {
      setNetwork("arbitrum");
    }
  };
  const items = [
    {
      label: "homestead",
      key: "1",
    },
    {
      label: "goerli",
      key: "2",
    },
    {
      label: "arbitrum",
      key: "3",
    },
  ];

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

  const getCurrentRoles = (events) => {
    const roles = {}
    // events must be in assending order or role calculations will be incorrect
    events.sort((a, b) => (
      a.blockNumber > b.blockNumber
    ))
    events.forEach((event) => {
      if (event.event === "RoleGranted") {
        if (!roles[event.args[0]]) {
          roles[event.args[0]] = {}
        }
        roles[event.args[0]][event.args[1]] = true
      }
      if (event.event === "RoleRevoked") {
        if (!roles[event.args[0]]) {
          roles[event.args[0]] = {}
        }
        roles[event.args[0]][event.args[1]] = false

      }
    })
    console.log({ roles })
    return roles

  }

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
      const provider = new ethers.providers.AlchemyProvider(
        network,
        "wCryiyIOCMZzZCNPoBacEqARPSsOM3Rx"
      );

      const { abi } = contractEvents;
      const contract = new ethers.Contract(contractAddress, abi, provider);

      const queryResult = await contract.queryFilter(contract.filters);
      getCurrentRoles(queryResult)
      setEvents(queryResult);

      const eventBlocks = queryResult.map((item) => item.blockNumber);

      // const addresses = queryResult.map((item) => item.args.target);

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

      const updatedEvents = [];

      async function getAddresses() {
        queryResult.map(async (event) => {
          if (event.args.target) {
            const ens = await provider.lookupAddress(event.args.target);
            if (ens !== null) {
              updatedEvents.push({
                ...event,
                args: {
                  target: ens,
                  ...event.args,
                },
              });
            } else {
              updatedEvents.push({
                ...event,
              });
            }
          }
        });
      }

      getAddresses();
      console.log({ updatedEvents });

      //I want to get the ENS for each contract if available. If not available, return the contract address as a string.
      //The addressses are held in the data which is decoded in the column.
      //I need to split the array, but maybe use a dictionary so I can maintain the connection with the address?
      //Because then I can replace the address with the ENS name, but leave the big nums/nonENS contract addresses alone.
    };
    getEvents();
  }, [contractAddress, contractEvents, isError, network]);

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
          <Row gutter={[16, 24]}>
            <Col span={24}>
              <Dropdown
                menu={{
                  items,
                  onClick,
                }}
              >
                <Button type="primary">network: {network}</Button>
              </Dropdown>
            </Col>
          </Row>
          <br></br>
          <Row>
            <Col span={24}>
              Enter a smart contract address below to see all historic events
              emitted from that contract.{" "}
            </Col>
          </Row>
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
        <p>Powered by Ethers & The Arbitrum Ethereum Explorer APIs</p>
      </Footer>
    </Layout>
  );
}

export default App;
