'use strict';

const { Contract } = require('fabric-contract-api');
const { loadPolicy } = require('@open-policy-agent/opa-wasm');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');

class AccessControl extends Contract {

    async requestAccess(ctx, inputStr) {
        const channelId = 'mychannel';
        const input = JSON.parse(inputStr);

        const policy = await this.retrievePolicy(ctx, input.project, input.project, channelId);
        const user_attributes = await this.retrieveUserAttributes(ctx, input.project, input.user, channelId);
        const data_attributes = await this.retrieveResourceAttributes(ctx, input.project, input.resource, channelId);
        return await this.eval(ctx, policy, input, user_attributes, data_attributes);
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
        const policy = await loadPolicy(Buffer.from(JSON.parse(policyString).binBase64, 'base64'));

        policy.setData({
            data_attributes: JSON.parse(data_attributes),
            user_attributes: JSON.parse(user_attributes)
        });

        const resultSet = policy.evaluate(input);
        if (resultSet === null) {
            throw new Error('evaluation error');
        }
        if (resultSet.length === 0) {
            throw new Error('undefined');
        }

        let now = new Date().getTime();
        await ctx.stub.putState(now.toString(), Buffer.from(stringify(sortKeysRecursive({
            input: input,
            user_attributes: user_attributes,
            data_attributes: data_attributes,
            decision: resultSet[0].result,
            timestamp: now.toString()
        }))));

        return resultSet[0].result;
    }

}

module.exports = AccessControl;
