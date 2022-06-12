'use strict';

const { Contract } = require('fabric-contract-api');
const { loadPolicy } = require("@open-policy-agent/opa-wasm");

class AccessControl extends Contract {

    async RequestAccess(ctx) {
        // TODO args
        let input = {
            "action": "read",
            "resource": "patient_data_eve",
            "user": "alice"
        };

        const channelId = 'mychannel';
        const projectId = 'project.1234';
        const chaincode = 'PolicyExample';

        const policy = await this.RetrievePolicy(ctx, chaincode, projectId, channelId);
        await this.AuthDecision(ctx, policy, input);
    }

    async RetrievePolicy(ctx, chaincode, projectId, channelId) {
        const chaincodeResponse = await ctx.stub.invokeChaincode(chaincode, ['ReadPolicyById', projectId], channelId);
        return chaincodeResponse.payload.toString('utf8');
    }

    async RetrieveUserAttributes(ctx, userId) {
        // TODO
    }

    async RetrieveResourceAttributes(ctx, resourceId) {
        // TODO
    }

    async AuthDecision(ctx, policyString, input) { 
        const allowed = await loadPolicy(Buffer.from(JSON.parse(policyString).binBase64, 'base64')).then((policy) => {

             // TODO retrieve attrs from PIP
            policy.setData({
                "data_attributes": {
                    "patient_data_bob": {
                        "doctor": "alice",
                        "legal_guardian": "john",
                        "patient": "bob"
                    },
                    "patient_data_eve": {
                        "doctor": "alice",
                        "legal_guardian": "john",
                        "patient": "eve"
                    }
                },
                "user_attributes": {
                    "alice": {
                        "role": "doctor"
                    },
                    "bob": {
                        "role": "patient"
                    },
                    "dave": {
                        "role": "data_analyst"
                    },
                    "eve": {
                        "role": "patient"
                    },
                    "john": {
                        "role": "legal_guardian"
                    }
                }
            });

            const resultSet = policy.evaluate(input);
            if (resultSet == null) {
                console.error("evaluation error");
            }
            if (resultSet.length == 0) {
                console.log("undefined");
            }
            console.log(resultSet);
            return resultSet;
        }).catch((error) => {
            console.error("Failed to load policy: ", error);
        });

        return allowed;
    }

}

module.exports = AccessControl;
