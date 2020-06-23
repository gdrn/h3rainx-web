import React from "react";
import { addresses, abis } from "@project/contracts";
import { gql } from "apollo-boost";
import { ethers } from "ethers";
import { useQuery } from "@apollo/react-hooks";
import { ThemeProvider, CSSReset, Box, SimpleGrid, Image, Heading, Flex, Text, Link   } from "@chakra-ui/core"
import theme from "@chakra-ui/theme"
import "./App.css";

import CountDown from "./components/CountDown"

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

async function readOnchainBalance() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = ethers.getDefaultProvider();
  // Create an instance of ethers.Contract
  // Read more about ethers.js on https://docs.ethers.io/ethers.js/html/api-contract.html
  //const ceaErc20 = new ethers.Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  //const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);

  const time = new Date("2020-06-24T07:00:00+00:00") // goldenrain acctivation

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <ThemeProvider theme={theme} >
      <CSSReset />
      <Box w="100%" minH="100vh" bg="gray.800" bgImage="radial-gradient(#2D3748,#1A202C)" color="gray.100" position="relative"  p="20px" >
        <Flex maxW="100vw" h="70px" align="center" mb="50px">
          <Image src="/gdrn-logo.png" alt="Gold Rain Logo" display="inline-block" m="20px" w="50px" h="50px" />
          <Heading as="h1" display="inline-block">Gold Rain : GDRN</Heading>
        </Flex>
          <Box maxW="600px" p="20px" ml="auto" mr="auto">
            <Text fontSize="lg" w="100%" p="20px" p="0" >Stake your $RAIN and earn $GDRN in this stable hourglass game.</Text>
            <Text fontSize="lg" w="100%" p="20px" p="0" >The value of $GDRN is stable and not affected by buys or sells.</Text>
            <Text fontSize="lg" w="100%" p="20px" p="0" >Whenever someone stakes or unstakes their $RAIN, a 10% tax is distributed proportionally to all stakers.</Text>
            <Text fontSize="lg" w="100%" p="20px" p="0" >Stake your $RAIN, get $GDRN, and grow your stack!</Text>
          </Box>
          <Box maxW="600px" p="20px" ml="auto" mr="auto" textAlign="center">
              <Text fontSize="3xl" w="100%" p="20px" p="0" >
                <Link color="teal.300" href="https://discord.gg/vqX47KK">Discord</Link>
              </Text>
              <Text fontSize="3xl" w="100%" p="20px" p="0" >
                <Link color="teal.300" href="https://etherscan.io/address/0xf56ccb441153119a373f0ad4909b8f50121a33bd">Etherscan</Link>
              </Text>
              <Text fontSize="3xl" w="100%" p="20px" p="0" >
                <Link color="teal.300" href="https://rainnetwork.online/">RainNetwork</Link>
              </Text>
          </Box>
        <CountDown expiryTimestamp={time} />
      </Box>
      <Box w="100%" minH="100px" bg="gray.600" color="gray.200" position="relative"  p="40px" textAlign="center" >
        <Link color="gray.400" m="10px" href="https://discord.gg/vqX47KK">Discord</Link>
        <Link color="gray.400" m="10px" href="https://etherscan.io/address/0xf56ccb441153119a373f0ad4909b8f50121a33bd">Etherscan</Link>
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
