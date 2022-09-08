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

const { Header, Footer, Content } = Layout;

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function GetData(contractAddress) {
  const { data, error } = useSWR(
    `api/getAbi?address=${contractAddress}`,
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
  const inputRef = useRef(null);

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
      sortOrder: "descend",
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
      description={abiError === true ? "Error" : "No Events"}
    ></Empty>
  );

  useEffect(() => {
    const getEvents = async () => {
      if (!contractAddress || !contractEvents) {
        return;
      }
      const provider = new ethers.providers.AlchemyProvider();

      const getError = () => {
        if (isError) {
          setAbiError(true);
        } else if (
          (contractEvents.abi === "Invalid Address format") |
          (contractEvents.abi === "Contract source code not verified")
        ) {
          setAbiError(true);
        } else {
          setAbiError(false);
        }
      };
      getError();
      const { abi } = contractEvents;
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters);
      setEvents(queryResult);
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
                dataSource={events}
                loading={isLoading}
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
