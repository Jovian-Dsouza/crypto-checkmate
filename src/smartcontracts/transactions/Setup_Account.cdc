import ChessOracleElo from 0x01
import ChessKnights from 0x01

transaction(name: String) {

  prepare(acct: AuthAccount) {
    
    //SETUP CHESS ORACLE ACCOUNT IF ITS NOT
    // extract Profile resource of the account
    let profilecopy <- acct.load<@AnyResource{ChessOracleElo.ProfilePublicInterface}>(from: ChessOracleElo.profileStoragePath)
    // if there is not any resrource of the profile create one else save the extracted one
    if(profilecopy == nil){
      //get the user address as required field for the function
      let address = acct.address.toString()

      //create a new UserSwitchBoard resource
      let newUserProfileResource <- ChessOracleElo.createNewProfile(userAddress: acct.address)

      //save the resource in account storage
      acct.save(<- newUserProfileResource,to:ChessOracleElo.profileStoragePath)
    
      //create a private link to the storage path
      acct.link<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath,target:ChessOracleElo.profileStoragePath)
      log("account profile created")
      // destroy the resource as its null
      destroy profilecopy
    }else{
      // save the extracted resource
      // We use the force-unwrap operator `!` to get the value
      // out of the optional. It aborts if the optional is nil
      acct.save(<-profilecopy!,to:ChessOracleElo.profileStoragePath)
      log("account profile was already created")
    }
    //SETUP ChessKnights ACCOUNT IF ITS NOT
    // extract Profile resource of the account
    let profilecopyknights <- acct.load<@AnyResource{ChessKnights.UserProfilePublicInterface}>(from: ChessKnights.userProfileStoragePath)
    // if there is not any resrource of the profile create one else save the extracted one
    if(profilecopyknights == nil){
      //create a new UserSwitchBoard resource
      let newUserProfileResource <- ChessKnights.createProfile(name:name)

      //save the resource in account storage
      acct.save(<- newUserProfileResource,to:ChessKnights.userProfileStoragePath)
    
      //create a private link to the storage path
      acct.link<&AnyResource{ChessKnights.UserProfilePublicInterface}>(ChessKnights.userProfilePublicPath,target:ChessKnights.userProfileStoragePath)
      log("account profile created")
      // destroy the resource as its null
      destroy profilecopyknights
    }else{
      // save the extracted resource
      // We use the force-unwrap operator `!` to get the value
      // out of the optional. It aborts if the optional is nil
      acct.save(<-profilecopyknights!,to:ChessKnights.userProfileStoragePath)
      log("account profile was already created")
    }

  }

  execute {
  }
}
