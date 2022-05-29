import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Table, Input } from 'antd';

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
  const [contractAddress, setContractAddress] = useState('')
  const [eventName, setEventName] = useState('')

  useEffect(() => {
    const getEvents = async () => {
      const provider = new ethers.providers.AlchemyProvider();
      const result = await fetch(`api/getAbi?address=${contractAddress}`)
      const data = await result.json();
      const contract = new ethers.Contract(contractAddress, data.abi, provider);
      const queryResult = await contract.queryFilter(eventName)
      setEvents(queryResult)
    }
    getEvents()
  }, [contractAddress, eventName])


  return (
    <>
      <Input placeholder="Contract" value={contractAddress} onChange={(event) => { setContractAddress(event.target.value) }} />
      <Input placeholder="Event Name" value={eventName} onChange={(event) => { setEventName(event.target.value) }} />

      <Table pagination={false} rowKey={(record, index) => (record.logIndex + index)} columns={columns} dataSource={events} />
    </>
  );
}

export default App;