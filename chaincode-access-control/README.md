# ChainCode Access Control

## Desplegar CC
```console
./network.sh deployCC -ccn AccessControl -ccp /home/kazlunn/tfm-mucs/chaincode-access-control -ccl javascript
```

## Petición de acceso
```console
peer chaincode query -C mychannel -n AccessControl -c '{"Args":["requestAccess"]}'
```


peer chaincode query -C mychannel -n AccessControl -c '{"Args":["requestAccess", "{\"action\":\"read\",\"resource\":\"patient_data_eve\",\"user\":\"alice\",\"project\":\"ProjectAlpha\"}"]}'
