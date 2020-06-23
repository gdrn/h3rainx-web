import React, { useState, useEffect } from "react";
import { addresses, abis } from "@project/contracts";
import { Heading, Text, Button,
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

export default function Stake({ multiDataRain, multiDataGdrn, web3, accounts, provider, rainContract, goldRainContract }) {

  const [stakeValue, setStakeValue] = useState(1000)

  let referralAddress = window.location.hash.substr(2);
  if(!referralAddress || referralAddress.length !== 42 ) referralAddress = "0x0000000000000000000000000000000000000000"

  const handleApproveRain = async () => {
    const stakeValueBN = web3.utils.toBN(stakeValue)
    if(stakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must stake at least 1 RAIN.")
      return
    }
    await rainContract.methods.approve(addresses.goldenRain,web3.utils.toWei(stakeValueBN,'ether')).send({from:accounts[0]})
  }

  const handleStakeRain = async () => {
    const stakeValueBN = web3.utils.toBN(stakeValue)
    if(stakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must stake at least 1 RAIN.")
      return
    }
    if(stakeValueBN.gt(web3.utils.toBN(multiDataRain.userAllowance))){
      alert("Must approve RAIN before you stake.")
      return
    }
    await goldRainContract.methods.buy(web3.utils.toWei(stakeValueBN,'ether'),referralAddress).send({from:accounts[0]})
  }

  return (
    <>
      <Heading mb="20px">Stake</Heading>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $RAIN</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userRain)}</Text>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Approved $RAIN</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataRain.userAllowance)}</Text>
      <br/>
      <Text fontSize="lg" p="10px" mt="20px" textAlign="center">$RAIN:</Text>
      <NumberInput value={stakeValue} min={1} max={1000000000}   w="50%" ml="auto" mr="auto" color="gray.700" >
        <NumberInputField onChange={e => {setStakeValue(e.target.value)}} />
      </NumberInput>
      <Text fontSize="lg" p="10px" pb="0px" mb="0px" textAlign="center">
        Receive
        {web3 ?
          " "+(stakeValue * multiDataGdrn.sellPrice )+" "
          :
          " 0.00 "
        }
        $GDRN
      </Text>
      <Text fontSize="sm" mb="20px" textAlign="center" color="gray.200" mt="0px">received RAIN will be available in Dividends</Text>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleApproveRain}>Approve $RAIN</Button>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleStakeRain}>Stake $RAIN</Button>
    </>
  )

}
