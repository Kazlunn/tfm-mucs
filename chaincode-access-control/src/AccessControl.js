'use strict';

const { Contract } = require('fabric-contract-api');
const { loadPolicy } = require("@open-policy-agent/opa-wasm");

class AccessControl extends Contract {

    async requestAccess(ctx, inputStr) {
        const channelId = 'mychannel';
        const input = JSON.parse(inputStr);

        const policy = await this.retrievePolicy(ctx, input.project, input.project, channelId);
        const user_attributes = await this.retrieveUserAttributes(ctx, input.project, input.user, channelId);
        const data_attributes = await this.retrieveResourceAttributes(ctx, input.project, input.resource, channelId);
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
