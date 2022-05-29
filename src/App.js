import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Table, Input, Card } from 'antd';

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
      if (!contractAddress) {
        return
      }
      const provider = new ethers.providers.AlchemyProvider();
      const result = await fetch(`api/getAbi?address=${contractAddress}`)
      const data = await result.json();
      const { abi } = data
      console.log({ abi })
      const events = JSON.parse(abi).filter(({ type }) => type === 'event').map(({ name }) => name)
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const queryResult = await contract.queryFilter(contract.filters)
      setEvents(queryResult)
    }
    getEvents()
  }, [contractAddress, eventName])


  return (
    <div style={{ background: "#ececec", height: "100vh", padding: 24 }}>
      {/* <Input disabled placeholder="Event Name" value={eventName} onChange={(event) => { setEventName(event.target.value) }} /> */}
      <Card extra={<Input placeholder="Contract" value={contractAddress} onChange={(event) => { setContractAddress(event.target.value) }} />
      }>
        <Table pagination={false} rowKey={(record, index) => (record.logIndex + index)} columns={columns} dataSource={events} />
      </Card>
    </div>
  );
}

export default App;