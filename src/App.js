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
} from "antd";
import { ContainerOutlined, Cont } from "@ant-design/icons";

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header >
        <img
          style={{
            float: 'left',
            height: 31,
            margin: '16px 24px 16px 0'
          }}
          src="https://cleanshot-cloud-fra.s3.eu-central-1.amazonaws.com/media/34670/q3tycClOm00pMHpyE3K8iDqyHrsTALcESEAGRjHw.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGV1LWNlbnRyYWwtMSJGMEQCIFfJhMnkdYbInMCgETETs3gjvJpmAmSxYhrW7dV6T2CNAiAH6eg1O13y%2BenHmEdjxF5v%2BaxqYitLJjUW5dYer1PdKSqQAwgxEAAaDDkxOTUxNDQ5MTY3NCIMq71khgIl08hCmhg8Ku0Ca%2FMSvTyHRdR7D1IdaHvo3ebV8JQpGQuFTqoYVQzroQy8ufoOJdPMPqXc4X1aIyfUC%2B75CVvzSrCe8YrGz3Lzvv5rVt0rl18Jmnkd5rmCPDJPBwmeH3AccV1SSrGC6k1E7OxADYSDKeYhQfrG2YGsy1drnfodtB8dRXIQSpolCdETBm58PDLqsbsQRsdm8ZdLBl4DM8z0CWredWbTepHXN8pmENyoeJYbFhnt%2BzZNo8p%2FPCOFfnlqXt7eTpx9C72wH5PW%2Bqk1K9u%2Bwi5thHF77X2X3OcPFiUqxDMlU6hBA8jHk0O6AJ7OBQe2BuwuZA2tyll775hb5o4DxZyX%2BqWcisPILfKdBQ73rrd1BKHkdgJNFipORMtw4FGB2dtw6zpJVd7YYD41LrYWSV%2BXeQvn1Tc9PMfS%2BaEZml%2BQm5cEUM88%2B%2B32vbeBH1%2BqE1iS7YnnL2vQlJta86ZJ4NlimZ6D%2BkQZZyRPBLaXFj%2B3s3AwuJyVlwY6ngG4Dw0QzLcspVKKresDZZfZmaJ2ASIACzRdp3eIlh1uvEfW0zURlDErMexLeEeBFKKM9sP7Ot4Jo2PeFhfNlcHf7dUvshGFpLfAna%2B3rqywdMNB3vh4Cq2brLEk0zDi8RflR8yL2D1mq0IwCcGmBeuNa1D%2F7ztpakMy8YWusKuzJT6PCkOwprfoFztvoUqbxuuCJM78ExKTdKVL17btnw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5MF2VVMNDXQKEASQ%2F20220730%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220730T155919Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Signature=0a215ac68fd6c3b4be5c5c123acc1376ab95451c57e66a6b150ad549a12fe223"
        />

      </Header>
      <PageHeader style={{ backgroundColor: "#fff" }} title='Blockchain Event Explorer'>Enter a smart contract address below to see all historic events emitted from that contract. </PageHeader>
      <Content style={{ padding: '0 24px', marginTop: 16 }}>
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
