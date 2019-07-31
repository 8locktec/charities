var Charities = artifacts.require('Charities')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('Charities', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]

    const charityPrice = 100000000000000000
    let instance

    const charity1 = {
        description: "charity 1 description",
        patron: firstAccount,
        totalDonationsAvailable: 40,
        price: "100000000000000000",
        serviceProvider: secondAccount,
        closingBlock: "200000",
        isOpen: false

    }


    beforeEach(async () => {
        instance = await Charities.new()
    })

    describe("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, deployAccount, "the deploying address should be the owner")

        })
    })

    describe("Functions", () => {
        describe("addCharity()", async() =>{
          it("only the owner should be able to add a charity", async() => {
              await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
              await catchRevert(instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: firstAccount}))
          })

		  it("adding a charity  should emit an charity with the provided charity details", async() => {
                const tx = await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                const charityData = tx.logs[0].args
                assert.equal(charityData.desc, charity1.description, "the added charity descriptions should match")
                assert.equal(charityData.totalDonationsAvailable.toString(10), charity1.totalDonationsAvailable.toString(10), "the added totalDonationsAvailableAvailable should match")
                assert.equal(charityData.price, charity1.price, "the added charity price should match")
                assert.equal(charityData.patron, charity1.patron, "the added charity patron should match")
                assert.equal(charityData.serviceProvider, charity1.serviceProvider, "the added charity serviceProvider should match")
                assert.equal(charityData.closingBlock, charity1.closingBlock, "the added charity closingBlock should match")

            })


        })
    })

    describe("readCharity()", async() =>{
            it("providing the charity Id should return the correct charity details", async() => {
                await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                const charityDetails = await instance.readCharity(0)

                assert.equal(charityDetails['0'], charity1.description, "the added charity descriptions should match")
                assert.equal(charityDetails['1'].toString(10), charity1.totalDonationsAvailable, "the added patron should match")
                assert.equal(charityDetails['4'], charity1.serviceProvider, "the added charity serviceProvider should match")
                assert.equal(charityDetails['5'], charity1.closingBlock, "the added charity closingBlock should match")


            })
        })

        describe("donateCharity()", async() =>{
                it("charitys should only be able to be purchased when the charity is open", async() => {
                    const numberOfCharity = 1

                    // charity w/ id 1 does not exist, therefore not open
                    await catchRevert(instance.donateToCharity(1, numberOfCharity, {from: firstAccount, value: charityPrice}))

                    await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    await instance.donateToCharity(0, numberOfCharity, {from: firstAccount, value: charityPrice})

                    const charityDetails = await instance.readCharity(0)
                    assert.equal(charityDetails['2'].toString(10), numberOfCharity, `the charity sales should be ${numberOfCharity} `)
                })

                it("charitys should only be able to be purchased when enough value is sent with the transaction", async() => {
                    const numberOfCharity = 1
                    await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    await catchRevert(instance.donateToCharity(0, numberOfCharity, {from: firstAccount, value: 0}))
                })

                //it("charitys should only be able to be purchased when there are enough charitys remaining", async() => {
                  //  await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    //await instance.donateToCharity(0, 51, {from: firstAccount, value: 5100000000000000000})
                    //await catchRevert(instance.donateToCharity(0, 51, {from: secondAccount, value: 5100000000000000000}))
                //})

                it("a LogdonateToCharity() charity with the correct details should be emitted when charitys are purchased", async() => {
                    const numDonations = 1

                    await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    const tx = await instance.donateToCharity(0, numDonations, {from: firstAccount, value: 100000000000000000})
                    const charityData = tx.logs[0].args

                    assert.equal(charityData.donator, firstAccount, "the buyer account should be the msg.sender" )
                    assert.equal(charityData.charityId, 0, "the charity should have the correct charityId")
                    assert.equal(charityData['2'].toString(10), numDonations, "the charity should have the correct number of charitys donated")
                })
            })

            describe("closeCharity()", async() => {
                it("only the owner should be able to end the charity and mark it as closed", async() => {
                    await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    await catchRevert(instance.closeCharity(0, {from: firstAccount}))
                    const txResult = await instance.closeCharity(0, {from: deployAccount})
                    const charityDetails = await instance.readCharity(0)

                    assert.equal(charityDetails.isOpen, false, `The charity isOpen variable should be marked false. ${charityDetails[0]} ${charityDetails[1]} ${charityDetails[2]} ${charityDetails[3]} ${charityDetails[4]} ${charityDetails[5]} ${charityDetails[6]} ${charityDetails[7]} ${charityDetails[8]} ${charityDetails[9]}`)
                })

                it("closeCharity() should emit an event with information about how much ETH was sent to the serviceProvider", async() => {
                    const numberToDonate = 3

                    await instance.addCharity(charity1.description, charity1.patron, charity1.totalDonationsAvailable, charity1.price, charity1.serviceProvider, charity1.closingBlock, {from: deployAccount} )
                    await instance.donateToCharity(0, numberToDonate, {from: secondAccount, value: 300000000000000000})
                    await instance.consumeDonation(0, numberToDonate, {from: deployAccount})

                    const txResult = await instance.closeCharity(0, {from: deployAccount})

                    const amount = txResult.logs[0].args['1'].toString()


                    assert.equal(amount, charityPrice*numberToDonate, `the first emitted event should contain the tranferred amount as the second parameter ${txResult[0]} ${txResult[1]} ${txResult[2]} ${txResult[3]} ` )
                })
            })

})
