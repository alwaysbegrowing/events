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
  Empty,
  PageHeader,
  Divider, Col
} from "antd";
import { ContainerOutlined, GithubOutlined } from "@ant-design/icons";

const { Header, Footer, Content } = Layout;
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
    // filterDropdown: (event) => {
    //   const filterArray = [];
    //   const newFilters = Object.values(event).map(filterArray.push());
    //   const filterItems = [...new Set(newFilters)];
    //   console.log(filterItems);

    //   return filterItems;
    // },
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
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState([]);
  const inputRef = useRef(null);

  const customizeRenderEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE
      }

      description={null}
    >
      <Button onClick={() => inputRef.current.focus()}>
        Enter a contract address
      </Button>    </Empty>
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
      // const events = JSON.parse(abi)
      //   .filter(({ type }) => type === "event")
      //   .map(({ name }) => name);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters);
      setEvents(queryResult);
      setLoading(false);
    };
    getEvents();
  }, [contractAddress, eventName]);

  ConfigProvider.config({
    theme: {
      primaryColor: '#25b864',
    },
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#f6ffed" }} >
        <Row justify="space-between">
          <Col><img
            style={{
              float: 'left',
              height: 31,
              // width: 200,
              margin: '16px 0px 16px 0'
            }}
            src="https://tse3.mm.bing.net/th?id=OIP.XYaeDXspGLV6vl4xFh7CDgHaHa"
          />
            <b> Always Be Growing</b>
          </Col>
          <Col>    <Button onClick={() => { window.open('https://github.com/alwaysbegrowing/events') }} type="text"><GithubOutlined /></Button>
          </Col>

        </Row>
      </Header>
      <Content style={{ padding: '0 24px', marginTop: 16 }}>
        <PageHeader style={{ backgroundColor: "#fff" }} title='Blockchain Event Explorer'>Enter a smart contract address below to see all historic events emitted from that contract. </PageHeader>

        <div style={{ background: '#fff', padding: 24 }}>

          <div >

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

          {/* Added math.random() because the keys were not unique which was messing with the blockNumber sorting */}
          {contractAddress && <ConfigProvider renderEmpty={customizeRenderEmpty}>
            <Table
              style={{ marginTop: 24 }}
              pagination={false}
              rowKey={(record, index) =>
                record.logIndex + Math.random() * index
              }
              columns={columns}
              dataSource={events}
              loading={loading}
            />
          </ConfigProvider>}
        </div >
      </Content>
      <Footer style={{ textAlign: 'center' }}>Created by <a href="https://abg.garden">Always Be Growing</a></Footer>
    </Layout >
  );
}

export default App;
