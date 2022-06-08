```console
./network.sh deployCC -ccn AccessControl -ccp /home/kazlunn/tfm-mucs/chaincode-access-control -ccl javascript
```

```console
peer chaincode query -C mychannel -n AccessControl -c '{"Args":["RequestAccess"]}'
```