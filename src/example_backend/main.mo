import Array "mo:base/Array";

actor {

  // Define the Child type
  public type Child = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    gender : Text;
    motherName : Text;
    fatherName : Text;
    weight : Text;
    province : Text;
    district : Text;
    sector : Text;
    cell : Text;
    birthDate : Text;
  };

  // State variables
  stable var children : [Child] = [];
  var nextId : Nat = 0;

  // Query function to fetch all children
  public query func getChildren() : async [Child] {
    return children;
  };

  // Function to add a new child
  public func addChild(firstName : Text, lastName : Text, gender : Text, motherName : Text, fatherName : Text, weight : Text, province : Text, district : Text, sector : Text, cell : Text, birthDate : Text) : async () {
    let newChild : Child = {
      id = nextId;
      firstName = firstName;
      lastName = lastName;
      gender = gender;
      motherName = motherName;
      fatherName = fatherName;
      weight = weight;
      province = province;
      district = district;
      sector = sector;
      cell = cell;
      birthDate = birthDate;
    };
    children := Array.append<Child>(children, [newChild]);
    nextId := nextId + 1;
  };

  // Function to update an existing child by id
  public func updateChild(id : Nat, firstName : Text, lastName : Text, gender : Text, motherName : Text, fatherName : Text, weight : Text, province : Text, district : Text, sector : Text, cell : Text, birthDate : Text) : async () {
    children := Array.map<Child, Child>(children, func(child : Child) : Child {
      if (child.id == id) {
        return {
          id = id;
          firstName = firstName;
          lastName = lastName;
          gender = gender;
          motherName = motherName;
          fatherName = fatherName;
          weight = weight;
          province = province;
          district = district;
          sector = sector;
          cell = cell;
          birthDate = birthDate;
        };
      } else {
        return child;
      }
    });
  };

  // Function to delete a child by id
  public func deleteChild(id : Nat) : async () {
    children := Array.filter<Child>(children, func(child : Child) : Bool {
      child.id != id
    });
  };
};
