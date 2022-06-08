'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const fs = require("fs");
const { Contract } = require('fabric-contract-api');

class PolicyExample extends Contract {

    async InitLedger(ctx) {
        // TODO use a env var for the path CHAINCODE_DIR=/usr/local/src
        const policyRego = fs.readFileSync("/usr/local/src/policy/policy.rego");
        const policyWasm = fs.readFileSync("/usr/local/src/policy/policy.wasm");

        const policies = [
            {
                ID: 'project.1234',
                rego: policyRego.toString('utf8'),
                binBase64: policyWasm.toString('base64')
            }
        ]

        for (const policy of policies) {
            policy.docType = 'policy';
            await ctx.stub.putState(policy.ID, Buffer.from(stringify(sortKeysRecursive(policy))));
        }
    }

    async ReadPolicyById(ctx, id) {
        const policyJSON = await ctx.stub.getState(id);
        if (!policyJSON || policyJSON.length === 0) {
            throw new Error(`The policy ${id} does not exist`);
        }
        return policyJSON.toString();
    }

    async ReadAllPolicies(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}

module.exports = PolicyExample;
