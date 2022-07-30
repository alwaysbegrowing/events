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
  PageHeader
} from "antd";
import { ContainerOutlined, Cont } from "@ant-design/icons";

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

  return (
    <Layout style={{ background: "#ececec", height: "100vh", paddingLeft: 24, padingRight: 24 }}>
      <PageHeader
        className="site-page-header"
        onBack={null}
        title="Smart Contract Event Explorer"
        subTitle="Explore events for a smart contract"
      />        <Row span={24} style={{ justifyContent: "center" }}>

      </Row>
      {/* <Input disabled placeholder="Event Name" value={eventName} onChange={(event) => { setEventName(event.target.value) }} /> */}
      <Card
        extra={
          <div style={{ width: '500px' }}>

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
        {contractAddress && <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Table
            pagination={false}
            rowKey={(record, index) =>
              record.logIndex + Math.random() * index
            }
            columns={columns}
            dataSource={events}
            loading={loading}
          />
        </ConfigProvider>}
      </Card>
    </Layout >
  );
}

export default App;
