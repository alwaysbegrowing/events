const fetch = require("node-fetch");

export default async function handler(request, response) {
  const { address } = request.query;

  // make an API call to the ABIs endpoint
  const result = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  const data = await result.json();

  // print the JSON response
  let abi = data.result;

  return response.status(result.status).json({
    abi,
    status: data.status,
    message: data.message,
  });
}
