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

const GET_TRANSFERS = gql`
  {
    transfers(first: 10) {
      id
      from
      to
      value
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);

  const [provider, setProvider] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState([])

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
    window.ethereum.on("accountsChanged", async function() {
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts)
    });
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
        <Flex maxW="100vw" h="70px" align="center" mb="50px">
          <Image src="/gdrn-logo.png" alt="Gold Rain Logo" display="inline-block" m="20px" w="50px" h="50px" />
          <Heading as="h1" display="inline-block">Gold Rain : GDRN</Heading>
          { web3 && accounts[0] ?
            (<Text ml="auto">Account: {accounts[0].substring(0, 6)}&hellip;</Text>)
            :
            (<Button variant="solid" bg="teal.500" ml="auto" onClick={getWeb3}>Connect</Button>)
          }
        </Flex>
        <Box maxW="600px" p="20px" ml="auto" mr="auto">
          <Text fontSize="lg" w="100%" p="0" >Stake your $RAIN and earn $GDRN in this stable hourglass game.</Text>
          <Text fontSize="lg" w="100%" p="0" >The value of $GDRN is stable and not affected by buys or sells.</Text>
          <Text fontSize="lg" w="100%" p="0" >Whenever someone stakes or unstakes their $RAIN, a 10% tax is distributed proportionally to all stakers.</Text>
          <Text fontSize="lg" w="100%" p="0" >Stake your $RAIN, get $GDRN, and grow your stack!</Text>
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
                    <Heading mb="20px">Stake</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $RAIN</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">00000000000</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Approved $RAIN</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" p="10px" mt="20px" textAlign="center">$RAIN:</Text>
                    <NumberInput step={1} defaultValue={1000} min={1} max={1000000000} w="50%" ml="auto" mr="auto" color="gray.700">
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="lg" p="10px" mb="20px" textAlign="center">Receive 0.00 $GDRN</Text>
                    <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px">Approve $RAIN</Button>
                    <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px">Stake $RAIN</Button>
                  </TabPanel>
                  <TabPanel>
                    <Heading mb="20px">Unstake</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $GDRN</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet Stake %</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" p="10px" mt="20px" textAlign="center">$GDRN:</Text>
                    <NumberInput step={1} defaultValue={1000} min={1} max={1000000000} w="50%" ml="auto" mr="auto" color="gray.700">
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="lg" p="10px" mb="20px" textAlign="center">Receive 0.00 $RAIN</Text>
                    <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px">Unstake</Button>
                  </TabPanel>
                  <TabPanel>
                    <Heading mb="20px">Dividends</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Dividends</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px">Reinvest</Button>
                    <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px">Withdraw</Button>
                  </TabPanel>
                  <TabPanel position="relative">
                    <Heading mb="20px">Profile</Heading>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Balance</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Dividends</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">GDRN Balance</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
                    <br/>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block">Stake %</Text>
                    <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">0</Text>
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
