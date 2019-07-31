pragma solidity ^0.5.0;

    /*
        The Charities contract keeps track of the charities.
     */
contract Charities {

    /*
      Public owner variable which is set to the creator of the contract when it is initialized.
    */
    address public owner ;

    /*
      A charity has 5 states:
      Pending = during creation ()
      Active = after a charity is added
      Finished = if the some of the donations cannot be consumed we can refund the donation.
    */
    enum CharityStatus  {Pending, Active, Finished}

    /*
        The variable to keep track of the charity ID numbers.
    */
    uint public idGenerator;

    /*
        Charity struct, which has 10 fields.
        The "patron" is the NGO which is observing the charity.
        The "serviceProvider" is the beneficiary serving the charityItems.
        The "closingBlock" defines the end of donations accepted (not implemented yet)
        The "donators" keeps track of addresses and how many of the open donations each donator has purchased.
    */
    struct Charity {
        string description;
        uint totalDonations;
        uint soldDonations;
        uint consumedDonations;
        uint refundedDonations;
        uint price;
        address patron;
        address payable serviceProvider;
        uint closingBlock;
        mapping (address => uint) donators;
        CharityStatus status;
        bool isOpen;
    }

    /*
        This mapping keeps track of all charities.
    */
    mapping (uint => Charity) charities;

    event LogCharityAdded(string desc, address patron, uint price, address serviceProvider, uint closingBlock, uint totalDonationsAvailable, uint charityId);
    event LogCharityDonated(address donator, uint charityId, uint donations, uint msgvalue);
    event LogCharityRefunded(address accountRefunded, uint eventId, uint donations);
    event LogEndCharity(address serviceProvider, uint balance, uint eventId);
    event LogDonationConsumed(uint charityId, uint donations);


    constructor() public {
        owner= msg.sender;
    }

    /*
        A modifier that throws an error if the msg.sender is not the owner.
    */
    modifier isMsgSenderOwner() {
      require(msg.sender == owner);
      _;
    }

    /*

        Adds a new charity to the contract.
    */
    function addCharity(string memory _description, address _patron, uint _totalDonations, uint _price, address payable _serviceProvider, uint _closingBlock) public payable isMsgSenderOwner() returns (uint charityID)  {
      charities[idGenerator].description = _description;
      charities[idGenerator].patron = _patron;
      charities[idGenerator].totalDonations = _totalDonations;
      charities[idGenerator].price = _price;
      charities[idGenerator].serviceProvider = _serviceProvider;
      charities[idGenerator].closingBlock = _closingBlock;
      charities[idGenerator].isOpen = true;
      charities[idGenerator].status = CharityStatus.Active;
      emit LogCharityAdded(_description, _patron, _price, _serviceProvider, _closingBlock, _totalDonations, idGenerator);
      idGenerator +=1;

      return idGenerator-1;

    }

    /*
      Returns a charity with the given charityID.
    */
    function readCharity(uint charityID) public view
        returns(string memory description, uint totalDonations, uint soldDonations, uint consumedDonations, address serviceProvider, uint closingBlock, bool isOpen) {
            return(charities[charityID].description, charities[charityID].totalDonations, charities[charityID].soldDonations, charities[charityID].consumedDonations , charities[charityID].serviceProvider, charities[charityID].closingBlock, charities[charityID].isOpen);

    }


    /*

        This function allows users to donate to a specific charity with given id.
        This function takes 2 parameters, an charity ID and a number of donations.

    */
    function donateToCharity(uint charityID, uint nrOfDonations) public payable {
        require(charities[charityID].isOpen == true);
        require(msg.value >= nrOfDonations* charities[charityID].price );
        require(charities[charityID].totalDonations-charities[charityID].soldDonations >= nrOfDonations);
        charities[charityID].donators[msg.sender]+=nrOfDonations;
        charities[charityID].soldDonations += nrOfDonations;
        uint totalPrice = nrOfDonations * charities[charityID].price;
        uint change = msg.value - totalPrice;
        msg.sender.transfer(change);
        emit LogCharityDonated(msg.sender, charityID, nrOfDonations, msg.value);
    }

    /*

        This function allows users to request a refund for a specific charity.
        It is checked if there are refunds available.
        This function takes one parameter, the event ID.

    */
    function getRefund(uint charityID) public payable {
        require(charities[charityID].status == CharityStatus.Finished);
        uint senderRefundableDonations= charities[charityID].donators[msg.sender];
        require(senderRefundableDonations > 0);
        uint totalRefundableDonations = charities[charityID].totalDonations - charities[charityID].consumedDonations - charities[charityID].refundedDonations ;
        require(totalRefundableDonations > 0);
        uint calculatedRefundableDonations;
        if(senderRefundableDonations> totalRefundableDonations) {
          calculatedRefundableDonations = totalRefundableDonations;
        } else {
          calculatedRefundableDonations = senderRefundableDonations;
        }

        charities[charityID].soldDonations-=calculatedRefundableDonations;
        charities[charityID].donators[msg.sender]-=calculatedRefundableDonations;
        charities[charityID].refundedDonations+=calculatedRefundableDonations;
        msg.sender.transfer(calculatedRefundableDonations * charities[charityID].price);
        emit LogCharityRefunded(msg.sender, charityID, calculatedRefundableDonations);
    }

    /*
        This function takes one parameter, a charity ID
        This function returns a uint, the number of donations that the msg.sender has purchased.
    */
    function getDonationNumberForDonator(uint charityID) public view
        returns(uint donatedCharities) {

            return (charities[charityID].donators[msg.sender]);
    }

    /*
      Represents a confirmation of a consumation.
      It takes a charity ID and a number of donations as parameters.
      Only the contract owner can call this function.
    */
    function consumeDonation(uint charityID, uint donations) public isMsgSenderOwner {
      require(charities[charityID].status == CharityStatus.Active);
      require(charities[charityID].soldDonations - charities[charityID].consumedDonations - donations >= 0);
      charities[charityID].consumedDonations+= donations;
      emit LogDonationConsumed(charityID, donations);
    }

    /*

        This function takes one parameter, the charity ID
        Only the contract owner can call this function

    */
    function closeCharity(uint charityID) public payable isMsgSenderOwner {
        require(charities[charityID].isOpen == true);
        charities[charityID].isOpen = false;
        charities[charityID].status = CharityStatus.Finished;

        uint balance = (charities[charityID].consumedDonations * charities[charityID].price);
        charities[charityID].serviceProvider.transfer(balance);
        emit LogEndCharity(charities[charityID].serviceProvider, balance, charityID);
    }


}
