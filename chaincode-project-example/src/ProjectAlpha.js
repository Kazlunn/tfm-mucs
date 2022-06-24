'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const fs = require('fs');
const { Contract } = require('fabric-contract-api');
require('dotenv').config();

class ProjectAlpha extends Contract {

    async initLedger(ctx) {
        const policyRego = fs.readFileSync(process.env.CHAINCODE_DIR + '/policy/policy.rego');
        const policyWasm = fs.readFileSync(process.env.CHAINCODE_DIR + '/policy/policy.wasm');
        const data_attributes = JSON.parse(fs.readFileSync(process.env.CHAINCODE_DIR + '/abac/data_attributes.json'));
        const user_attributes = JSON.parse(fs.readFileSync(process.env.CHAINCODE_DIR + '/abac/user_attributes.json'));

        const policies = [
            {
                ID: 'ProjectAlpha',
                rego: policyRego.toString('utf8'),
                binBase64: policyWasm.toString('base64')
            }
        ];

        for (const policy of policies) {
            policy.docType = 'policy';
            await ctx.stub.putState(policy.ID, Buffer.from(stringify(sortKeysRecursive(policy))));
        }

        for (const userId of Object.keys(user_attributes)) {
            await ctx.stub.putState('user_attributes_' + userId, Buffer.from(stringify(user_attributes[userId])));
        }

        for (const resourceId of Object.keys(data_attributes)) {
            await ctx.stub.putState('data_attributes_' + resourceId, Buffer.from(stringify(data_attributes[resourceId])));
        }
    }

    async readPolicyById(ctx, id) {
        const policyJSON = await ctx.stub.getState(id);
        if (!policyJSON || policyJSON.length === 0) {
            throw new Error(`The policy ${id} does not exist`);
        }
        return policyJSON.toString();
    }

    async readUserAttributesById(ctx, id) {
        const userAttributes = await ctx.stub.getState('user_attributes_' + id);
        if (!userAttributes || userAttributes.length === 0) {
            throw new Error(`The user with id ${id} does not exist`);
        }
        let result = {};
        result[id] = JSON.parse(userAttributes.toString());
        return JSON.stringify(result);
    }

    async readResourceAttributesById(ctx, id) {
        const resourceAttributes = await ctx.stub.getState('data_attributes_' + id);
        if (!resourceAttributes || resourceAttributes.length === 0) {
            throw new Error(`The data with id ${id} does not exist`);
        }
        let result = {};
        result[id] = JSON.parse(resourceAttributes.toString());
        return JSON.stringify(result);
    }

}

module.exports = ProjectAlpha;
