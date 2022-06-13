'use strict';

const { Contract } = require('fabric-contract-api');
const { loadPolicy } = require("@open-policy-agent/opa-wasm");

class AccessControl extends Contract {

    async requestAccess(ctx) {
        // TODO args
        let input = {
            "action": "read",
            "resource": "patient_data_eve",
            "user": "alice"
        };

        const channelId = 'mychannel';
        const projectId = 'project.1234';
        const chaincode = 'PolicyExample';

        const policy = await this.retrievePolicy(ctx, chaincode, projectId, channelId);
        const user_attributes = await this.retrieveUserAttributes(ctx, chaincode, input.user, channelId);
        const data_attributes = await this.retrieveResourceAttributes(ctx, chaincode, input.resource, channelId);
        await this.eval(ctx, policy, input, user_attributes, data_attributes);
    }

    async retrievePolicy(ctx, chaincode, projectId, channelId) {
        const chaincodeResponse = await ctx.stub.invokeChaincode(chaincode, ['readPolicyById', projectId], channelId);
        return chaincodeResponse.payload.toString('utf8');
    }

    async retrieveUserAttributes(ctx, chaincode, userId, channelId) {
        const chaincodeResponse = await ctx.stub.invokeChaincode(chaincode, ['readUserAttributesById', userId], channelId);
        return chaincodeResponse.payload.toString('utf8');
    }

    async retrieveResourceAttributes(ctx, chaincode, resourceId, channelId) {
        const chaincodeResponse = await ctx.stub.invokeChaincode(chaincode, ['readResourceAttributesById', resourceId], channelId);
        return chaincodeResponse.payload.toString('utf8');
    }

    async eval(ctx, policyString, input, user_attributes, data_attributes) { 
        const allowed = await loadPolicy(Buffer.from(JSON.parse(policyString).binBase64, 'base64')).then((policy) => {

            policy.setData({
                "data_attributes": JSON.parse(data_attributes),
                "user_attributes": JSON.parse(user_attributes)
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
