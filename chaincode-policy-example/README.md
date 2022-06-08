```console
opa build -t wasm -e example/hello example.rego
```

```console
tar -xzf bundle.tar.gz /policy.wasm
```

```console
./network.sh deployCC -ccn PolicyExample -ccp /home/kazlunn/tfm-mucs/chaincode-policy-example -ccl javascript
```

```console
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n PolicyExample --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'
```

```console
peer chaincode query -C mychannel -n PolicyExample -c '{"Args":["ReadAllPolicies"]}'
```

```console
peer chaincode query -C mychannel -n PolicyExample -c '{"Args":["ReadPolicyById", "project.1234"]}'
```
