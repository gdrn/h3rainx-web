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

export default function Unstake({ multiDataRain, multiDataGdrn, web3, accounts, provider, rainContract, goldRainContract }) {

  const [unstakeValue,setUnstakeValue] = useState(1000)

  const handleUnstakeRain = async () => {
    const unstakeValueBN = web3.utils.toBN(unstakeValue)
    if(unstakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must unstake at least 1 GDRN.")
      return
    }
    console.log(web3.utils.toBN(multiDataRain.userAllowance))
    console.log(unstakeValueBN)
    if(unstakeValueBN.gt(web3.utils.toBN(multiDataGdrn.userGdrn))){
      alert("Cannot unstake more than you hold.")
      return
    }
    await goldRainContract.methods.sell(web3.utils.toWei(unstakeValueBN,'ether')).send({from:accounts[0]})
  }

  return (
    <>
      <Heading mb="20px">Unstake</Heading>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $GDRN</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userGdrn)}</Text>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet Stake %</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userPct)}%</Text>
      <br/>
      <Text fontSize="lg" p="10px" mt="20px" textAlign="center">$GDRN:</Text>
      <NumberInput value={unstakeValue} min={1} max={1000000000}   w="50%" ml="auto" mr="auto" color="gray.700" >
        <NumberInputField onChange={e => {setUnstakeValue(e.target.value)}} />
      </NumberInput>
      <Text fontSize="lg" p="10px" pb="0px" textAlign="center">
        Receive
        {web3 ?
          " "+(unstakeValue * multiDataGdrn.sellPrice )+" "
          :
          " 0.00 "
        }
        $RAIN
      </Text>
      <Text fontSize="sm" mb="20px" textAlign="center" color="gray.200" mt="0px">received RAIN will be available in Dividends</Text>
      <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleUnstakeRain}>Unstake</Button>
    </>
  )
}
