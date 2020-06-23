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

function App() {

  const [provider, setProvider] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [goldRainContract, setGoldRainContract] = useState(null)
  const [rainContract, setRainContract] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [multiDataGdrn, setMultiDataGdrn] = useState({
    contractRain: 0,
    totalGdrn:    0,
    userGdrn:     0,
    userRain:     0,
    userDivs:     0,
    buyPrice:     0,
    sellPrice:    0,
    userPct:      0,
  })
  const [multiDataRain, setMultiDataRain] = useState({
    userAllowance: 0
  })

  const getWeb3 = async () => {
    console.log('getting web3')
    let provider = null
    if (window.ethereum) {
      provider = window.ethereum
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        alert("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, try modal
    else {
      provider = await web3Modal.connect()
    }
    setProvider(provider)
    const web3 = new Web3(provider)
    setWeb3(web3)
    const accounts = await web3.eth.getAccounts()
    setAccounts(accounts)
    const goldRainContract = new web3.eth.Contract(abis.goldenRain, addresses.goldenRain)
    setGoldRainContract(goldRainContract)
    const rainContract = new web3.eth.Contract(abis.erc20, addresses.rain)
    setRainContract(rainContract)
    const updateGdrnData = async () => {
      const multiDataGdrn = await goldRainContract.methods.multiData().call({from:accounts[0]})
      let userPct = "0"
      if(multiDataGdrn["1"] !== "0"){
        userPct = web3.utils.toBN(multiDataGdrn["2"]).mul(web3.utils.toBN(100)).div(web3.utils.toBN(multiDataGdrn["1"]))
      }
      setMultiDataGdrn({
        contractRain: web3.utils.fromWei(multiDataGdrn["0"]),
        totalGdrn:    web3.utils.fromWei(multiDataGdrn["1"]),
        userGdrn:     web3.utils.fromWei(multiDataGdrn["2"]),
        userRain:     web3.utils.fromWei(multiDataGdrn["3"]),
        userDivs:     web3.utils.fromWei(multiDataGdrn["4"]),
        buyPrice:     web3.utils.fromWei(multiDataGdrn["5"]),
        sellPrice:    web3.utils.fromWei(multiDataGdrn["6"]),
        userPct:      userPct.toString()
      })
    }
    const updateRainData = async () => {
      const multiDataRain = await Promise.all([
        rainContract.methods.allowance(accounts[0], addresses.goldenRain).call()
      ])
      setMultiDataRain({
        userAllowance: web3.utils.fromWei(multiDataRain[0])
      })
    }
    window.ethereum.on("accountsChanged", async function() {
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts)
      await updateGdrnData()
      await updateRainData()
    });
    await updateGdrnData()
    setInterval(updateGdrnData, 1000)
    setInterval(updateRainData, 1000)
  }

  useEffect(()=>{
    getWeb3()
  },[])

  const time = Date.UTC(2020,5,24,7,0,0,0) // goldenrain acctivation
  let isActive = false
  if (Date.now() > time )
    isActive = true

  return (
    <ThemeProvider theme={theme} >
      <CSSReset />
      <Box w="100%" minH="100vh" bg="gray.800" bgImage="radial-gradient(#2D3748,#1A202C)" color="gray.100" position="relative"  p="20px" >
        <Flex maxW="100vw" h="70px" align="center" >
          <Image src="/gdrn-logo.png" alt="Gold Rain Logo" display="inline-block" m="20px" w="50px" h="50px" />
          <Heading as="h1" display="inline-block">Gold Rain : GDRN</Heading>
          { web3 && accounts[0] ?
            (<Text ml="auto">Account: {accounts[0].substring(0, 6)}&hellip;</Text>)
            :
            (<Button variant="solid" bg="teal.500" ml="auto" onClick={getWeb3}>Connect</Button>)
          }
        </Flex>
        <Box maxW="600px" p="20px" >
          <Text color="gray.500" >Contract $RAIN: {shortenDecimal(multiDataGdrn.contractRain)}</Text>
          <Text color="gray.500">Total $GDRN: {shortenDecimal(multiDataGdrn.totalGdrn)}</Text>
          <Text color="gray.500">Tax Rate: 10%</Text>
        </Box>
        <Box maxW="600px" p="20px" ml="auto" mr="auto">
          <Text fontSize="lg" w="100%" p="0" >Stake your $RAIN and get $GDRN in this stable hourglass game.</Text>
          <Text fontSize="lg" w="100%" p="0" >Whenever someone stakes or unstakes their $RAIN, a 10% tax is distributed proportionally to all $GDRN holders.</Text>
          <Text fontSize="lg" w="100%" p="0" >Stake your $RAIN, get $GDRN, and grow your stack!</Text>
          <Text fontSize="lg" w="100%" p="0" >1 $GDRN = 1 $RAIN.</Text>
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
                      multiDataGdrn={multiDataGdrn}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      goldRainContract={goldRainContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Unstake
                      multiDataRain={multiDataRain}
                      multiDataGdrn={multiDataGdrn}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      goldRainContract={goldRainContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Dividends
                      multiDataRain={multiDataRain}
                      multiDataGdrn={multiDataGdrn}
                      web3={web3}
                      accounts={accounts}
                      provider={provider}
                      goldRainContract={goldRainContract}
                      rainContract={rainContract}
                    />
                  </TabPanel>
                  <TabPanel position="relative">
                    <Heading mb="20px">Profile</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Wallet</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userRain)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Dividends</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userDivs)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$GDRN Balance</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userGdrn)}</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Stake %</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userPct)}%</Text>
                    <br/>
                    <Text fontSize="lg" p="10px" display="block" mt="20px">Earn 2% commissions when anyone uses your link.</Text>
                    <Box bg="transparent" border="solid" width="100%" p="20px">
                      <Text fontSize="lg" display="block" textAlign="center">
                        https://goldrain.vercel.app/#/{accounts[0]}
                      </Text>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          ) :
          (
            <>
              <Box maxW="600px" p="20px" ml="auto" mr="auto" textAlign="center">
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href="https://discord.gg/vqX47KK">Discord</Link>
                  </Text>
                  <Text fontSize="3xl" w="100%" p="20px" p="0" >
                    <Link color="teal.300" href="https://etherscan.io/address/0x438f8795f8dfb195140eeb5ead8b0e794bf33ee8">Etherscan</Link>
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
      <Box w="100%" minH="100px" bg="gray.600" color="gray.200" position="relative"  p="40px" textAlign="center" >
        <Link color="gray.400" m="10px" href="https://discord.gg/vqX47KK">Discord</Link>
        <Link color="gray.400" m="10px" href="https://etherscan.io/address/0x438f8795f8dfb195140eeb5ead8b0e794bf33ee8">Etherscan</Link>
        <Link color="gray.400" m="10px" href="https://github.com/gdrn/goldenrain-web">Github</Link>
        <Link color="gray.400" m="10px" href="https://rainnetwork.online/">RainNetwork</Link>
      </Box>
      <Box w="100%" minH="100px" bg="gray.600" color="gray.500" position="relative"  textAlign="center" >
        © 2020 Gold Rain. All rights reserved.
      </Box>
    </ThemeProvider>
  );
}

export default App;
