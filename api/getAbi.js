const fetch = require("node-fetch");

export default async function handler(request, response) {
  const { address, network } = request.query;

  if (network === "homestead") {
    const result = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const data = await result.json();

    let abi = data.result;

    return response.status(result.status).json({
      abi,
      status: data.status,
      message: data.message,
    });
  } else if (network === "goerli") {
    const result = await fetch(
      `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const data = await result.json();

    let abi = data.result;

    return response.status(result.status).json({
      abi,
      status: data.status,
      message: data.message,
    });
  } else if (network === "arbitrum") {
    const result = await fetch(
      `https://api.arbiscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const data = await result.json();

    let abi = data.result;

    return response.status(result.status).json({
      abi,
      status: data.status,
      message: data.message,
    });
  }
}
