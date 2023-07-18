import ChessOracleElo from 0x01
import ChessKnights from 0x01

transaction {

  prepare(acct: AuthAccount) {
    //get elo vault
    let resource <- acct.load<@ChessOracleElo.Profile>(from: ChessOracleElo.profileStoragePath) ?? panic("user has not started his account")
    let elo <- resource.withdrawEloForaMatch()
    //enter matchmaking
    let uuid = ChessKnights.enterMatchMaking(player1: acct.address, elo: <- elo)
    //extract the chessknights resource
    let resourceknights <- acct.load<@ChessKnights.UserProfile>(from: ChessKnights.userProfileStoragePath) ?? panic("user has not started his account")
    //set the active game uuid
    resourceknights.updateOnGoingGameUuid(uuid: uuid)
    //save back the user resources
    acct.save(<-resource,to:ChessOracleElo.profileStoragePath)
    acct.save(<-resourceknights,to:ChessKnights.userProfileStoragePath)
    log(uuid)
  }

  execute {
  }
}
