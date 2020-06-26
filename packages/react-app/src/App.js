import React, { useState, useEffect } from "react";
import { addresses, abis } from "@project/contracts";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { ThemeProvider, CSSReset, Box, SimpleGrid, Image, Heading, Flex, Text, Link, Button, Tabs, Tab, TabList, TabPanels, TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,  } from "@chakra-ui/core"
import theme from "@chakra-ui/theme"
import "./App.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider"

import CountDown from "./components/CountDown"
import Stake from "./components/Stake"
import Unstake from "./components/Unstake"
import Dividends from "./components/Dividends"

function shortenDecimal(decimalString) {
  decimalString = decimalString.toString()
  if(!decimalString.includes('.')) return decimalString
  return decimalString.substring(0,decimalString.indexOf('.'))
}


const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "80234bcec5d848e0b3471f49c8cd7303" // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

let interval = 500

function App() {

  let isMM = false;

  const [provider, setProvider] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [h3rainxContract, setH3rainxContract] = useState(null)
  const [rainContract, setRainContract] = useState(null)
  const [h3xContract, setH3xContract] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [multiDataH3rx, setMultiDataH3rx] = useState({
    contractH3x: 0,
    contractRain: 0,
    totalH3rx:    0,
    userH3rx:     0,
    userRain:     0,
    userH3x:      0,
    userDivsRain: 0,
    userDivsH3x:  0,
    userPct:      0,
  })
  const [multiDataRain, setMultiDataRain] = useState({
    userAllowance: 0
  })
  const [multiDataH3x, setMultiDataH3x] = useState({
    userAllowance: 0
  })

  const getWeb3 = async () => {
    let provider = null
    if (window.ethereum) {
      provider = window.ethereum
      try {
        // Request account access
        await window.ethereum.enable();
        isMM = true;
      } catch (error) {
        // User denied account access...
        alert("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, use infura
    else {
      provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/c6e2307697ad45729ea184c9ed93f513')
      interval = 5000 //prevent overloading infura
    }
    setProvider(provider)
    const web3 = new Web3(provider)
    setWeb3(web3)
    const accounts = await web3.eth.getAccounts()
    setAccounts(accounts)
    const h3rainxContract = new web3.eth.Contract(abis.h3rainx, addresses.h3rainx)
    setH3rainxContract(h3rainxContract)
    const rainContract = new web3.eth.Contract(abis.erc20, addresses.rain)
    setRainContract(rainContract)
    const h3xContract = new web3.eth.Contract(abis.erc20, addresses.h3x)
    setH3xContract(h3xContract)
    const updateH3rainxData = async () => {
      let multiDataH3rainx;
      if(!accounts || accounts.length < 1){
        multiDataH3rainx = await h3rainxContract.methods.multiData().call()
      }else{
        multiDataH3rainx = await h3rainxContract.methods.multiData().call({from:accounts[0]})
      }
      let userPct = "0"
      if(multiDataH3rainx["1"] !== "0"){
        userPct = web3.utils.toBN(multiDataH3rainx["3"]).mul(web3.utils.toBN(100)).div(web3.utils.toBN(multiDataH3rainx["2"]))
      }
      console.log(multiDataH3rainx)
      setMultiDataH3rx({
        contractH3x:  web3.utils.fromWei(multiDataH3rainx["0"]),
        contractRain: web3.utils.fromWei(multiDataH3rainx["1"]),
        totalH3rx: web3.utils.fromWei(multiDataH3rainx["2"]),
        userH3rx:  web3.utils.fromWei(multiDataH3rainx["3"]),
        userRain:     web3.utils.fromWei(multiDataH3rainx["4"]),
        userH3x:      web3.utils.fromWei(multiDataH3rainx["5"]),
        userDivsRain: web3.utils.fromWei(web3.utils.toBN(multiDataH3rainx["6"]).mul(web3.utils.toBN(4))),
        userDivsH3x:  web3.utils.fromWei(multiDataH3rainx["6"]),
        userPct:      userPct.toString()
      })
    }
    const updateRainData = async () => {
      if(!accounts || accounts.length < 1) return
      const multiDataRain = await Promise.all([
        rainContract.methods.allowance(accounts[0], addresses.h3rainx).call()
      ])
      setMultiDataRain({
        userAllowance: web3.utils.fromWei(multiDataRain[0])
      })
    }
    const updateH3xData = async () => {
      if(!accounts || accounts.length < 1) return
      const multiDataH3x = await Promise.all([
        h3xContract.methods.allowance(accounts[0], addresses.h3rainx).call()
      ])
      setMultiDataH3x({
        userAllowance: web3.utils.fromWei(multiDataH3x[0])
      })
    }
    if(isMM){
      window.ethereum.on("accountsChanged", async () => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts)
        await updateH3rainxData()
        await updateRainData()
        await updateH3xData()
      });
    }
    await updateH3rainxData()
    await updateRainData()
    await updateH3xData()
    setInterval(updateH3rainxData, interval)
    setInterval(updateRainData, interval)
    setInterval(updateH3xData, interval)
  }

  useEffect(()=>{
    getWeb3()
  },[])

  const time = Date.UTC(2020,5,27,7,0,0,0)
  let isActive = false
  if (Date.now() > time )
    isActive = true

  return (
    <ThemeProvider theme={theme} >
      <CSSReset />
      <Box w="100%" minH="100vh" bg="gray.800" bgImage="radial-gradient(#2D3748,#1A202C)" color="gray.100" position="relative"  p="20px" pb="160px" >
        <Flex maxW="100vw" h="70px" align="center" >
          <Image src="/h3rainx-logo.png" alt="H3RainX Logo" display="inline-block" m="20px" w="50px" h="50px" />
          <Heading as="h1" display="inline-block">H3RainX : H3RX</Heading>
          { (web3 && accounts.length>0) ?
            (<Text ml="auto">Account: {accounts[0].substring(0, 6)}&hellip;</Text>)
            :
            (<Button variant="solid" bg="teal.500" ml="auto" onClick={getWeb3}>Connect</Button>)
          }
        </Flex>
        <Box maxW="600px" p="20px" >
          <Text color="gray.500" >Contract $H3X: {shortenDecimal(multiDataH3rx.contractH3x)}</Text>
          <Text color="gray.500" >Contract $RAIN: {shortenDecimal(multiDataH3rx.contractRain)}</Text>
          <Text color="gray.500">Total $H3RX: {shortenDecimal(multiDataH3rx.totalH3rx)}</Text>
          <Text color="gray.500">Tax Rate: 10%</Text>
        </Box>
        <Box maxW="600px" p="20px" ml="auto" mr="auto">
          <Text fontSize="lg" w="100%" p="0" >Stake your $RAIN+$H3X and get $H3RX in this stable hourglass game.</Text>
          <Text fontSize="lg" w="100%" p="0" >Whenever someone stakes or unstakes their $RAIN+$H3X, a 10% tax is distributed proportionally to all $H3RX holders.</Text>
          <Text fontSize="lg" w="100%" p="0" >Stake 4 $RAIN + 1 $H3X to get 1 $H3RX and grow your stack! </Text>
          <Text fontSize="lg" w="100%" p="0" >1 $H3RX = 4 $H3RX + 1 $H3X.</Text>
        </Box>
        { isActive ?
          (
            <>
              <Tabs w="640px" maxW="90vw" ml="auto" mr="auto" mt="40px">
                <TabList>
                  <Tab>Stake</Tab>
                  <Tab>Unstake</Tab>
                  <Tab>Dividends</Tab>
                  <Tab>Profile</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Stake
                      multiDataRain={multiDataRain}
                      multiDataH3x={multiDataH3x}
                      multiDataH3rx={multiDataH3rx}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      h3rainxContract={h3rainxContract}
                      h3xContract={h3xContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Unstake
                      multiDataRain={multiDataRain}
                      multiDataH3x={multiDataH3x}
                      multiDataH3rx={multiDataH3rx}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      h3rainxContract={h3rainxContract}
                      h3xContract={h3xContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Dividends
                      multiDataRain={multiDataRain}
                      multiDataH3x={multiDataH3x}
                      multiDataH3rx={multiDataH3rx}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      h3rainxContract={h3rainxContract}
                      h3xContract={h3xContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel position="relative">
                    <Heading mb="20px">Profile</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Wallet</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userRain)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$H3X Wallet</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userH3x)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Dividends</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userDivsRain)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$H3X Dividends</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userDivsH3x)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$H3RX Balance</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userH3rx)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Stake %</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userPct)}%</Text>
                    <br/>
                    {accounts.length>0 &&
                      (
                        <>
                          <Text fontSize="lg" p="10px" display="block" mt="20px">Earn 2% commissions when anyone uses your link.</Text>
                          <Box bg="transparent" border="solid" width="100%" p="20px">
                            <Text fontSize="lg" display="block" textAlign="center">
                              https://h3rainx.vercel.app/#/{accounts[0]}
                            </Text>
                          </Box>
                        </>
                      )
                  }
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          ) :
          (
            <>
              <Box maxW="600px" p="20px" ml="auto" mr="auto" textAlign="center">
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href="https://rainnetwork.online/">Rain</Link>
                  </Text>
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href="https://h3x.exchange/">H3X</Link>
                  </Text>
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href={"https://etherscan.io/address/"+addresses.h3rainx}>Etherscan</Link>
                  </Text>
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href="https://rainnetwork.online/">RainNetwork</Link>
                  </Text>
              </Box>
              <CountDown expiryTimestamp={time} />
            </>
          )
        }

      </Box>
      <Box w="100%" minH="100px" bg="gray.800" color="gray.200" position="relative"  p="20px" pt="80px" textAlign="center" fontSize={{base:"sm", md:"md"}} >
        <Link color="gray.600" m="5px" href={"https://etherscan.io/address/"+addresses.h3rainx}>Etherscan</Link>
        <Link color="gray.600" m="5px" href="https://github.com/gdrn/h3rainx-web">Github</Link>
        <Link color="gray.600" m="5px" href="https://rainnetwork.online/">Rain</Link>
        <Link color="gray.600" m="5px" href="https://h3x.exchange/">H3X</Link>
      </Box>
      <Box w="100%" minH="100px" pb="80px" bg="gray.800" color="gray.700" position="relative"  textAlign="center" >
        © 2020 H3RainX. All rights reserved. Not affiliated with H3X or Rain.
      </Box>
    </ThemeProvider>
  );
}

export default App;
