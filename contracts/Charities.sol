pragma solidity ^0.5.0;

/**  @title The Charities contract keeps track of the charities. */
contract Charities {

    /*
      Public owner variable which is set to the creator of the contract when it is initialized.
    */
    address public owner ;

    /*
      A charity has 3 states:
      Pending = during creation
      Active = after a charity is added
      Finished = finished if closed, and if the some of the donations cannot be consumed we can refund the donation.
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

    /** @dev Adds a new charity to the contract.
      * @param _description description of the charity
      * @param _patron a patron for the charity (logic not implemented yet)
      * @param _totalDonations number of available donations for this charity
      * @param _price price in wei for each charity item
      * @param _serviceProvider the service provider which serves the charity item (and gets paid for served items)
      * @param _closingBlock closing block for the donation (logic not implemented yet)
      * @return charityID
    */
    function addCharity(string memory _description, address _patron, uint _totalDonations, uint _price, address payable _serviceProvider, uint _closingBlock) public payable isMsgSenderOwner() returns (uint charityID)  {
      require( _totalDonations > 0 && _serviceProvider != 0x0000000000000000000000000000000000000000 && _price > 0 );
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

    /** @dev Returns charity members values with the given charityID.
      * @param charityID ID of the charity to read
      * @return description description of the charity
      * @return totalDonations number of available donations for this charity
      * @return soldDonations number of sold donations for this charity
      * @return consumedDonations number of consumed donations for this charity
      * @return serviceProvider he service provider which serves the charity item (and gets paid for served items)
      * @return closingBlock  closing block for the donation (logic not implemented yet)
      * @return isOpen status variable
    */
    function readCharity(uint charityID) public view
        returns(string memory description, uint totalDonations, uint soldDonations, uint consumedDonations, address serviceProvider, uint closingBlock, bool isOpen) {
            return(charities[charityID].description, charities[charityID].totalDonations, charities[charityID].soldDonations, charities[charityID].consumedDonations , charities[charityID].serviceProvider, charities[charityID].closingBlock, charities[charityID].isOpen);

    }

    /** @dev This function allows users to donate to a specific charity with given id.
      * @param charityID ID of the charity to read
      * @param nrOfDonations how many of the donation should be buyed
    */
    function donateToCharity(uint charityID, uint nrOfDonations) public payable {
        require(nrOfDonations > 0);
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

    /** @dev This function allows users to request a refund for a specific charity. There are check to see if there are refunds available.
      * @param charityID ID of the charity to read
    */
    function getRefund(uint charityID) public payable {
        require(charities[charityID].status == CharityStatus.Finished);
        require(charities[charityID].donators[msg.sender] > 0);
        int refundable = int(charities[charityID].totalDonations - charities[charityID].consumedDonations - charities[charityID].refundedDonations);
        require(refundable > 0);
        uint senderRefundableDonations= charities[charityID].donators[msg.sender];
        uint totalRefundableDonations = charities[charityID].totalDonations - charities[charityID].consumedDonations - charities[charityID].refundedDonations ;
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


    /** @dev This function allows to get the nr of donations for a given charityID for the msg sender
      * @param charityID ID of the charity
    */
    function getDonationNumberForDonator(uint charityID) public view
        returns(uint donatedCharities) {
            require(charities[charityID].donators[msg.sender] > 0);
            return (charities[charityID].donators[msg.sender]);
    }

    /** @dev Represents a confirmation of a consumation. Only the contract owner can call this function.
      * @param charityID ID of the charity
      * @param donations number of consumed donations
    */
    function consumeDonation(uint charityID, uint donations) public isMsgSenderOwner {
      require(charities[charityID].status == CharityStatus.Active);
      int balance = int(charities[charityID].soldDonations - charities[charityID].consumedDonations - donations);
      require(balance >= 0);
      charities[charityID].consumedDonations+= donations;
      emit LogDonationConsumed(charityID, donations);
    }

    /** @dev Represents a closing of a charity. Only the contract owner can call this function.
      * @param charityID ID of the charity
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
