import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Table } from 'antd';


const tokenAddress = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B"


const columns = [
  {
    title: 'Event Name',
    dataIndex: 'event',
    key: 'event'
  },
  {
    title: 'Arguments',
    key: 'args',
    render: (temp) => {
      const data = Object.entries({ ...temp.args })
      const noNumbers = data.filter(row => isNaN(row[0]))
      const rows = (noNumbers).map((name, index) => (<li key={index}>{JSON.stringify(name)}</li>))
      return <>
        {rows}

      </>
    }
  },
  {
    title: 'BlockNumber',
    dataIndex: 'blockNumber',
    key: 'blockNumber',

  }]



function App() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    const getEvents = async () => {
      const provider = new ethers.providers.AlchemyProvider();
      const result = await fetch(`api/getAbi?address=${tokenAddress}`)
      const data = await result.json();
      const contract = new ethers.Contract(tokenAddress, data.abi, provider);
      const queryResult = await contract.queryFilter(contract.filters.RoleGranted())
      setEvents(queryResult)
    }
    getEvents()
  }, [])


  return (
    <Table pagination={false} rowKey={(record, index) => (record.logIndex + index)} columns={columns} dataSource={events} />

  );
}

export default App;