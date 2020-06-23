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

export default function Dividends({ multiDataRain, multiDataGdrn, web3, accounts, provider, rainContract, goldRainContract }) {

  const handleWithdraw = async () => {
    await goldRainContract.methods.withdraw().send({from:accounts[0]})
  }

  const handleReinvest = async () => {
    await goldRainContract.methods.reinvest().send({from:accounts[0]})
  }

  return (
    <>
      <Heading mb="20px">Dividends</Heading>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block">$RAIN Dividends</Text>
      <Text fontSize="lg" w="200px" p="10px" display="inline-block" textAlign="right">{shortenDecimal(multiDataGdrn.userDivs,2)}</Text>
      <br/>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleReinvest}>Reinvest</Button>
      <Button variant="solid" bg="teal.500" display="block" m="10px" ml="auto" mr="auto" width="150px" onClick={handleWithdraw}>Withdraw</Button>
    </>
  )
}
