import ChessOracleElo from 0x01

pub fun main(address: Address): ChessOracleElo.UserData {
  //get capability of for the user profile
  let addr = getAccount(address)
  let ref = addr.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath).borrow() ?? panic("no user profile")
  //get the userData of the account
  let userData = ref.getProfileData()
  log(userData)
  return userData
}
