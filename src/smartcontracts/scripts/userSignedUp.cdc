import ChessOracleElo from 0xed4dad55d4060467
import ChessKnights from 0xed4dad55d4060467

pub fun main(acct:Address): Bool {
    var amount: UInt64 = 0
    let user = getAccount(acct)
    let userCapability = user.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath).borrow()
    let userCapability2 = user.getCapability<&AnyResource{ChessKnights.UserProfilePublicInterface}>(ChessKnights.userProfilePublicPath).borrow()
    if(userCapability!=nil){
        amount = amount + 1
    }
    if(userCapability2!=nil){
        amount = amount + 1
    }

    if(amount<2){
        return false
    }else{
        return true
    }
}