'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const ProjectAlpha = require('../src/ProjectAlpha.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Project Alpha Tests', () => {
    let transactionContext, chaincodeStub;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield {value: copied[key]};
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });
    });

    describe('Test initLedger', () => {
        it('should return error on initLedger', async () => {
            chaincodeStub.putState.rejects('failed inserting key');
            let projectAlpha = new ProjectAlpha();
            try {
                await projectAlpha.initLedger(transactionContext);
                assert.fail('InitLedger should have failed');
            } catch (err) {
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return success on initLedger', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);
            let ret = JSON.parse((await chaincodeStub.getState('ProjectAlpha')).toString());
            expect(ret.docType).to.eql('policy');
        });
    });

    describe('Test readPolicyById', () => {
        it('should return error on readPolicyById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            try {
                await projectAlpha.readPolicyById(transactionContext, 'wrongPolicyId');
                assert.fail('readPolicyById should have failed');
            } catch (err) {
                expect(err.message).to.equal('The policy wrongPolicyId does not exist');
            }
        });

        it('should return success on readPolicyById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            let ret = JSON.parse(await chaincodeStub.getState('ProjectAlpha'));
            expect(ret.docType).to.eql('policy');
        });
    });

    describe('Test readUserAttributesById', () => {
        it('should return error on readUserAttributesById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            try {
                await projectAlpha.readUserAttributesById(transactionContext, 'wrongUserId');
                assert.fail('readUserAttributesById should have failed');
            } catch (err) {
                expect(err.message).to.equal('The user with id wrongUserId does not exist');
            }
        });

        it('should return success on readUserAttributesById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            let ret = JSON.parse(await chaincodeStub.getState('user_attributes_alice'));
            expect(ret.role).to.eql('doctor');
        });
    });

    describe('Test readResourceAttributesById', () => {
        it('should return error on readResourceAttributesById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            try {
                await projectAlpha.readResourceAttributesById(transactionContext, 'wrongResourceId');
                assert.fail('readResourceAttributesById should have failed');
            } catch (err) {
                expect(err.message).to.equal('The data with id wrongResourceId does not exist');
            }
        });

        it('should return success on readResourceAttributesById', async () => {
            let projectAlpha = new ProjectAlpha();
            await projectAlpha.initLedger(transactionContext);

            let ret = JSON.parse(await chaincodeStub.getState('data_attributes_patient_data_bob'));
            expect(ret).to.eql({
                doctor: 'alice',
                legal_guardian: 'john',
                patient: 'bob'
            });
        });
    });

});