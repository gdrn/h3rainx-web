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

export default function Unstake({
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

  const [unstakeValue,setUnstakeValue] = useState(1000)

  const handleUnstakeRain = async () => {
    const unstakeValueBN = web3.utils.toBN(unstakeValue)
    if(unstakeValueBN.lt(web3.utils.toBN(1))) {
      alert("Must unstake at least 1 H3RX.")
      return
    }
    const userH3rxWei = web3.utils.toBN(web3.utils.toWei(multiDataH3rx.userH3rx,"ether"))
    const unstakeValueBNWei = web3.utils.toBN(web3.utils.toWei(unstakeValueBN))
    if(unstakeValueBNWei.gt(userH3rxWei)){
      alert("Cannot unstake more than you hold.")
      return
    }
    await h3rainxContract.methods.sell(web3.utils.toWei(unstakeValueBN,'ether')).send({from:accounts[0]})
  }

  return (
    <>
      <Heading mb="20px">Unstake</Heading>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet $H3RX</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userH3rx)}</Text>
      <br/>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">Wallet Stake %</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataH3rx.userPct)}%</Text>
      <br/>
      <Text fontSize="lg" p="10px" mt="20px" textAlign="center">$H3RX:</Text>
      <NumberInput value={unstakeValue} min={1} max={1000000000}   w="50%" ml="auto" mr="auto" color="gray.700" >
        <NumberInputField onChange={e => {setUnstakeValue(e.target.value)}} />
      </NumberInput>
      <Text fontSize="lg" p="10px" pb="0px" textAlign="center">
        Receive
        {web3 ?
          " "+(unstakeValue * 0.9 * 0.99 * 4 )+" "
          :
          " 0.00 "
        }
        $RAIN
      </Text>
      <Text fontSize="lg" p="10px" pb="0px" textAlign="center">
        Receive
        {web3 ?
          " "+(unstakeValue * 0.9 * 0.9 )+" "
          :
          " 0.00 "
        }
        $H3x
      </Text>
      <Text fontSize="sm" mb="20px" textAlign="center" color="gray.200" mt="0px">received RAIN + H3X will be available in Dividends</Text>
      <Button variant="solid" bg="teal.500" ml="auto" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleUnstakeRain}>Unstake</Button>
    </>
  )
}
