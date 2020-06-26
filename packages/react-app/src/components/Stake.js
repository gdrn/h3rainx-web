import React, { useState, useEffect } from "react";
import { addresses, abis } from "@project/contracts";
import { Heading, Text, Button, Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,  } from "@chakra-ui/core"


function shortenDecimal(decimalString) {
  decimalString = decimalString.toString()
  if(!decimalString.includes('.')) return decimalString
  return decimalString.substring(0,decimalString.indexOf('.'))
}

export default function Stake({
  multiDataRain,
  multiDataH3x,
  multiDataH3rx,
  web3,
  accounts,
  provider,
  h3rainxContract,
  h3xContract,
  rainContract
}) {

  const [stakeValue, setStakeValue] = useState(1000)

  let referralAddress = window.location.hash.substr(2);
  if(!referralAddress || referralAddress.length !== 42 ) referralAddress = "0x0000000000000000000000000000000000000000"

  const handleApproveRain = async () => {
    const stakeValueBN = web3.utils.toBN(stakeValue)
    if(stakeValueBN.lt(web3.utils.toBN(4))) {
      alert("Must stake at least 4 RAIN.")
      return
    }
    await rainContract.methods.approve(addresses.h3rainx,web3.utils.toWei(stakeValueBN.mul(web3.utils.toBN(4)),'ether')).send({from:accounts[0]})
  }

  const handleApproveH3x = async () => {
    const stakeValueBN = web3.utils.toBN(stakeValue)
    if(stakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must stake at least 1 H3x.")
      return
    }
    await h3xContract.methods.approve(addresses.h3rainx,web3.utils.toWei(stakeValueBN,'ether')).send({from:accounts[0]})
  }

  const handleStake = async () => {
    const requestValue = Math.floor(stakeValue*0.9)
    const stakeValueBN = web3.utils.toBN(stakeValue)
    if(stakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must stake at least 1 H3X and 4 RAIN.")
      return
    }
    if(stakeValueBN.mul(web3.utils.toBN(4)).gt(web3.utils.toBN(multiDataRain.userAllowance))){
      alert("Must approve RAIN before you stake.")
      return
    }
    if(stakeValueBN.gt(web3.utils.toBN(multiDataH3x.userAllowance))){
      alert("Must approve H3X before you stake.")
      return
    }
    if(stakeValueBN.mul(web3.utils.toBN(4)).gt(web3.utils.toBN(shortenDecimal(multiDataH3rx.userRain)))){
      alert("Not enough Rain. Requires 4x Base.")
      return
    }
    if(stakeValueBN.gt(web3.utils.toBN(shortenDecimal(multiDataH3rx.userH3x)))){
      alert("Not enough H3X. Requires 1x Base.")
      return
    }
    await h3rainxContract.methods.buy(web3.utils.toWei(web3.utils.toBN(requestValue.toString()),'ether'),referralAddress).send({from:accounts[0]})
  }

  return (
    <>
      <Heading mb="20px">Stake</Heading>
      <Text fontSize="sm" p="20px">Remember - you will need 4 RAIN for every 1 H3X to make H3RainX.</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $RAIN</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userRain)}</Text>
      <Link fontSize="sm" w="200px" color="teal.200" href={"https://uniswap.exchange/swap?outputCurrency="+addresses.rain}>buy on uniswap</Link>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $H3X</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userH3x)}</Text>
      <Link fontSize="sm" w="200px" color="teal.200" href={"https://uniswap.exchange/swap?outputCurrency="+addresses.h3x}>buy on uniswap</Link>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Approved $RAIN</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataRain.userAllowance)}</Text>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Approved $H3X</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3x.userAllowance)}</Text>
      <br/>
      <Text fontSize="lg" p="10px" mt="20px" textAlign="center">BASE:</Text>
      <NumberInput value={stakeValue} min={1} max={1000000000}   w="50%" ml="auto" mr="auto" color="gray.700" >
        <NumberInputField onChange={e => {setStakeValue(e.target.value)}} />
      </NumberInput>
      <Text fontSize="lg" p="10px" pb="0px"  textAlign="center">
        Receive
        {web3 ?
          " "+(stakeValue * 0.9 * 0.9 )+" "
          :
          " 0.00 "
        }
        $H3RX
      </Text>
      <Text fonSize="sm" textAlign="center">includes H3X and Rain network taxes</Text>
      <Button mt="20px" variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="250px" onClick={handleApproveRain}>Approve 4xBASE $RAIN</Button>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="250px" onClick={handleApproveH3x}>Approve 1xBASE $H3X</Button>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="250px" onClick={handleStake}>Stake</Button>
    </>
  )

}
