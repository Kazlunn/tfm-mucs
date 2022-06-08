'use strict';

const { Contract } = require('fabric-contract-api');
const { loadPolicy } = require("@open-policy-agent/opa-wasm");

class AccessControl extends Contract {

    async RequestAccess(ctx) {
        let input = { message: "world" };
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

    async RetrieveSubjectAttributes(ctx, subjectId) {

    }

    async RetrieveResourceAttributes(ctx, resourceId) {

    }

    async AuthDecision(ctx, policyString, input) { 
        const allowed = await loadPolicy(Buffer.from(JSON.parse(policyString).binBase64, 'base64')).then((policy) => {
            policy.setData({ world: "world" }); // TODO pass as arg

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
