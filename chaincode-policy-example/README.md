# ChainCode Policy Example

## Generar binario a partir de fichero .rego
```console
opa build -t wasm -e abac/allow policy.rego
```

## Extraer binario
```console
tar -xzf bundle.tar.gz /policy.wasm
```

## Desplegar CC
```console
./network.sh deployCC -ccn PolicyExample -ccp /home/kazlunn/tfm-mucs/chaincode-policy-example -ccl javascript
```

## * Test-Network
```console
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

## Inicializar la política definida en el CC
```console
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n PolicyExample --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"initLedger","Args":[]}'
```

## Recuperar una política por identificador de proyecto
```console
peer chaincode query -C mychannel -n PolicyExample -c '{"Args":["readPolicyById", "project.1234"]}'
```

## Recuperar los atributos de un usuario a partir de su identificador
```console
peer chaincode query -C mychannel -n PolicyExample -c '{"Args":["readUserAttributesById", "bob"]}'
```

## Recuperar los atributos de un recurso a partir de su identificador
```console
peer chaincode query -C mychannel -n PolicyExample -c '{"Args":["readResourceAttributesById", "patient_data_eve"]}'
```
